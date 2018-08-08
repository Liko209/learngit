/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:31
 * Copyright © RingCentral. All rights reserved.
 */
import { HttpRequest } from './http';
import SocketRequest from './socket/SocketRequest';

import { generateUUID, generateIncrementId } from '../util';
import config from '../../config';
import NetworkManager from '../NetworkManager';
import BaseRequest from '../BaseRequest';
import {
  IRequestBuilderOption,
  IHandleType,
  REQUEST_PRIORITY,
  NETWORK_VIA,
  NETWORK_METHOD,
  Header,
} from '../network';

class NetworkRequestBuilder implements IRequestBuilderOption {
  id: string = '';
  path: string = '';
  data: any;
  headers: Header;
  host: string;
  requestConfig: object = {};
  params: any;
  retryCount: number = 0;
  authFree: boolean;
  timeout: number = config.timeout;
  handlerType: IHandleType;
  priority: REQUEST_PRIORITY = REQUEST_PRIORITY.NORMAL;
  via: NETWORK_VIA = NETWORK_VIA.HTTP;
  method: NETWORK_METHOD = NETWORK_METHOD.GET;

  options(options: IRequestBuilderOption) {
    const {
      host,
      path,
      method,
      handlerType,
      params,
      data,
      headers,
      authFree,
      requestConfig,
    } = options;

    this.headers = headers || {};
    this.authFree = authFree || false;
    this.method = method;
    this.host = host || '';
    this.path = path;
    this.handlerType = handlerType;
    this.params = params || {};
    this.data = data || {};
    this.requestConfig = requestConfig || {};
    return this;
  }

  /**
   * Setter handlerType
   * @param {IHandleType} value
   */
  public setHandlerType(value: IHandleType) {
    this.handlerType = value;
    return this;
  }

  /**
   * Setter path
   * @param {string} value
   */
  public setPath(value: string) {
    this.path = value;
    return this;
  }

  /**
   * Setter priority
   * @param {REQUEST_PRIORITY} value
   */
  public setPriority(value: REQUEST_PRIORITY) {
    this.priority = value;
    return this;
  }

  /**
   * Setter via
   * @param {NETWORK_VIA} value
   */
  public setVia(value: NETWORK_VIA) {
    this.via = value;
    return this;
  }

  /**
   * Setter retryCount
   * @param {number} value
   */
  public setRetryCount(value: number) {
    this.retryCount = value;
    return this;
  }

  /**
   * Setter data
   * @param {any} value
   */
  public setData(value: any) {
    this.data = value;
    return this;
  }

  /**
   * Setter method
   * @param {string } value
   */
  public setMethod(value: NETWORK_METHOD) {
    this.method = value;
    return this;
  }

  /**
   * Setter headers
   * @param {string } value
   */
  public setHeaders(value: object) {
    this.headers = value;
    return this;
  }

  /**
   * Setter host
   * @param {string } value
   */
  public setHost(value: string) {
    this.host = value;
    return this;
  }

  /**
   * Setter timeout
   * @param {number } value
   */
  public setTimeout(value: number) {
    this.timeout = value;
    return this;
  }

  /**
   * Setter requestConfig
   * @param {object } value
   */
  public setRequestConfig(value: object) {
    this.requestConfig = value;
    return this;
  }

  /**
   * Setter params
   * @param {any} value
   */
  public setParams(value: any) {
    this.params = value;
    return this;
  }

  /**
   * Setter authFree
   * @param {boolean} value
   */
  public setAuthfree(value: boolean) {
    this.authFree = value;
    return this;
  }

  build(): BaseRequest {
    switch (this.via) {
      case NETWORK_VIA.SOCKET:
        this.id = generateIncrementId.get();
        return new SocketRequest(this);
      case NETWORK_VIA.HTTP:
        this.id = generateUUID();
        return new HttpRequest(this);
      case NETWORK_VIA.ALL:
      default:
        this.via = NetworkManager.Instance.clientManager.getAvailableClientType();
        return this.build();
    }
  }
}

export default NetworkRequestBuilder;
