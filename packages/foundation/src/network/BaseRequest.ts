/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-05-15 16:26:40
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IRequest,
  IHandleType,
  REQUEST_PRIORITY,
  NETWORK_VIA,
  NETWORK_METHOD,
  Header,
  HA_PRIORITY,
  IResponse,
} from './network';

abstract class BaseRequest implements IRequest {
  id: string;
  path: string;
  method: NETWORK_METHOD;
  data: string | object;
  headers: Header;
  params: object;
  handlerType: IHandleType;
  priority: REQUEST_PRIORITY;
  via: NETWORK_VIA;
  retryCount: number;
  ignoreNetwork: boolean;
  host: string;
  timeout: number;
  requestConfig: object;
  authFree: boolean;
  HAPriority: HA_PRIORITY;
  startTime: number = Date.now();
  callback?: (response: IResponse) => void;

  needAuth(): boolean {
    throw new Error('Method not implemented.');
  }
  constructor(builder: IRequest) {
    this.id = builder.id;
    this.path = builder.path;
    this.method = builder.method;
    this.data = builder.data;
    this.headers = builder.headers;
    this.params = builder.params;
    this.authFree = builder.authFree;
    this.host = builder.host;
    this.handlerType = builder.handlerType;
    this.requestConfig = builder.requestConfig;
    this.timeout = builder.timeout;
    this.retryCount = builder.retryCount;
    this.ignoreNetwork = builder.ignoreNetwork;
    this.priority = builder.priority;
    this.HAPriority = builder.HAPriority;
    this.via = builder.via;
    this.callback = (builder as IRequest).callback;
    this.startTime = builder.startTime;
  }
}
export default BaseRequest;
