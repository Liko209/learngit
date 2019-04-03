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
  DEFAULT_TIMEOUT_INTERVAL,
  HA_PRIORITY,
  REQUEST_PRIORITY,
} from 'foundation';
import { RequestHolder } from './requestHolder';
import { omitLocalProperties, serializeUrlParams } from '../utils';
import { responseParser } from './parser';

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
  priority?: REQUEST_PRIORITY;
  HAPriority?: HA_PRIORITY;
  timeout?: number;
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
  (value: T | PromiseLike<T>): void;
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

  private _buildApiKey(query: IQuery) {
    const { path, params, method } = query;
    return `${path}_${method}_${serializeUrlParams(params || {})}`;
  }

  private _saveApiCallback(
    apiMapKey: string,
    resolve: IResultResolveFn<any>,
    reject: IResponseRejectFn,
  ) {
    const promiseResolvers = this.apiMap.get(apiMapKey) || [];
    promiseResolvers.push({ resolve, reject });
    this.apiMap.set(apiMapKey, promiseResolvers);
  }

  async request<T>(query: IQuery, requestHolder?: RequestHolder): Promise<T> {
    const response = await this.rawRequest(query, requestHolder);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw responseParser.parse(response);
  }

  rawRequest<T>(
    query: IQuery,
    requestHolder?: RequestHolder,
  ): Promise<BaseResponse> {
    return new Promise((resolve, reject) => {
      let isDuplicated = false;
      const { method } = query;
      const request = this.getRequestByVia<T>(query, query.via);
      if (this._needCheckDuplicated(method)) {
        const apiMapKey = this._buildApiKey(query);
        isDuplicated = this.apiMap.has(apiMapKey);
        this._saveApiCallback(apiMapKey, resolve, reject);

        if (!isDuplicated) {
          request.callback = (resp: BaseResponse) => {
            const promiseResolvers = this.apiMap.get(apiMapKey);
            if (promiseResolvers) {
              promiseResolvers.forEach(({ resolve }) => {
                resolve(resp);
              });
              this.apiMap.delete(apiMapKey);
            }
          };
        }
      } else {
        request.callback = (resp: BaseResponse) => {
          resolve(resp);
        };
      }

      if (!isDuplicated) {
        this.networkManager.addApiRequest(request);

        if (requestHolder) {
          requestHolder.request = request;
        }
      }
    });
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
      priority,
      HAPriority,
      timeout,
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
      .setTimeout(timeout || DEFAULT_TIMEOUT_INTERVAL)
      .setVia(via)
      .setNetworkManager(this.networkManager)
      .setPriority(priority ? priority : REQUEST_PRIORITY.NORMAL)
      .setHAPriority(HAPriority ? HAPriority : HA_PRIORITY.BASIC);
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
    priority?: REQUEST_PRIORITY,
    HAPriority?: HA_PRIORITY,
    timeout?: number,
  ) {
    return this.http<T>({
      path,
      params,
      headers,
      via,
      requestConfig,
      retryCount,
      priority,
      HAPriority,
      timeout,
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
  post<T>(path: string, data = {}, headers = {}, timeout?: number) {
    return this.request<T>({
      path,
      headers,
      timeout,
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
  put<T>(path: string, data = {}, headers = {}, timeout?: number) {
    return this.http<T>({
      path,
      headers,
      timeout,
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
  delete<T>(path: string, params = {}, headers = {}, timeout?: number) {
    return this.http<T>({
      path,
      params,
      headers,
      timeout,
      method: NETWORK_METHOD.DELETE,
    });
  }

  private _needCheckDuplicated(method: NETWORK_METHOD) {
    return method === NETWORK_METHOD.GET || method === NETWORK_METHOD.DELETE;
  }
}
