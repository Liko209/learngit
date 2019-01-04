/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */

import { rtcRestApiManager } from '../utils/RTCRestApiManager';
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipProvisionInfo, RTC_PROV_EVENT } from './types';
import { IResponse } from 'foundation/src/network/network';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import {
  kRTCProvRequestErrorRertyTimerMin,
  kRTCProvFreshTimer,
  kRTCProvParamsErrorRertyTimer,
  kRTCProvRequestErrorRertyTimerMax,
} from './constants';

import { isNotEmptyString } from '../utils/utils';

enum ERROR_TYPE {
  REQUEST_ERROR,
  PARAMS_ERROR,
}

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo;
  private _requestErrorRetryInterval: number = kRTCProvRequestErrorRertyTimerMin; // seconds
  private _reFreshInterval: number = kRTCProvFreshTimer; // seconds
  private _reFreshTimerId: NodeJS.Timeout = null;
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
      rtcLogger.error('RTCProvManager', 'the response is null');
      return;
    }

    if (<number>response.status < 200 || <number>response.status >= 400) {
      this._errorHandling(ERROR_TYPE.REQUEST_ERROR, response.retryAfter);
      return;
    }

    const responseData: RTCSipProvisionInfo = response.data;

    if (!this._checkSipProvInfoParame(responseData)) {
      this._errorHandling(ERROR_TYPE.PARAMS_ERROR, response.retryAfter);
      return;
    }

    this._resetFreshTimer();
    this._requestErrorRetryInterval = kRTCProvRequestErrorRertyTimerMin;

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
          kRTCProvRequestErrorRertyTimerMax,
        );
        break;
      case ERROR_TYPE.PARAMS_ERROR:
        interval = !!retryAfter
          ? Math.max(kRTCProvParamsErrorRertyTimer, retryAfter)
          : kRTCProvParamsErrorRertyTimer;
        this._retryRequestForError(interval);
        break;
      default:
        rtcLogger.error(
          'RTCProvManager',
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
        isNotEmptyString(parame_device.authorizationID) &&
        isNotEmptyString(parame_device.domain) &&
        isNotEmptyString(parame_device.outboundProxy) &&
        isNotEmptyString(parame_device.password) &&
        isNotEmptyString(parame_device.transport) &&
        isNotEmptyString(parame_device.username);
    } catch (error) {
      rtcLogger.error(
        'RTCProvManager',
        `the Prov Info Parame error is: ${error}`,
      );
    }
    return parame_correct;
  }
}

export { RTCProvManager };
