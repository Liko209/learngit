/*
 * @Author: Paynter Chen
 * @Date: 2019-07-10 16:18:42
 * Copyright © RingCentral. All rights reserved.
 */
import {
 IRouter, IJRequest, IJResponse, Handler
} from '../../types';
import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';
import { createDebug } from 'sdk/__tests__/utils';
import { createResponse } from './utils';

const debug = createDebug('Router');
const error = createDebug('Router', true);

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
      // debug('dispatch -> target', request.path, target);
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
