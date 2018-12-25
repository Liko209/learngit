/*
 * @Author: Jayson zhang  (jayson.zhang@ringcentral.com)
 * @Date: 2018-12-24 10:09:08
 * Copyright © RingCentral. All rights reserved.
 */
import { EventEmitter2 } from 'eventemitter2';
import { IRTCUserAgent } from './IRTCUserAgent';
import { WebPhone } from './WebPhone';

enum EVENT_TAG {
  REG_SUCCESS = 'uaRegisterSuccess',
  REG_FAILED = 'uaRegisterFailed',
}

enum REGISTER_EVENT {
  REG = 'registered',
  REG_FAILED = 'registrationFailed',
}

class RTCSipUserAgent implements IRTCUserAgent {
  private _userAgent: any = null;
  private _eventEmitter: EventEmitter2;

  constructor(provisionData: any, options: any, eventEmitter: EventEmitter2) {
    // to be modify when import ringcentral-web-phone library
    this._userAgent = new WebPhone(provisionData, options);
    this._eventEmitter = eventEmitter;
    this._prepareListener();
  }

  public register(options?: any): any {
    this._prepareListener();
    return this._userAgent.register(options);
  }

  public makeCall(phoneNumber: string, options: any): any {
    return this._userAgent.invite(phoneNumber, options);
  }

  private _prepareListener(): void {
    this._onRegistered();
    this._onRegistrationFailed();
  }

  private _onRegistered(): void {
    this._userAgent.on(REGISTER_EVENT.REG, () => {
      this._eventEmitter.emit(EVENT_TAG.REG_SUCCESS);
    });
  }

  private _onRegistrationFailed(): void {
    this._userAgent.on(
      REGISTER_EVENT.REG_FAILED,
      (response: any, cause: any) => {
        this._eventEmitter.emit(EVENT_TAG.REG_FAILED, response, cause);
      },
    );
  }
}

export { RTCSipUserAgent, EVENT_TAG };
