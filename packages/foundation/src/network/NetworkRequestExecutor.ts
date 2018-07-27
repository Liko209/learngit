/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:53
 * Copyright © RingCentral. All rights reserved.
 */
import BaseClient from './client/BaseClient';
import { Response } from './client/http';
import doLog from './log';

import {
  INetworkRequestExecutorListener,
  INetworkRequestExecutor,
  IHandleType,
  NETWORK_VIA,
  IRequest,
  NETWORK_REQUEST_EXECUTOR_STATUS,
  IResponseListener,
  INetworkRequestConsumerListener,
  IResponse,
  NETWORK_FAIL_TYPE,
  HTTP_STATUS_CODE,
  SURVIVAL_MODE
} from '.';

export class NetworkRequestExecutor
implements INetworkRequestExecutorListener, INetworkRequestExecutor {
  request: IRequest;
  via: NETWORK_VIA;
  handlerType: IHandleType;
  retryCount: number = 10;
  client: BaseClient;
  status: NETWORK_REQUEST_EXECUTOR_STATUS =
    NETWORK_REQUEST_EXECUTOR_STATUS.IDLE;
  isComplete: boolean = false;
  responseListener: IResponseListener;
  listener?: INetworkRequestConsumerListener;

  constructor(request: IRequest, client: BaseClient) {
    this.request = request;
    this.via = request.via;
    this.handlerType = request.handlerType;
    this.retryCount = request.retryCount;
    this.client = client;
  }

  onSuccess(requestId: string, response: IResponse): void {
    if (this.isCompletion()) {
      return;
    }

    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
    this.callXApiResponseCallback(response);
    doLog(response);
  }

  onFailure(requestId: string, response: IResponse): void {
    if (this.isCompletion()) {
      return;
    }

    if (
      response.statusText !== NETWORK_FAIL_TYPE.TIME_OUT ||
      this.retryCount === 0
    ) {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      this.callXApiResponseCallback(response);
      doLog(response);
    } else {
      this.retry();
    }
  }

  getRequest() {
    return this.request;
  }

  execute() {
    if (this.client.isNetworkReachable()) {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      this.performNetworkRequest();
    } else {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      this.callXApiResponse(0, NETWORK_FAIL_TYPE.NOT_NETWORK_CONNECTION);
    }
  }

  cancel() {
    if (this.isCompletion()) {
      return;
    }

    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
    this.cancelClientRequest();
    this.callXApiResponse(0, NETWORK_FAIL_TYPE.CANCELLED);
  }

  isPause() {
    return this.status === NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
  }

  private isCompletion() {
    return this.status === NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
  }

  private performNetworkRequest() {
    this.client.request(this.request, this);
  }

  private notifyCompletion() {
    if (this.listener) {
      this.listener.onConsumeFinished(this);
    }
  }

  private retry() {
    this.retryCount -= 1;
    if (this.retryCount > 0) {
      this.execute();
    } else {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      this.cancelClientRequest();
      this.callXApiResponse(0, NETWORK_FAIL_TYPE.TIME_OUT);
    }
  }

  private cancelClientRequest() {
    this.client.cancelRequest(this.request);
  }

  private callXApiResponseCallback(response: IResponse) {
    switch (response.status) {
      case HTTP_STATUS_CODE.UNAUTHORIZED:
        this.handle401XApiCompletionCallback(response);
        break;
      case HTTP_STATUS_CODE.FORBIDDEN:
        this.handle403XApiCompletionCallback(response);
        break;
      case HTTP_STATUS_CODE.BAD_GATEWAY:
        this.handle502XApiCompletionCallback(response);
        break;
      case HTTP_STATUS_CODE.SERVICE_UNAVAILABLE:
        this.handle503XApiCompletionCallback(response);
        break;
      default:
        this.callXApiCompletionCallback(response);
    }
  }

  private callXApiResponse(status: HTTP_STATUS_CODE, statusText: string) {
    const response = Response.builder
      .setStatus(status)
      .setStatusText(statusText)
      .setRequest(this.request)
      .build();
    this.callXApiResponseCallback(response);
  }

  private callXApiCompletionCallback(response: IResponse) {
    const { callback } = this.request;
    if (callback) {
      this.notifyCompletion();
      callback(response);
    }
  }

  private handle401XApiCompletionCallback(response: IResponse) {
    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
    this.responseListener.onAccessTokenInvalid(this.handlerType);
  }

  private handle403XApiCompletionCallback(response: IResponse) {
    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
    this.responseListener.onAccessTokenInvalid(this.handlerType);
  }

  private handle502XApiCompletionCallback(response: IResponse) {
    this.responseListener.onSurvivalModeDetected(SURVIVAL_MODE.OFFLINE, 0);
  }

  private handle503XApiCompletionCallback(response: IResponse) {
    const { retryAfter } = response;
    this.responseListener.onSurvivalModeDetected(
      SURVIVAL_MODE.SURVIVAL,
      retryAfter
    );
  }
}
