/*
 * @Author: Paynter Chen
 * @Date: 2019-07-11 13:25:10
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { IApiContract, IRequestResponse, IApiPath } from '../types';
import { createResponse } from '../mocks/server/utils';

import assert = require('assert');

export function readJson<
  A extends IApiContract<any, any> = IApiContract<any, any>,
  ReqData = A extends IApiContract<infer B, any> ? B : any,
  ResData = A extends IApiContract<any, infer B> ? B : any
>(json: IRequestResponse<ReqData, ResData>) {
  ['path', 'method', 'request', 'response'].forEach(k => assert(json[k], `json lack of property[${k}]`),);
  return json;
}

export function createApiResponse<T extends IApiContract>(
  options: IApiPath<T>,
  response: Partial<T['response']>,
) {
  return {
    type: 'request-response',
    via: 'mock',
    response: createResponse(response),
    request: {
      method: options.method,
      path: options.path,
    } as any,
    host: options.host,
    method: options.method,
    path: options.path,
  } as IRequestResponse<T['request']['data'], T['response']['data']>;
}
