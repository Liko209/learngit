/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from './RTCRestApiManager';
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipProvisionInfo, RTC_PROV_EVENT } from './types';
import { IResponse } from 'foundation/src/network/network';
import { rtcLogger } from './RTCLoggerProxy';

enum ERROR_TYPE {
  REQUEST_ERROR,
  PARAME_ERROR,
}

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo;
  private _requestErrorRetryInterval: number = 8; // seconds
  private _reFreshInterval: number = 24 * 3600; // seconds
  private _reFreshTimerId: any = null;
  private _canAcquireSipProv: boolean = true;
  // for unit test and log
  public retrySeconds: number = 0;

  constructor() {
    super();
  }

  async acquireSipProv() {
    if (!this._canAcquireSipProv) {
      return;
    }
    await this._sendSipProvRequest();
  }

  private async _sendSipProvRequest() {
    const response: IResponse = await rtcRestApiManager.sendRequest(null);

    if (!response) {
      rtcLogger.loggerConnector(
        'error',
        'RTCProvManager',
        '',
        'the response is null',
      );
      return;
    }

    if (<number>response.status < 200 || <number>response.status >= 400) {
      this._errorHandling(ERROR_TYPE.REQUEST_ERROR, response.retryAfter);
      return;
    }

    const responseData: RTCSipProvisionInfo = response.data;

    if (!this._checkSipProvInfoParame(responseData)) {
      this._errorHandling(ERROR_TYPE.PARAME_ERROR, response.retryAfter);
      return;
    }

    this._resetFreshTimer();
    this._requestErrorRetryInterval = 8;

    if (responseData !== this._sipProvisionInfo) {
      this._sipProvisionInfo = responseData;
      this.emit(RTC_PROV_EVENT.NEW_PROV, { info: responseData });
    }
  }

  private _resetFreshTimer() {
    this._clearFreshTimer();
    this._reFreshTimerId = setTimeout(() => {
      this._sendSipProvRequest();
    },                                this._reFreshInterval);
  }

  private _clearFreshTimer() {
    if (this._reFreshTimerId) {
      clearTimeout(this._reFreshTimerId);
    }
    this._reFreshTimerId = null;
  }

  private _errorHandling(type: ERROR_TYPE, retryAfter: number): void {
    let interval: number = 0;
    switch (type) {
      case ERROR_TYPE.REQUEST_ERROR:
        interval = !!retryAfter
          ? Math.max(this._requestErrorRetryInterval, retryAfter)
          : this._requestErrorRetryInterval;
        this._retryRequestForError(interval);

        this._requestErrorRetryInterval = Math.min(
          this._requestErrorRetryInterval * 2,
          3600,
        );
        break;
      case ERROR_TYPE.PARAME_ERROR:
        interval = !!retryAfter ? Math.max(7200, retryAfter) : 7200;
        this._retryRequestForError(interval);
        break;
      default:
        rtcLogger.loggerConnector(
          'error',
          'RTCProvManager',
          '',
          `the error type ${type} is not defined`,
        );
        break;
    }
  }

  private _retryRequestForError(seconds: number) {
    this._clearFreshTimer();
    this._canAcquireSipProv = false;
    this.retrySeconds = seconds;
    setTimeout(() => {
      this._canAcquireSipProv = true;
      this._sendSipProvRequest();
    },         seconds * 1000);
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
      rtcLogger.loggerConnector(
        'error',
        'RTCProvManager',
        '',
        `the Prov Info Parame error is: ${error}`,
      );
    }
    return parame_correct;
  }
  private _isNotEmptyString(data: any) {
    return typeof data === 'string' && data.length > 0;
  }
}

export { RTCProvManager };
