/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from './IRTCUserAgent';
import { UA_EVENT, ProvisionDataOptions, WEBPHONE_LOG_LEVEL } from './types';
import { RTCCallOptions } from '../api/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';
import { RTCSipProvisionInfo } from '../account/types';
import {
  opusModifier,
  isFireFox,
  randomBetween,
  isSafari,
} from '../utils/utils';
import { CallReport } from '../report/Call';
import { CALL_REPORT_PROPS } from '../report/types';
import {
  kSwitchBackProxyMaxInterval,
  kSwitchBackProxyMinInterval,
} from './constants';

const WebPhone = require('ringcentral-web-phone');

const LOG_TAG = 'RTCSipUserAgent';

enum WEBPHONE_REGISTER_EVENT {
  REG_SUCCESS = 'registered',
  REG_FAILED = 'registrationFailed',
  INVITE = 'invite',
  TRANSPORT_CREATED = 'transportCreated',
  TRANSPORT_ERROR = 'transportError',
  TRANSPORT_CONNECTED = 'connected',
  SWITCH_BACK_PROXY = 'switchBackProxy',
  PROVISION_UPDATE = 'provisionUpdate',
}

class RTCSipUserAgent extends EventEmitter2 implements IRTCUserAgent {
  private _webphone: any;
  private _switchBackTimer: NodeJS.Timeout | null = null;
  public restartUA(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ) {
    if (this._webphone) {
      this._destroy();
    }
    this._createWebPhone(provisionData, options);
  }

  private _destroy() {
    rtcLogger.debug(LOG_TAG, 'Destroy User Agent ...');
    this._webphone.userAgent.removeAllListeners();
    if (this._webphone.userAgent.transport) {
      this._webphone.userAgent.transport.removeAllListeners();
      if (this._webphone.userAgent.transport.reconnectTimer) {
        clearTimeout(this._webphone.userAgent.transport.reconnectTimer);
      }
      this._webphone.userAgent.transport.disconnect({ force: true });
    }
    this._webphone.userAgent.stop();
    delete this._webphone;
    this._webphone = null;
  }

  private _createWebPhone(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ) {
    if (options && options.modifiers) {
      if (!options.modifiers.find(opusModifier)) {
        options.modifiers.push(opusModifier);
      }
    } else if (options) {
      options.modifiers = [opusModifier];
      if (isFireFox()) {
        options.enableMidLinesInSDP = true;
      } else {
        options.enableMidLinesInSDP = false;
      }
    }
    options.enableQos = !isFireFox() && !isSafari();
    options.connector = (
      level: any,
      category: any,
      label: any,
      content: any,
    ) => {
      switch (level) {
        case WEBPHONE_LOG_LEVEL.ERROR:
          rtcLogger.error('RC_WEBPHONE', `[${category}] ${content}`);
          break;
        case WEBPHONE_LOG_LEVEL.WARN:
          rtcLogger.warn('RC_WEBPHONE', `[${category}] ${content}`);
          break;
        default:
          rtcLogger.debug('RC_WEBPHONE', `[${category}] ${content}`);
      }
    };
    /* eslint-disable new-cap */
    this._webphone = new WebPhone.default(provisionData, options);
    this._initListener();
  }

  public makeCall(phoneNumber: string, options: RTCCallOptions): any {
    if (!this._webphone) {
      return null;
    }
    if (!options.homeCountryId) {
      options.homeCountryId = '1';
    }

    CallReport.instance().updateEstablishment(
      CALL_REPORT_PROPS.INVITE_SENT_TIME,
    );
    return this._webphone.userAgent.invite(phoneNumber, options);
  }

  public reRegister(forceToMain: boolean) {
    rtcLogger.debug(LOG_TAG, 'Try to restart register with new transport');
    if (!this._webphone) {
      return;
    }
    this._webphone.userAgent.transport.reconnect(forceToMain);
  }

  public unregister() {
    if (!this._webphone) {
      return;
    }
    this._webphone.userAgent.unregister();
    this._destroy();
  }

  private _initListener(): void {
    if (!this._webphone || !this._webphone.userAgent) {
      return;
    }
    this._webphone.userAgent.on(WEBPHONE_REGISTER_EVENT.REG_SUCCESS, () => {
      this.emit(UA_EVENT.REG_SUCCESS);
    });
    this._webphone.userAgent.on(
      WEBPHONE_REGISTER_EVENT.REG_FAILED,
      (response: any, cause: any) => {
        if (!response) {
          return;
        }
        const message = response.data || response;
        if (
          message &&
          typeof message === 'string' &&
          this._webphone &&
          this._webphone.userAgent &&
          this._webphone.userAgent.transport &&
          !this._webphone.userAgent.transport.isSipErrorCode(message)
        ) {
          this.emit(UA_EVENT.REG_FAILED, response, cause);
        }
      },
    );
    this._webphone.userAgent.on(
      WEBPHONE_REGISTER_EVENT.INVITE,
      (session: any) => {
        this.emit(UA_EVENT.RECEIVE_INVITE, session);
      },
    );
    if (this._webphone.userAgent.transport) {
      this._initTransportListener();
    } else {
      this._webphone.userAgent.on(
        WEBPHONE_REGISTER_EVENT.TRANSPORT_CREATED,
        () => {
          this._initTransportListener();
        },
      );
    }
  }

  private _initTransportListener() {
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.TRANSPORT_ERROR,
      () => {
        if (this._webphone.userAgent.transport.noAvailableServers()) {
          rtcLogger.warn(LOG_TAG, 'Transport error');
          this.emit(UA_EVENT.TRANSPORT_ERROR);
        }
      },
    );
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.TRANSPORT_CONNECTED,
      () => {
        rtcLogger.debug(LOG_TAG, 'Transport connected');
      },
    );
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.SWITCH_BACK_PROXY,
      () => {
        this._onSwitchBackProxy();
      },
    );
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.PROVISION_UPDATE,
      () => {
        rtcLogger.debug(LOG_TAG, 'Provision update signal from web phone');
        this.emit(UA_EVENT.PROVISION_UPDATE);
      },
    );
  }

  private _onSwitchBackProxy() {
    if (this._switchBackTimer) {
      clearTimeout(this._switchBackTimer);
      this._switchBackTimer = null;
    }
    const timeout = randomBetween(
      kSwitchBackProxyMinInterval,
      kSwitchBackProxyMaxInterval,
    );
    this._switchBackTimer = setTimeout(() => {
      this.emit(UA_EVENT.SWITCH_BACK_PROXY);
    }, timeout);
    rtcLogger.debug(
      LOG_TAG,
      `Switch back to main proxy signal from web phone. Schedule switch back in ${timeout /
        1000} sec`,
    );
  }
}

export { RTCSipUserAgent };
