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
  TRANSPORT_CREATED = 'transportCreated',
  TRANSPORT_ERROR = 'transportError',
  TRANSPORT_DISCONNECTED = 'disconnected',
  TRANSPORT_CONNECTED = 'connected',
}

class RTCSipUserAgent extends EventEmitter2 implements IRTCUserAgent {
  private _webphone: any;
  private _connectionTimer: NodeJS.Timeout | null = null;

  constructor(provisionData: any, options: ProvisionDataOptions) {
    super();
    this._createWebPhone(provisionData, options);
  }

  private _createWebPhone(provisionData: any, options: ProvisionDataOptions) {
    this._webphone = new WebPhone(provisionData, options);
    this._initListener();
    this._startConnectionTimer();
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
    this._clearConnectionTimer();
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
    this._startConnectionTimer();
  }

  public unregister() {
    this._clearConnectionTimer();
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
          this._clearConnectionTimer();
          this.emit(UA_EVENT.TRANSPORT_ERROR);
        }
      },
    );
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.TRANSPORT_DISCONNECTED,
      () => {
        rtcLogger.debug(LOG_TAG, 'Transport disconnected');
        this._clearConnectionTimer();
        this.emit(UA_EVENT.TRANSPORT_ERROR);
      },
    );
    this._webphone.userAgent.transport.on(
      WEBPHONE_REGISTER_EVENT.TRANSPORT_CONNECTED,
      () => {
        rtcLogger.debug(LOG_TAG, 'Transport connected');
        this._clearConnectionTimer();
      },
    );
  }

  private _startConnectionTimer() {
    this._connectionTimer = setTimeout(() => {
      rtcLogger.error(LOG_TAG, 'Connection time out');
      this._webphone.userAgent.transport.disconnect({ force: true });
    },                                 5000);
  }

  private _clearConnectionTimer() {
    rtcLogger.debug(LOG_TAG, 'clear connection timeout');
    if (this._connectionTimer) {
      clearTimeout(this._connectionTimer);
    }
    this._connectionTimer = null;
  }
}

export { RTCSipUserAgent };
