import {
  IRouter,
  RouterHandler,
  // PathMatcher,
  IRequest,
  IResponse,
  IApiMap,
  IResponseAdapter,
  // INetworkRequestExecutorListener,
  Handler,
} from '../../types';
import _ from 'lodash';
// import { IResponse } from 'foundation/network/network';
// import { IApiMap, IResponseAdapter } from './glip/types';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { createResponse } from './utils';
// import { IRequest } from '../../../../../../packages/foundation/src';
const debug = createDebug('Router');

// import 'mitm';
export class Router implements IRouter {
  private _routes: {
    [key: string]: {
      path: string;
      handler: Handler;
      regexp: RegExp;
      keys: pathToRegexp.Key[];
    }[];
  } = {};

  constructor() {}

  match = (option: { method: string; path: string }) => {
    const array = this._routes[option.method] || [];
    const target = _.find(array, it => it.regexp.test(option.path));
    return target ? target.handler : null;
  }

  dispatch = (request: IRequest) => {
    const array = this._routes[request.method] || [];
    const target = _.find(array, it => it.regexp.test(request.path))!;
    if (target) {
      const result = target.regexp.exec(request.path);
      const query = {};
      result &&
        target.keys.forEach(({ name }, index) => {
          query[name] = result[index + 1];
        });
      debug('route dispatch: ', request.method, ': ', request.path);
      return target.handler(request, query);
      // debug('dispatch -> target', request.path, target);
    }
    debug('no rule match', request.path, request.method);
    return createResponse({
      request,
      data: {},
      status: 404,
      statusText: 'Mock data not found',
      headers: {},
    } as IResponse);
  }
  // dispatch(request: IRequest, cb: INetworkRequestExecutorListener) {
  //   const array = this._routes[request.method] || [];
  //   const target = _.find(array, it => it.regexp.test(request.path));
  //   if (target) {
  //     // debug('dispatch -> target', request.path, target);
  //     const result = target.regexp.exec(request.path);
  //     const query = {};
  //     result &&
  //       target.keys.forEach(({ name }, index) => {
  //         query[name] = result[index + 1];
  //       });
  //     target.handler(request, cb, query);
  //   } else {
  //     debug('no rule match', request.path);
  //     cb.onFailure({
  //       request,
  //       data: {},
  //       status: 404,
  //       statusText: 'Mock data not found',
  //       headers: {},
  //     } as IResponse);
  //   }
  // }

  // applyApi(api: IApiMap) {
  //   _.keys(api).forEach(path => {
  //     _.keys(api[path]).forEach(verb => {
  //       const routerHandler = this.adapter.adapt((request, routeParams) =>
  //         api[path][verb](request, routeParams),
  //       );
  //       this.use(verb, path, routerHandler);
  //     });
  //   });
  // }

  use(method: string, path: string, handler: Handler) {
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
