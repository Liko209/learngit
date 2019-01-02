/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from './RTCRestApiManager';
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipProvisionInfo } from './types';
import { IResponse } from 'foundation/src/network/network';

enum ERROR_TYPE {
  REQUEST_ERROR,
  PARAME_ERROR,
}

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo;
  private _errorRetryInterval: number = 8; // seconds
  private _reFreshInterval: number = 24 * 3600; // seconds
  private _reFreshTimerId: any = null;

  constructor() {
    super();
  }

  doSipProvRequest(): void {
    const response: IResponse = rtcRestApiManager.sendRequest();

    if (!(<number>response.status >= 200 && <number>response.status < 400)) {
      this._errorHandling(ERROR_TYPE.REQUEST_ERROR, response.retryAfter);
      return;
    }

    const responseData: RTCSipProvisionInfo = response.data;

    if (!this._checkSipProvInfoParame(responseData)) {
      this._errorHandling(ERROR_TYPE.PARAME_ERROR, response.retryAfter);
      return;
    }

    this._onResetTimers();
    if (responseData !== this._sipProvisionInfo) {
      this._sipProvisionInfo = responseData;
      this.emit('newProv', { info: responseData });
    }
  }

  private _onResetTimers() {
    if (this._reFreshTimerId) {
      clearTimeout(this._reFreshTimerId);
    }
    this._reFreshTimerId = setTimeout(() => {
      this.doSipProvRequest();
    },                                this._reFreshInterval);

    this._errorRetryInterval = 8;
  }

  private _errorHandling(type: ERROR_TYPE, retryAfter: number): void {
    let interval: number = 0;
    switch (type) {
      case ERROR_TYPE.REQUEST_ERROR:
        this._errorRetryInterval = Math.min(this._errorRetryInterval * 2, 3600);
        interval = !!retryAfter
          ? Math.max(this._errorRetryInterval, retryAfter)
          : this._errorRetryInterval;
        setTimeout(() => {
          this.doSipProvRequest();
        },         interval * 1000);
        break;
      case ERROR_TYPE.PARAME_ERROR:
        interval = !!retryAfter ? Math.max(7200, retryAfter) : 7200;
        setTimeout(() => {
          this.doSipProvRequest();
        },         interval * 1000);
        break;
      default:
        console.log('the error type %d is not deal with', type);
        break;
    }
  }

  private _checkSipProvInfoParame(info: RTCSipProvisionInfo): boolean {
    let parame_correct: boolean = false;
    try {
      const parame_device =
        info.device instanceof Array ? info.device[0] : info.device;

      parame_correct =
        this._isNotEmptyString(parame_device.authorizationID) &&
        this._isNotEmptyString(parame_device.domain) &&
        this._isNotEmptyString(parame_device.outboundProxy) &&
        this._isNotEmptyString(parame_device.password) &&
        this._isNotEmptyString(parame_device.transport) &&
        this._isNotEmptyString(parame_device.username);
    } catch (error) {
      console.log(error);
    }
    return parame_correct;
  }
  private _isNotEmptyString(data: any) {
    return typeof data === 'string' && data.length > 0;
  }
}

export { RTCProvManager };
