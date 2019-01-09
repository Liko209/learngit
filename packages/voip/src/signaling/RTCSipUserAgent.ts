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
  INVITE = 'invite',
}

class RTCSipUserAgent extends EventEmitter2 implements IRTCUserAgent {
  private _webphone: any;

  constructor(provisionData: any, options: any) {
    super();
    this._createWebPhone(provisionData, options);
  }

  private _createWebPhone(provisionData: any, options: any) {
    this._webphone = new WebPhone(provisionData, options);
    this._initListener();
  }

  public register(options?: any): any {
    return this._webphone.userAgent.register(options);
  }

  public makeCall(phoneNumber: string, options: any): any {
    return this._webphone.userAgent.invite(phoneNumber, options);
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
  }
}

export { RTCSipUserAgent };
