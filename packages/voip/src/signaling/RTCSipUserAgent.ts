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

  constructor() {
    super();
  }

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
    this._clearConnectionTimer();
    this._webphone.userAgent.removeAllListeners();
    if (this._webphone.userAgent.transport) {
      this._webphone.userAgent.transport.removeAllListeners();
    }
    this._webphone.userAgent.stop();
    this._webphone = null;
  }

  private _createWebPhone(
    provisionData: RTCSipProvisionInfo,
    options: ProvisionDataOptions,
  ) {
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
        this.emit(UA_EVENT.REG_FAILED, response, cause);
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
    if (this._connectionTimer) {
      rtcLogger.debug(LOG_TAG, 'Clear connection timeout');
      clearTimeout(this._connectionTimer);
    }
    this._connectionTimer = null;
  }
}

export { RTCSipUserAgent };
