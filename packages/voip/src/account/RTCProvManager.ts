/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RTCRestApiManager } from '../utils/RTCRestApiManager';
import { EventEmitter2 } from 'eventemitter2';
import { RTCSipProvisionInfo, RTC_PROV_EVENT } from './types';
import {
  IResponse,
  NETWORK_VIA,
  NETWORK_METHOD,
} from 'foundation/src/network/network';
import { HttpRequest } from 'foundation/src/network/client/http';
import NetworkRequestBuilder from 'foundation/src/network/client/NetworkRequestBuilder';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import {
  kRTCProvRequestErrorRertyTimerMin,
  kRTCProvFreshTimer,
  kRTCProvParamsErrorRertyTimer,
  kRTCProvRequestErrorRertyTimerMax,
} from './constants';
import { isNotEmptyString } from '../utils/utils';
import { RTC_REST_API } from '../utils/types';
import { RTCDaoManager } from '../utils/RTCDaoManager';
import _ from 'lodash';

enum ERROR_TYPE {
  REQUEST_ERROR,
  PARAMS_ERROR,
}

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo | null = null;
  private _requestErrorRetryInterval: number = kRTCProvRequestErrorRertyTimerMin; // seconds
  private _reFreshInterval: number = kRTCProvFreshTimer; // seconds
  private _reFreshTimerId: NodeJS.Timeout | null = null;
  private _canAcquireSipProv: boolean = true;
  // for unit test and log
  public retrySeconds: number = 0;

  constructor() {
    super();
  }

  async acquireSipProv() {
    const localSipProvisionInfo = RTCDaoManager.instance().readProvisioning();
    if (localSipProvisionInfo) {
      this._sipProvisionInfo = localSipProvisionInfo;
      this.emit(RTC_PROV_EVENT.NEW_PROV, { info: this._sipProvisionInfo });
    }
    if (!this._canAcquireSipProv) {
      return;
    }
    await this._sendSipProvRequest();
  }

  clearProvInfo() {
    this._clearFreshTimer();
    this._sipProvisionInfo = null;
    RTCDaoManager.instance().removeProvisioning();
  }

  private async _sendSipProvRequest() {
    rtcLogger.info('RTCProvManager', 'start send SipProv Request');
    const provRequest: HttpRequest = new NetworkRequestBuilder()
      .setPath(RTC_REST_API.API_SIP_PROVISION)
      .setMethod(NETWORK_METHOD.POST)
      .setAuthfree(false)
      .setVia(NETWORK_VIA.HTTP)
      .setData({ sipInfo: [{ transport: 'WSS' }] })
      .setIgnoreLocalRetryAfter(true)
      .build();

    let response: IResponse | null = null;
    try {
      response = await RTCRestApiManager.instance().sendRequest(provRequest);
    } catch (error) {
      rtcLogger.error('RTCProvManager', `the request error is: ${error}`);
    }

    rtcLogger.info(
      'RTCProvManager',
      `the response is: ${JSON.stringify(response)}`,
    );

    if (!response) {
      rtcLogger.error('RTCProvManager', 'the response is null');
      return;
    }

    if (<number>response.status < 200 || <number>response.status >= 400) {
      rtcLogger.info(
        'RTCProvManager',
        `the response is error:${response.status}`,
      );
      this._errorHandling(ERROR_TYPE.REQUEST_ERROR, response.retryAfter);
      return;
    }

    const responseData: RTCSipProvisionInfo = response.data;

    if (!this._checkSipProvInfoParams(responseData)) {
      rtcLogger.info('RTCProvManager', 'the response param is error');
      this._errorHandling(ERROR_TYPE.PARAMS_ERROR, response.retryAfter);
      return;
    }

    this._resetFreshTimer();
    this._requestErrorRetryInterval = kRTCProvRequestErrorRertyTimerMin;

    if (
      !this._sipProvisionInfo ||
      !_.isEqual(responseData, this._sipProvisionInfo)
    ) {
      rtcLogger.info('RTCProvManager', 'emit new prov');
      this._sipProvisionInfo = responseData;
      RTCDaoManager.instance().saveProvisionInfo(this._sipProvisionInfo);
      this.emit(RTC_PROV_EVENT.NEW_PROV, { info: responseData });
    }
  }

  private _resetFreshTimer() {
    rtcLogger.info('RTCProvManager', 'set fresh timer');
    this._clearFreshTimer();
    this._reFreshTimerId = setTimeout(() => {
      this._sendSipProvRequest();
    },                                this._reFreshInterval * 1000);
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
    rtcLogger.info('RTCProvManager', `set ${seconds} s error retry timer`);
    this._clearFreshTimer();
    this._canAcquireSipProv = false;
    this.retrySeconds = seconds;
    setTimeout(() => {
      this._canAcquireSipProv = true;
      this._sendSipProvRequest();
    },         seconds * 1000);
  }

  private _checkSipProvInfoParams(info: RTCSipProvisionInfo): boolean {
    rtcLogger.info('RTCProvManager', `the prov info: ${JSON.stringify(info)}`);
    let paramsCorrect: boolean = false;
    try {
      const paramsSipInfo =
        info.sipInfo instanceof Array ? info.sipInfo[0] : info.sipInfo;

      paramsCorrect =
        isNotEmptyString(paramsSipInfo.authorizationId) &&
        isNotEmptyString(paramsSipInfo.domain) &&
        isNotEmptyString(paramsSipInfo.outboundProxy) &&
        isNotEmptyString(paramsSipInfo.password) &&
        isNotEmptyString(paramsSipInfo.transport) &&
        isNotEmptyString(paramsSipInfo.username);
    } catch (error) {
      rtcLogger.error(
        'RTCProvManager',
        `the Prov Info Params error is: ${error}`,
      );
    }
    return paramsCorrect;
  }
}

export { RTCProvManager };
