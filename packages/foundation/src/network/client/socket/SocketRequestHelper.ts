/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:43:44
 * Copyright © RingCentral. All rights reserved.
 */
import {
  SocketRequestParamsType,
  default as SocketRequest,
} from './SocketRequest';
import { SocketResponseBuilder } from './SocketResponseBuilder';
import { EventEmitter2 } from 'eventemitter2';
import { NETWORK_FAIL_TYPE } from '../../network';
import { mainLogger } from '../../../log';
import { SocketResponse } from './SocketResponse';
interface ISocketRequestManager {
  newRequest: (requestId: SocketRequest) => void;
  newResponse: (response: any) => void;
}

class SocketRequestHelper implements ISocketRequestManager {
  private emitter: EventEmitter2;
  private requestTimerMap: Map<string, number>;
  constructor() {
    this.emitter = new EventEmitter2();
    this.requestTimerMap = new Map();
  }

  public newRequest(request: SocketRequest): Promise<SocketResponse> {
    return new Promise((resolve, reject) => {
      this.registerRequestListener(request.id, resolve);
      this.setRequestTimer(request, reject);
    });
  }

  public newResponse(response: any) {
    const socketResponse = new SocketResponseBuilder()
      .options(response)
      .build();
    if (socketResponse.request && socketResponse.request.params) {
      const requestId = (socketResponse.request
        .params as SocketRequestParamsType).request_id;
      this.removeRequestTimer(requestId);
      this.handleRegisteredRequest(requestId, socketResponse);
    }
  }

  private registerRequestListener(requestId: string, resolve: any) {
    this.emitter.once(requestId, resolve);
  }

  private handleRegisteredRequest(requestId: string, response: any) {
    mainLogger.info(`[Socket]: Handle request:${requestId}`);
    this.emitter.emit(requestId, response);
  }

  private setRequestTimer(request: SocketRequest, reject: any) {
    const timerId = window.setTimeout(
      this.onRequestTimeout,
      request.timeout,
      request.id,
      reject,
    );
    this.requestTimerMap.set(request.id, timerId);
  }

  private removeRequestTimer(requestId: string) {
    const timerId = this.requestTimerMap.get(requestId);
    window.clearTimeout(timerId);
  }

  private onRequestTimeout(requestId: string, reject: any) {
    mainLogger.info('[Socket]: request timeout');
    const response = new SocketResponseBuilder()
      .setStatus(0)
      .setStatusText(NETWORK_FAIL_TYPE.TIME_OUT)
      .build();
    reject(response);
  }
}
export default SocketRequestHelper;
