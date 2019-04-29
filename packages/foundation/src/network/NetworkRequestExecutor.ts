/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-06-04 15:41:53
 * Copyright © RingCentral. All rights reserved.
 */
import BaseClient from './client/BaseClient';
import { HttpResponseBuilder } from './client/http';

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
  NETWORK_FAIL_TEXT,
  SURVIVAL_MODE,
  IRequestDecoration,
  NETWORK_HANDLE_TYPE,
  RetryStrategy,
  RESPONSE_STATUS_CODE,
} from './network';
import { SERVER_ERROR_CODE, DEFAULT_RETRY_COUNT } from './Constants';
import { doResponseLog, doRequestLog } from './log';
import { networkLogger } from '../log';

const DEFAULT_RETRY_STRATEGY: RetryStrategy = (
  doRetry: () => void,
  retryCounter: number,
) => {
  setTimeout(doRetry, 3000);
};

export class NetworkRequestExecutor
  implements INetworkRequestExecutorListener, INetworkRequestExecutor {
  request: IRequest;
  via: NETWORK_VIA;
  handlerType: IHandleType;
  retryCount: number = DEFAULT_RETRY_COUNT;
  retryCounter: number = 0;
  retryStrategy: RetryStrategy;
  client: BaseClient;
  status: NETWORK_REQUEST_EXECUTOR_STATUS =
    NETWORK_REQUEST_EXECUTOR_STATUS.IDLE;
  isComplete: boolean = false;
  responseListener: IResponseListener;
  listener?: INetworkRequestConsumerListener;

  private _requestDecoration?: IRequestDecoration;

  constructor(
    request: IRequest,
    client: BaseClient,
    decoration?: IRequestDecoration,
  ) {
    this.request = request;
    this.via = request.via;
    this.handlerType = request.handlerType;
    this.retryCount = request.retryCount;
    this.retryStrategy = request.retryStrategy || DEFAULT_RETRY_STRATEGY;
    this.client = client;
    this._requestDecoration = decoration;
  }

  onSuccess(response: IResponse): void {
    if (this._isCompletion()) {
      return;
    }

    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
    this._callXApiResponseCallback(response);
    doResponseLog(response);
  }

  onFailure(response: IResponse): void {
    networkLogger.log('TCL: onFailure', ' executor status:', this.status);

    if (this._isCompletion()) {
      return;
    }

    if (this.canRetry(response) && this.retryCounter < this.retryCount) {
      networkLogger.log(
        'TCL: _retry',
        ' counter/total',
        `${this.retryCounter}/${this.retryCount}`,
      );
      this._retry();
    } else {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      this._callXApiResponseCallback(response);
      doResponseLog(response);
    }
  }

  getRequest() {
    return this.request;
  }

  execute() {
    if (this.client.isNetworkReachable()) {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.EXECUTING;
      this._performNetworkRequest();
    } else {
      this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
      this._callXApiResponse(
        RESPONSE_STATUS_CODE.LOCAL_NOT_NETWORK_CONNECTION,
        NETWORK_FAIL_TEXT.NOT_NETWORK_CONNECTION,
      );
    }
  }

  cancel() {
    if (this._isCompletion()) {
      return;
    }

    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
    this._cancelClientRequest();
    this._callXApiResponse(
      RESPONSE_STATUS_CODE.LOCAL_CANCELLED,
      NETWORK_FAIL_TEXT.CANCELLED,
    );
  }

  isPause() {
    return this.status === NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
  }

  canRetry(response: IResponse) {
    if (response.status <= 0) {
      return response.status === RESPONSE_STATUS_CODE.NETWORK_ERROR;
    }
    return response.status >= 500;
  }

  private _isCompletion() {
    return this.status === NETWORK_REQUEST_EXECUTOR_STATUS.COMPLETION;
  }

  private _performNetworkRequest() {
    networkLogger.info('_performNetworkRequest()');
    if (this._requestDecoration) {
      this._requestDecoration.decorate(this.request);
    }
    doRequestLog(this.request);
    this.client.request(this.request, this);
  }

  private _notifyCompletion() {
    if (this.listener) {
      this.listener.onConsumeFinished(this);
    }
  }

  private _retry() {
    this.retryCounter += 1;
    this.retryStrategy(this.execute, this.retryCounter);
  }

  private _cancelClientRequest() {
    this.client.cancelRequest(this.request);
  }

  private _callXApiResponseCallback(response: IResponse) {
    switch (response.status) {
      case RESPONSE_STATUS_CODE.UNAUTHORIZED:
        this._handle401XApiCompletionCallback(response);
        return;
      case RESPONSE_STATUS_CODE.BAD_GATEWAY:
        this._handle502XApiCompletionCallback(response);
        break;
      case RESPONSE_STATUS_CODE.SERVICE_UNAVAILABLE:
        this._handle503XApiCompletionCallback(response);
        break;
      case RESPONSE_STATUS_CODE.DEFAULT:
        response.request = this.request;
        break;
    }

    this._callXApiCompletionCallback(response);
  }

  private _callXApiResponse(status: RESPONSE_STATUS_CODE, statusText: string) {
    const response = HttpResponseBuilder.builder
      .setStatus(status)
      .setStatusText(statusText)
      .setRequest(this.request)
      .build();
    this._callXApiResponseCallback(response);
  }

  private _callXApiCompletionCallback(response: IResponse) {
    const { callback } = this.request;
    if (callback) {
      this._notifyCompletion();
      callback(response);
    }
  }

  private _handle401XApiCompletionCallback(response: IResponse) {
    this.status = NETWORK_REQUEST_EXECUTOR_STATUS.PAUSE;
    this._removeAuthorization();
    this.responseListener &&
      this.responseListener.onAccessTokenInvalid(this.handlerType);
  }

  private _removeAuthorization() {
    this.request.headers.Authorization &&
      delete this.request.headers.Authorization;
  }

  private _handle502XApiCompletionCallback(response: IResponse) {
    this.responseListener &&
      this.responseListener.onSurvivalModeDetected(SURVIVAL_MODE.OFFLINE, 0);
  }

  private _handle503XApiCompletionCallback(response: IResponse) {
    if (response.request.handlerType.name !== NETWORK_HANDLE_TYPE.RINGCENTRAL) {
      return;
    }
    if (response.data && this._isCMN211Error(response.data)) {
      this.responseListener &&
        this.responseListener.onSurvivalModeDetected(
          SURVIVAL_MODE.SURVIVAL,
          response.retryAfter,
        );
    }
  }

  private _isCMN211Error(data: any) {
    return this._isServerErrorCodeMatched(data, SERVER_ERROR_CODE.CMN211);
  }

  private _isServerErrorCodeMatched(data: any, errorCode: string): boolean {
    if (data.hasOwnProperty('errorCode') && data.errorCode === errorCode) {
      return true;
    }
    if (data.hasOwnProperty('errors')) {
      const errors = data.errors;
      if (Array.isArray(errors)) {
        return errors.some((error: any) => {
          return (
            error.hasOwnProperty('errorCode') && error.errorCode === errorCode
          );
        });
      }
    }
    return false;
  }
}
