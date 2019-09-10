/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:42
 * Copyright © RingCentral. All rights reserved.
 */
import { IRouter, IJRequest, IJResponse, RequestHandler } from '../../types';
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { createResponse } from '../utils';
import {
  META_ROUTE,
  META_PARAM_PARAM,
  META_PARAM_CONTEXT,
  META_PARAM_REQUEST,
} from 'shield/sdk/decorators/constants';
import { getMeta, getParamMeta } from 'shield/sdk/decorators/metaUtil';
import { IApiContract, IRoute } from 'shield/sdk/types';

const debug = createDebug('Router');
const error = createDebug('Router', true);

export class Router implements IRouter {
  private _routes: {
    [key: string]: {
      path: string;
      handler: RequestHandler;
      regexp: RegExp;
      keys: pathToRegexp.Key[];
    }[];
  } = {};

  constructor() {}

  applyRoute(
    cls: { new (...params: any): object },
    instance: any,
    context: any,
  ) {
    const routeMetaArray = getMeta<IRoute<IApiContract>>(
      cls.prototype,
      META_ROUTE,
    );

    routeMetaArray.map(({ key, meta }) => {
      const { method = 'get', path, query = {} } = meta;
      const contextParam = getParamMeta(cls.prototype, META_PARAM_CONTEXT, key);
      const queryParam = getParamMeta(cls.prototype, META_PARAM_PARAM, key);
      const requestParam = getParamMeta(cls.prototype, META_PARAM_REQUEST, key);
      this.use(method, path, (request, queryObject = {}) => {
        const params: any[] = [];
        if (queryParam) {
          const queryParams = { ...queryObject };
          Object.entries(query).forEach(([key, value]) => {
            queryParams[key] = (value as any)(queryObject[key]);
          });
          params[queryParam.index] = queryParams;
        }
        if (requestParam) {
          params[requestParam.index] = request;
        }

        if (contextParam) {
          params[contextParam.index] = context;
        }
        return (instance[key] as Function).apply(instance, params);
      });
    });
  }

  match = (option: { method: string; path: string }) => {
    const array = this._routes[option.method] || [];
    const target = _.find(array, it => it.regexp.test(option.path));
    return target ? target.handler : null;
  };

  dispatch = (request: IJRequest) => {
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
    }
    error('no rule match', request.path, request.method);
    return createResponse({
      request,
      data: {},
      status: 404,
      statusText: 'Mock data not found',
      headers: {},
    } as IJResponse);
  };

  use(method: string, path: string, handler: RequestHandler) {
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
