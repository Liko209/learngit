/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from './IRTCUserAgent';
import { UA_EVENT, ProvisionDataOptions } from './types';
import { RTCCallOptions } from '../api/types';
import { rtcLogger } from '../utils/RTCLoggerProxy';

const WebPhone = require('ringcentral-web-phone');
const LOG_TAG = 'RTCSipUserAgent';

enum WEBPHONE_REGISTER_EVENT {
  REG_SUCCESS = 'registered',
  REG_FAILED = 'registrationFailed',
  INVITE = 'invite',
}

class RTCSipUserAgent extends EventEmitter2 implements IRTCUserAgent {
  private _webphone: any;

  constructor(provisionData: any, options: ProvisionDataOptions) {
    super();
    this._createWebPhone(provisionData, options);
  }

  private _createWebPhone(provisionData: any, options: ProvisionDataOptions) {
    this._webphone = new WebPhone(provisionData, options);
    this._initListener();
  }

  public makeCall(phoneNumber: string, options: RTCCallOptions): any {
    if (!this._webphone) {
      return null;
    }
    if (!options.homeCountryId) {
      options.homeCountryId = '1';
    }
    return this._webphone.userAgent.invite(phoneNumber, options);
  }

  public reRegister() {
    rtcLogger.debug(LOG_TAG, 'Try to restart register with new transport');
    if (!this._webphone) {
      return;
    }
    if (this._webphone.userAgent.transport) {
      this._webphone.userAgent.transport.removeAllListeners();
    }
    this._webphone.userAgent.transport = new this._webphone.userAgent.configuration.transportConstructor(
      this._webphone.userAgent.getLogger('sip.transport'),
      this._webphone.userAgent.configuration.transportOptions,
    );
    this._webphone.userAgent.setTransportListeners();
    this._initTransportListener();
    this._webphone.userAgent.transport.connect();
  }

  public unregister() {
    if (!this._webphone) {
      return;
    }
    this._webphone.userAgent.unregister();
    this._webphone.userAgent.removeAllListeners();
    if (this._webphone.userAgent.transport) {
      this._webphone.userAgent.transport.removeAllListeners();
    }
    this._webphone.userAgent.stop();
    this._webphone = null;
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
        this.emit(UA_EVENT.REG_FAILED, response, cause);
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
      this._webphone.userAgent.on('transportCreated', () => {
        this._initTransportListener();
      });
    }
  }

  private _initTransportListener() {
    this._webphone.userAgent.transport.on('transportError', () => {
      if (this._webphone.userAgent.transport.noAvailableServers()) {
        rtcLogger.warn(LOG_TAG, 'Transport error');
        this.emit(UA_EVENT.TRANSPORT_ERROR);
      }
    });
  }
}

export { RTCSipUserAgent };
