/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from './IRTCUserAgent';
import { UA_EVENT, ProvisionDataOptions } from './types';
import { RTCCallOptions } from '../api/types';

const WebPhone = require('ringcentral-web-phone');

enum WEBPHONE_REGISTER_EVENT {
  REG_SUCCESS = 'registered',
  REG_FAILED = 'registrationFailed',
  INVITE = 'invite',
}

class RTCSipUserAgent implements IRTCUserAgent {
  private _webphone: any;
  private _eventEmitter: EventEmitter2;

  constructor(
    provisionData: any,
    options: ProvisionDataOptions,
    eventEmitter: EventEmitter2,
  ) {
    this._eventEmitter = eventEmitter;
    this._createWebPhone(provisionData, options);
  }

  private _createWebPhone(provisionData: any, options: ProvisionDataOptions) {
    this._webphone = new WebPhone(provisionData, options);
    this._initListener();
  }

  public register(options?: ProvisionDataOptions): void {
    this._webphone.userAgent.register(options);
  }

  public makeCall(phoneNumber: string, options: RTCCallOptions): any {
    return this._webphone.userAgent.invite(phoneNumber, options);
  }

  public reRegister() {
    this._webphone.userAgent.transport.stopSendingKeepAlives();
    this._webphone.userAgent.transport.connectionTimeout = null;
    this._webphone.userAgent.transport.connectionPromise = null;
    this._webphone.userAgent.transport.connectDeferredResolve = null;
    this._webphone.userAgent.transport.status = 3;
    this._webphone.userAgent.transport.reconnect();
  }

  private _initListener(): void {
    if (!this._webphone || !this._webphone.userAgent) {
      return;
    }
    this._webphone.userAgent.on(WEBPHONE_REGISTER_EVENT.REG_SUCCESS, () => {
      this._eventEmitter.emit(UA_EVENT.REG_SUCCESS);
    });
    this._webphone.userAgent.on(
      WEBPHONE_REGISTER_EVENT.REG_FAILED,
      (response: any, cause: any) => {
        this._eventEmitter.emit(UA_EVENT.REG_FAILED, response, cause);
      },
    );
    this._webphone.userAgent.on(
      WEBPHONE_REGISTER_EVENT.INVITE,
      (session: any) => {
        this._eventEmitter.emit(UA_EVENT.RECEIVE_INVITE, session);
      },
    );
  }
}

export { RTCSipUserAgent };
