import {
  IRouter,
  RouterHandler,
  PathMatcher,
  IRequest,
  INetworkRequestExecutorListener,
} from './types';
import _ from 'lodash';
import { IResponse } from 'foundation/network/network';
import { IApi, IResponseAdapter } from './glip/types';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
const debug = createDebug('Router');

// import 'mitm';
export class Router implements IRouter {
  private _routes: {
    [key: string]: {
      path: string;
      handler: RouterHandler;
      regexp: RegExp;
      keys: pathToRegexp.Key[];
    }[];
  } = {};

  constructor(public adapter: IResponseAdapter) {}

  dispatch(request: IRequest, cb: INetworkRequestExecutorListener) {
    const array = this._routes[request.method] || [];
    const target = _.find(array, it => it.regexp.test(request.path));
    if (target) {
      // debug('dispatch -> target', request.path, target);
      const result = target.regexp.exec(request.path);
      const routeParams = {};
      result &&
        target.keys.forEach(({ name }, index) => {
          routeParams[name] = result[index + 1];
        });
      target.handler(request, cb, routeParams);
    } else {
      debug('no rule match', request.path);
      cb.onFailure({
        request,
        data: {},
        status: 404,
        statusText: 'Mock data not found',
        headers: {},
      } as IResponse);
    }
  }

  applyApi(api: IApi) {
    _.keys(api).forEach(path => {
      _.keys(api[path]).forEach(verb => {
        const routerHandler = this.adapter.adapt((request, routeParams) =>
          api[path][verb](request, routeParams),
        );
        this.use(verb, path, routerHandler);
      });
    });
  }

  use(method: string, path: string, handler: RouterHandler) {
    this._routes[method] = this._routes[method] || [];
    const keys: pathToRegexp.Key[] = [];
    const regexp = pathToRegexp(path, keys);
    this._routes[method].push({
      path,
      handler,
      regexp,
      keys,
    });
    return this;
  }
}
