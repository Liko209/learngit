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
} from './network';

abstract class BaseRequest implements IRequest {
  handlerType: IHandleType;
  priority: REQUEST_PRIORITY;
  via: NETWORK_VIA;
  retryCount: number;
  host: string;
  timeout: number;
  requestConfig: object;
  authFree: boolean;
  HAPriority: HA_PRIORITY;

  needAuth(): boolean {
    throw new Error('Method not implemented.');
  }
  constructor(
    readonly id: string,
    readonly path: string,
    readonly method: NETWORK_METHOD,
    public data: object | string,
    public headers: Header,
    public params: object,
  ) {
    this.id = id;
    this.path = path;
    this.method = method;
    this.data = data;
    this.headers = headers;
    this.params = params;
  }
}
export default BaseRequest;
