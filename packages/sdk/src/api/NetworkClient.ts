/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:07:23
 * Copyright © RingCentral. All rights reserved.
 */

import {
  NetworkManager,
  NetworkRequestBuilder,
  NETWORK_VIA,
  IHandleType,
  IRequest,
  NETWORK_METHOD,
  Response,
} from 'foundation';

// import logger from './logger';
import { serializeUrlParams } from '../utils';

const { GET, DELETE } = NETWORK_METHOD;

export interface IQuery {
  via?: NETWORK_VIA;
  path: string;
  method: NETWORK_METHOD;
  data?: object;
  headers?: object;
  params?: object;
  authFree?: boolean;
  requestConfig?: object;
}

export interface IResponse<T> {
  status: number;
  data: T;
  headers: object;
}

export interface INetworkRequests {
  readonly host?: string;
  readonly handlerType: IHandleType;
}

export interface IResponseResolveFn<T = {}> {
  (value: IResponse<T> | PromiseLike<IResponse<T>>): void;
}

export interface IResponseRejectFn {
  (value: object | PromiseLike<object>): void;
}

export default class NetworkClient {
  networkRequests: INetworkRequests;
  apiPlatform: string;
  apiMap: Map<string, { resolve: IResponseResolveFn<any>; reject: IResponseRejectFn }[]>;
  // todo refactor config
  constructor(networkRequests: INetworkRequests, apiPlatform: string) {
    this.apiPlatform = apiPlatform;
    this.networkRequests = networkRequests;
    this.apiMap = new Map();
  }

  request<T>(query: IQuery): Promise<IResponse<T>> {
    const { via, path, method, params } = query;
    return new Promise((resolve, reject) => {
      const apiMapKey = `${path}_${method}_${serializeUrlParams(params || {})}`;

      const promiseResolvers = this.apiMap.get(apiMapKey) || [];
      promiseResolvers.push({ resolve, reject });
      this.apiMap.set(apiMapKey, promiseResolvers);

      if (!this._isDuplicate(method, apiMapKey)) {
        const request = this.getRequestByVia<T>(query, via);
        request.callback = this.buildCallback<T>(apiMapKey);
        NetworkManager.Instance.addApiRequest(request);
      }
    });
  }

  buildCallback<T>(apiMapKey: string) {
    return (resp: Response) => {
      const promiseResolvers = this.apiMap.get(apiMapKey);
      if (!promiseResolvers) return;

      if (resp.status >= 200 && resp.status < 300) {
        promiseResolvers.forEach(({ resolve }) =>
          resolve({
            status: resp.status,
            headers: resp.headers,
            data: resp.data as T,
          }),
        );
      } else {
        promiseResolvers.forEach(({ reject }) => {
          console.log('Network reject', resp);
          reject(resp);
        });
      }
      this.apiMap.delete(apiMapKey);
    };
  }

  getRequestByVia<T>(query: IQuery, via: NETWORK_VIA = NETWORK_VIA.HTTP): IRequest {
    const { path, method, data, headers, params, authFree, requestConfig } = query;
    return new NetworkRequestBuilder()
      .setHost(this.networkRequests.host || '')
      .setHandlerType(this.networkRequests.handlerType)
      .setPath(`${this.apiPlatform}${path}`)
      .setMethod(method)
      .setData(data)
      .setHeaders(headers || {})
      .setParams(params)
      .setAuthfree(authFree || false)
      .setRequestConfig(requestConfig || {})
      .setVia(via)
      .build();
    // return via !== 'http' && this.type === 'glip'
    //   ? new SocketRequestBuilder(requestQuery).build()
    //   : new NetworkRequestBuilder(requestQuery);
  }

  http<T>(query: IQuery) {
    return this.request<T>(query);
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  get<T>(path: string, params = {}, via?: NETWORK_VIA, requestConfig?: object, headers = {}) {
    return this.http<T>({
      path,
      params,
      headers,
      via,
      requestConfig,
      method: NETWORK_METHOD.GET,
    });
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  post<T>(path: string, data = {}, headers = {}) {
    return this.request<T>({
      path,
      data,
      headers,
      method: NETWORK_METHOD.POST,
    });
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  put<T>(path: string, data = {}, headers = {}) {
    return this.http<T>({
      path,
      data,
      headers,
      method: NETWORK_METHOD.PUT,
    });
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  delete<T>(path: string, params = {}, headers = {}) {
    return this.http<T>({
      path,
      params,
      headers,
      method: NETWORK_METHOD.DELETE,
    });
  }

  private _isDuplicate(method: NETWORK_METHOD, apiMapKey: string) {
    if (method !== GET && method !== DELETE) {
      return false;
    }

    return this.apiMap.has(apiMapKey);
  }
}
