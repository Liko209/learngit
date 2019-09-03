/*
 * @Author: Hankin Lin (hankin.lin@ringcentral.com)
 * @Date: 2018-12-28 16:28:00
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import _ from 'lodash';
import {
  IResponse,
  NETWORK_VIA,
  NETWORK_METHOD,
} from 'foundation/network/network';
import { HttpRequest } from 'foundation/network/client/http';
import NetworkRequestBuilder from 'foundation/network/client/NetworkRequestBuilder';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCRestApiManager } from '../utils/RTCRestApiManager';
import { RTC_PROV_EVENT } from './types';
import {
  kRTCProvRequestErrorRetryTimerMin,
  kRTCProvFreshTimer,
  kRTCProvParamsErrorRetryTimer,
  kRTCProvRequestErrorRetryTimerMax,
  kRTCProvRefreshByRegFailedInterval,
} from './constants';
import { isNotEmptyString } from '../utils/utils';
import { RTC_REST_API } from '../utils/types';
import { RTCDaoManager } from '../utils/RTCDaoManager';
import { RTCSipProvisionInfo } from '../api/types';

enum ERROR_TYPE {
  REQUEST_ERROR,
  PARAMS_ERROR,
}

const LOG_TAG = 'RTCProvManager';

class RTCProvManager extends EventEmitter2 {
  private _sipProvisionInfo: RTCSipProvisionInfo | null = null;
  private _requestErrorRetryInterval: number = kRTCProvRequestErrorRetryTimerMin; // seconds
  private _reFreshInterval: number = kRTCProvFreshTimer; // seconds
  private _reFreshTimerId: NodeJS.Timeout | null = null;
  private _canAcquireSipProv: boolean = true;
  private _isRefreshedWithinTime: boolean = false;
  private _isAcquireProvWhenTimeArrived: boolean = false;
  private _refreshByRegFailedTimer: NodeJS.Timeout | null = null;
  private _refreshByRegFailedInterval: number = kRTCProvRefreshByRegFailedInterval; // seconds

  // for unit test and log
  private _retrySeconds: number = 0;
  get retrySeconds() {
    return this._retrySeconds;
  }
  set retrySeconds(seconds) {
    this._retrySeconds = seconds;
  }

  async acquireSipProv() {
    const localSipProvisionInfo = RTCDaoManager.instance().readProvisioning();
    if (localSipProvisionInfo) {
      rtcLogger.info(LOG_TAG, 'SIP provisioning info FOUND in DAO');
      this._sipProvisionInfo = localSipProvisionInfo;
      this.emit(RTC_PROV_EVENT.NEW_PROV, { info: this._sipProvisionInfo });
    } else {
      rtcLogger.info(LOG_TAG, "There's no SIP provisioning info in DAO");
    }
    if (!this._canAcquireSipProv) {
      return;
    }
    await this._sendSipProvRequest();
  }

  refreshSipProv() {
    rtcLogger.info(LOG_TAG, 'start refresh Sip Provisioning');
    if (this._isRefreshedWithinTime) {
      this._isAcquireProvWhenTimeArrived = true;
      rtcLogger.info(
        LOG_TAG,
        'waiting to refresh Sip Provisioning when time arrives',
      );
      return;
    }
    this._isRefreshedWithinTime = true;
    this._sendSipProvRequest().then(() => {
      this._setRefreshByRegFailedTimer();
    });
  }

  private _setRefreshByRegFailedTimer() {
    if (this._refreshByRegFailedTimer) {
      clearTimeout(this._refreshByRegFailedTimer);
      this._refreshByRegFailedTimer = null;
    }
    this._refreshByRegFailedTimer = setTimeout(() => {
      this._refreshSipProvWhenTimeArrived();
    }, this._refreshByRegFailedInterval * 1000);
  }

  private _refreshSipProvWhenTimeArrived() {
    if (this._isAcquireProvWhenTimeArrived) {
      rtcLogger.info(
        LOG_TAG,
        'during the timer call refresh api then refresh sip provisioning when time arrives',
      );
      this._isAcquireProvWhenTimeArrived = false;
      this._sendSipProvRequest().then(() => {
        this._setRefreshByRegFailedTimer();
      });
      return;
    }

    this._isRefreshedWithinTime = false;
  }

  initRefreshState() {
    this._isRefreshedWithinTime = false;
    this._isAcquireProvWhenTimeArrived = false;
    if (this._refreshByRegFailedTimer) {
      clearTimeout(this._refreshByRegFailedTimer);
      this._refreshByRegFailedTimer = null;
    }
  }

  clearProvInfo() {
    rtcLogger.debug(LOG_TAG, 'clear provisioning info');
    this._clearFreshTimer();
    this._sipProvisionInfo = null;
    RTCDaoManager.instance().removeProvisioning();
  }

  private async _sendSipProvRequest() {
    rtcLogger.info(LOG_TAG, 'start send SipProv Request');
    const provRequest: HttpRequest = new NetworkRequestBuilder()
      .setPath(RTC_REST_API.API_SIP_PROVISION)
      .setMethod(NETWORK_METHOD.POST)
      .setAuthfree(false)
      .setVia(NETWORK_VIA.HTTP)
      .setData({ sipInfo: [{ transport: 'WSS' }] })
      .build();

    let response: IResponse | null = null;
    try {
      response = await RTCRestApiManager.instance().sendRequest(provRequest);
    } catch (error) {
      rtcLogger.error(LOG_TAG, `the request error is: ${error}`);
    }

    rtcLogger.info(
      LOG_TAG,
      `the response is: ${JSON.stringify(_.omit(response, 'request'))}`,
    );

    if (!response) {
      rtcLogger.error(LOG_TAG, 'the response is null');
      return;
    }

    if (
      (response.status as number) < 200 ||
      (response.status as number) >= 400
    ) {
      rtcLogger.info(LOG_TAG, `the response is error:${response.status}`);
      this._errorHandling(ERROR_TYPE.REQUEST_ERROR, response.retryAfter);
      return;
    }

    const responseData: RTCSipProvisionInfo = response.data;

    if (!this._checkSipProvInfoParams(responseData)) {
      rtcLogger.info(LOG_TAG, 'the response param is error');
      this._errorHandling(ERROR_TYPE.PARAMS_ERROR, response.retryAfter);
      return;
    }

    this._resetFreshTimer();
    this._requestErrorRetryInterval = kRTCProvRequestErrorRetryTimerMin;
    rtcLogger.info(
      LOG_TAG,
      `Reset SIP provisioning info error retry interval to ${
        this._requestErrorRetryInterval
      }`,
    );

    this.emit(RTC_PROV_EVENT.PROV_ARRIVE, responseData, this._sipProvisionInfo);

    if (
      !this._sipProvisionInfo ||
      !_.isEqual(responseData, this._sipProvisionInfo)
    ) {
      rtcLogger.info(LOG_TAG, 'Received new SIP provisioning info from server');
      this._sipProvisionInfo = responseData;
      RTCDaoManager.instance().saveProvisionInfo(this._sipProvisionInfo);
      this.emit(RTC_PROV_EVENT.NEW_PROV, { info: responseData });
    } else {
      rtcLogger.info(
        LOG_TAG,
        'New SIP provisioning info from server is same as old one. Ignore it',
      );
    }
  }

  private _resetFreshTimer() {
    rtcLogger.info(LOG_TAG, 'set fresh timer');
    this._clearFreshTimer();
    this._reFreshTimerId = setTimeout(() => {
      this._sendSipProvRequest();
    }, this._reFreshInterval * 1000);
  }

  private _clearFreshTimer() {
    if (this._reFreshTimerId) {
      clearTimeout(this._reFreshTimerId);
    }
    this._reFreshTimerId = null;
  }

  private _errorHandling(type: ERROR_TYPE, retryAfter: number): void {
    let interval = 0;
    switch (type) {
      case ERROR_TYPE.REQUEST_ERROR:
        interval = retryAfter
          ? Math.max(this._requestErrorRetryInterval, retryAfter)
          : this._requestErrorRetryInterval;
        this._retryRequestForError(interval);

        this._requestErrorRetryInterval = Math.min(
          this._requestErrorRetryInterval * 2,
          kRTCProvRequestErrorRetryTimerMax,
        );
        break;
      case ERROR_TYPE.PARAMS_ERROR:
        interval = retryAfter
          ? Math.max(kRTCProvParamsErrorRetryTimer, retryAfter)
          : kRTCProvParamsErrorRetryTimer;
        this._retryRequestForError(interval);
        break;
      default:
        rtcLogger.error(LOG_TAG, `the error type ${type} is not defined`);
        break;
    }
  }

  private _retryRequestForError(seconds: number) {
    rtcLogger.info(LOG_TAG, `set ${seconds} s error retry timer`);
    this._clearFreshTimer();
    this._canAcquireSipProv = false;
    this.retrySeconds = seconds;
    setTimeout(() => {
      this._canAcquireSipProv = true;
      this._sendSipProvRequest();
    }, seconds * 1000);
  }

  private _checkSipProvInfoParams(info: RTCSipProvisionInfo): boolean {
    rtcLogger.info(LOG_TAG, `the prov info: ${JSON.stringify(info)}`);
    let paramsCorrect = false;
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
      rtcLogger.error(LOG_TAG, `the Prov Info Params error is: ${error}`);
    }
    return paramsCorrect;
  }

  getCurrentSipProvisionInfo(): RTCSipProvisionInfo | null {
    return this._sipProvisionInfo;
  }
}

export { RTCProvManager };
