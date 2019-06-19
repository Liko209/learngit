import {
  IRouter,
  RouterHandler,
  PathMatcher,
  IRequest,
  INetworkRequestExecutorListener,
} from './types';
import _ from 'lodash';
import { IResponse } from 'foundation/src/network/network';
import { IApi, IResponseAdapter } from './glip/types';

// import 'mitm';
export class Router implements IRouter {
  private _routes: {
    [key: string]: { path: string; handler: RouterHandler }[];
  } = {};

  constructor(
    public pathMatcher: PathMatcher = (routerPath, path) => routerPath === path,
    public adapter: IResponseAdapter,
  ) {}

  setPathMatcher(matcher: PathMatcher) {
    this.pathMatcher = matcher;
  }

  dispatch(request: IRequest, cb: INetworkRequestExecutorListener) {
    const array = this._routes[request.method] || [];
    const target = _.find(array, it => this.pathMatcher(it.path, request.path));
    if (target) {
      target.handler(request, cb);
    } else {
      // cb(null, [404, 'mock: Route Not Found']);
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
        const routerHandler = this.adapter.adapt(request =>
          api[path][verb](request),
        );
        this.use(verb, path, routerHandler);
      });
    });
  }

  use(method: string, path: string, handler: RouterHandler) {
    this._routes[method] = this._routes[method] || [];
    this._routes[method].push({
      path,
      handler,
    });
    return this;
  }
}
