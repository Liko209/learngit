/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from './IRTCUserAgent';
import { UA_EVENT } from './types';

const WebPhone = require('ringcentral-web-phone');

enum WEBPHONE_REGISTER_EVENT {
  REG_SUCCESS = 'registered',
  REG_FAILED = 'registrationFailed',
}

class RTCSipUserAgent implements IRTCUserAgent {
  private _userAgent: any;
  private _eventEmitter: EventEmitter2;

  constructor(provisionData: any, options: any, eventEmitter: EventEmitter2) {
    this._eventEmitter = eventEmitter;
    this._createWebPhone(provisionData, options);
  }

  private _createWebPhone(provisionData: any, options: any) {
    this._userAgent = new WebPhone(provisionData, options);
    this._initListener();
  }

  public register(options?: any): any {
    return this._userAgent.register(options);
  }

  public makeCall(phoneNumber: string, options: any): any {
    return this._userAgent.invite(phoneNumber, options);
  }

  private _initListener(): void {
    this._subscribeRegEvent();
    this._subscribeRegFailedEvent();
  }

  private _subscribeRegEvent(): void {
    this._userAgent.on(WEBPHONE_REGISTER_EVENT.REG_SUCCESS, () => {
      this._eventEmitter.emit(UA_EVENT.REG_SUCCESS);
    });
  }

  private _subscribeRegFailedEvent(): void {
    this._userAgent.on(
      WEBPHONE_REGISTER_EVENT.REG_FAILED,
      (response: any, cause: any) => {
        this._eventEmitter.emit(UA_EVENT.REG_FAILED, response, cause);
      },
    );
  }
}

export { RTCSipUserAgent };
