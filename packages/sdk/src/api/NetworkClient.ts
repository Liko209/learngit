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
  NETWORK_FAIL_TEXT,
} from 'foundation/network';
import { networkLogger } from 'foundation/log';
import { RequestHolder } from './requestHolder';
import { omitLocalProperties, serializeUrlParams } from '../utils';
import { responseParser } from './parser';
import _ from 'lodash';

export type IBaseQuery = {
  via?: NETWORK_VIA;
  host?: string;
  path: string;
  data?: object;
  headers?: object;
  params?: object;
  authFree?: boolean;
  retryCount?: number;
  ignoreNetwork?: boolean;
  requestConfig?: object;
  priority?: REQUEST_PRIORITY;
  HAPriority?: HA_PRIORITY;
  timeout?: number;
  pathPrefix?: string;
  channel?: string;
  method?: NETWORK_METHOD;
};

export type IQuery = IBaseQuery & {
  method: NETWORK_METHOD;
};

export interface IResponse<T> {
  status: number;
  data: T;
  headers: object;
}

export interface INetworkRequests {
  readonly host?: string;
  readonly pathPrefix?: string;
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

const LOG_TAG = '[NetworkClient]';
export default class NetworkClient {
  networkRequests: INetworkRequests;
  pathPrefix?: string;
  apiMap: Map<
    string,
    { resolve: IResultResolveFn<any>; reject: IResponseRejectFn }[]
  >;
  defaultVia: NETWORK_VIA;
  networkManager: NetworkManager;

  // todo refactor config
  constructor(
    networkRequests: INetworkRequests,
    defaultVia: NETWORK_VIA,
    networkManager: NetworkManager,
  ) {
    this.networkRequests = networkRequests;
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

    const request = response.request;
    if (
      response.statusText === NETWORK_FAIL_TEXT.SOCKET_DISCONNECTED &&
      request &&
      request.via === NETWORK_VIA.ALL
    ) {
      networkLogger
        .tags(LOG_TAG)
        .info(
          'request() switch request for id:',
          request.id,
          'path:',
          request.path,
        );
      return await this.request(query, requestHolder);
    }
    networkLogger.tags(LOG_TAG).info('request fail:', request);
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
        isDuplicated =
          !apiMapKey.includes('index') && this.apiMap.has(apiMapKey);
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
      ignoreNetwork,
      priority = REQUEST_PRIORITY.NORMAL,
      HAPriority = HA_PRIORITY.BASIC,
      timeout,
      pathPrefix,
      channel,
    } = query;

    const finalPathPrefix =
      (pathPrefix !== undefined
        ? pathPrefix
        : this.networkRequests.pathPrefix) || '';
    const finalPath = `${finalPathPrefix}${path}`;
    return new NetworkRequestBuilder()
      .setHost(query.host || this.networkRequests.host || '')
      .setHandlerType(this.networkRequests.handlerType)
      .setPath(finalPath)
      .setMethod(method)
      .setData(data || {})
      .setHeaders(headers || {})
      .setParams(params || {})
      .setAuthfree(authFree || false)
      .setRequestConfig(requestConfig || {})
      .setRetryCount(retryCount || 0)
      .setIgnoreNetwork(!!ignoreNetwork)
      .setTimeout(timeout || DEFAULT_TIMEOUT_INTERVAL)
      .setVia(via)
      .setNetworkManager(this.networkManager)
      .setPriority(priority)
      .setHAPriority(HAPriority)
      .setChannel(channel || '');
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
  get<T>(baseQuery: IBaseQuery) {
    const query = _.extend(baseQuery, { method: NETWORK_METHOD.GET });
    return this.http<T>(query);
  }

  /**
   * @export
   * @param {String} path request url
   * @param {Object} [data={}] request params
   * @param {Object} [data={}] request headers
   * @returns Promise
   */
  post<T>(baseQuery: IBaseQuery) {
    return this.request<T>({
      ...baseQuery,
      data: omitLocalProperties(baseQuery.data || {}),
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
  put<T>(baseQuery: IBaseQuery) {
    return this.http<T>({
      ...baseQuery,
      data: omitLocalProperties(baseQuery.data || {}),
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
  delete<T>(baseQuery: IBaseQuery) {
    const query = _.extend(baseQuery, { method: NETWORK_METHOD.DELETE });
    return this.http<T>(query);
  }

  send<T>(baseQuery: IBaseQuery) {
    return this.http<T>({
      method: NETWORK_METHOD.GET, // this value is useless if channel is not request
      ...baseQuery, // if baseQuery has method value it will override the former value
      data: omitLocalProperties(baseQuery.data || {}),
    });
  }

  private _needCheckDuplicated(method: NETWORK_METHOD) {
    return method === NETWORK_METHOD.GET || method === NETWORK_METHOD.DELETE;
  }
}
