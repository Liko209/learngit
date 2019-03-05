/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 13:42:30
 * Copyright © RingCentral. All rights reserved.
 */

// import { inject } from 'framework';
import {
  TelephonyService as ServerTelephonyService,
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
} from 'sdk/module/telephony';
import { mainLogger } from 'sdk';
// import { TelephonyStore } from '../store';

class TelephonyService {
  // @inject(TelephonyStore) private _telephonyStore: TelephonyStore;

  private _serverTelephonyService: ServerTelephonyService = ServerTelephonyService.getInstance();

  private _callId?: string;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(`[Telephony_Service_Account_State]: ${state}`);
  }

  private _onCallStateChange = (callId: string, state: RTC_CALL_STATE) => {
    this._callId = callId;
    mainLogger.debug(`[Telephony_Service_Call_State]: ${state}`);
  }

  constructor() {
    this._serverTelephonyService.createAccount({
      onAccountStateChanged: this._onAccountStateChanged,
    });
  }

  makeCall(toNumber: string) {
    this._serverTelephonyService.makeCall(toNumber, {
      onCallStateChange: this._onCallStateChange,
    });
  }

  hangUp() {
    if (this._callId) {
      this._serverTelephonyService.hangUp(this._callId);
    }
  }
}

export { TelephonyService };
