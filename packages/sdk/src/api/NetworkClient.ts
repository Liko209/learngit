/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-02-05 15:07:23
 * Copyright © RingCentral. All rights reserved.
 */
import {
  BaseResponse,
  IHandleType,
  IRequest,
  NETWORK_METHOD,
  NETWORK_VIA,
  NetworkManager,
  NetworkRequestBuilder,
} from 'foundation';
import { RequestHolder } from './requestHolder';
import { omitLocalProperties, serializeUrlParams } from '../utils';
import { ApiResult } from './ApiResult';
import { apiErr, apiOk } from './utils';

export interface IQuery {
  via?: NETWORK_VIA;
  path: string;
  method: NETWORK_METHOD;
  data?: object;
  headers?: object;
  params?: object;
  authFree?: boolean;
  retryCount?: number;
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

export interface IResultResolveFn<T = {}> {
  (value: ApiResult<T> | PromiseLike<ApiResult<T>>): void;
}

export interface IResponseRejectFn {
  (value: object | PromiseLike<object>): void;
}

export interface IResponseError {
  error: {
    code: string;
    http_status_code: number;
    message: string;
  };
  id: number;
}

export default class NetworkClient {
  networkRequests: INetworkRequests;
  apiPlatform: string;
  apiPlatformVersion: string;
  apiMap: Map<
    string,
    { resolve: IResultResolveFn<any>; reject: IResponseRejectFn }[]
  >;
  defaultVia: NETWORK_VIA;
  networkManager: NetworkManager;

  // todo refactor config
  constructor(
    networkRequests: INetworkRequests,
    apiPlatform: string,
    defaultVia: NETWORK_VIA,
    apiPlatformVersion: string = '',
    networkManager: NetworkManager,
  ) {
    this.apiPlatform = apiPlatform;
    this.networkRequests = networkRequests;
    this.apiPlatformVersion = apiPlatformVersion;
    this.apiMap = new Map();
    this.defaultVia = defaultVia;
    this.networkManager = networkManager;
  }

  request<T>(
    query: IQuery,
    requestHolder?: RequestHolder,
  ): Promise<ApiResult<T>> {
    return new Promise((resolve, reject) => {
      const request = this.getRequestByVia<T>(query, query.via);
      request.callback = this._requestCallback(query, resolve, reject);
      if (request.callback) {
        this.networkManager.addApiRequest(request);
      }

      if (requestHolder) {
        requestHolder.request = request;
      }
    });
  }

  private _apiResolvedCallBack(resolve: IResultResolveFn<any>) {
    return (resp: BaseResponse) => {
      if (resp.status >= 200 && resp.status < 300) {
        resolve(apiOk(resp));
      } else {
        resolve(apiErr(resp));
      }
    };
  }

  private _requestCallback<T>(
    query: IQuery,
    resolve: IResultResolveFn<any>,
    reject: IResponseRejectFn,
  ) {
    const { method } = query;
    if (this._needCheckDuplicated(method)) {
      const { path, params } = query;
      const apiMapKey = `${path}_${method}_${serializeUrlParams(params || {})}`;
      const isDuplicated = this.apiMap.has(apiMapKey);
      const promiseResolvers = this.apiMap.get(apiMapKey) || [];
      promiseResolvers.push({ resolve, reject });
      this.apiMap.set(apiMapKey, promiseResolvers);

      if (!isDuplicated) {
        return (resp: BaseResponse) => {
          const promiseResolvers = this.apiMap.get(apiMapKey);
          if (promiseResolvers) {
            promiseResolvers.forEach(({ resolve }) => {
              this._apiResolvedCallBack(resolve)(resp);
            });
            this.apiMap.delete(apiMapKey);
          }
        };
      }
    } else {
      return this._apiResolvedCallBack(resolve);
    }
  }

  cancelRequest(request: IRequest) {
    this.networkManager.cancelRequest(request);
  }

  getRequestByVia<T>(
    query: IQuery,
    via: NETWORK_VIA = this.defaultVia,
  ): IRequest {
    const {
      path,
      method,
      data,
      headers,
      params,
      authFree,
      requestConfig,
      retryCount,
    } = query;
    const versionPath = this.apiPlatformVersion
      ? `/${this.apiPlatformVersion}`
      : '';
    const finalPath = `${versionPath}${this.apiPlatform}${path}`;
    return new NetworkRequestBuilder()
      .setHost(this.networkRequests.host || '')
      .setHandlerType(this.networkRequests.handlerType)
      .setPath(finalPath)
      .setMethod(method)
      .setData(data)
      .setHeaders(headers || {})
      .setParams(params)
      .setAuthfree(authFree || false)
      .setRequestConfig(requestConfig || {})
      .setRetryCount(retryCount || 0)
      .setVia(via)
      .setNetworkManager(this.networkManager)
      .build();
  }

  http<T>(query: IQuery, requestHolder?: RequestHolder) {
    return this.request<T>(query, requestHolder);
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  get<T>(
    path: string,
    params = {},
    via?: NETWORK_VIA,
    requestConfig?: object,
    headers = {},
    retryCount?: number,
  ) {
    return this.http<T>({
      path,
      params,
      headers,
      via,
      requestConfig,
      retryCount,
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
      headers,
      data: omitLocalProperties(data),
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
      headers,
      data: omitLocalProperties(data),
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

  private _needCheckDuplicated(method: NETWORK_METHOD) {
    return method === NETWORK_METHOD.GET || method === NETWORK_METHOD.DELETE;
  }
}
