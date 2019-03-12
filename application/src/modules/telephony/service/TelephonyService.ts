/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-04 13:42:30
 * Copyright © RingCentral. All rights reserved.
 */

import { inject } from 'framework';
import {
  TelephonyService as ServerTelephonyService,
  RTC_ACCOUNT_STATE,
  RTC_CALL_STATE,
} from 'sdk/module/telephony';
import { mainLogger } from 'sdk';
import { TelephonyStore } from '../store';

class TelephonyService {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;

  private _serverTelephonyService: ServerTelephonyService = ServerTelephonyService.getInstance();

  private _callId?: string;

  private _accountState?: RTC_ACCOUNT_STATE;

  private _callCount: number = 0;
  private _registeredOnbeforeunload: boolean = false;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(`[Telephony_Service_Account_State]: ${state}`);
    this._accountState = state;
  }

  private _onCallStateChange = (callId: string, state: RTC_CALL_STATE) => {
    mainLogger.debug(`[Telephony_Service_Call_State]: ${state}`);

    this._callId = callId;
    switch (state) {
      case RTC_CALL_STATE.CONNECTING: {
        mainLogger.info(`Add one call to call count: ${this._callCount}`);
        this._callCount += 1;
        break;
      }
      case RTC_CALL_STATE.CONNECTED: {
        this._telephonyStore.connected();
        break;
      }
      case RTC_CALL_STATE.DISCONNECTED: {
        this._telephonyStore.end();
        mainLogger.info(`Minus one call from call count: ${this._callCount}`);
        this._callCount = this._callCount - 1 > 0 ? this._callCount - 1 : 0;
        break;
      }
    }
  }

  constructor() {
    this._serverTelephonyService.createAccount({
      onAccountStateChanged: this._onAccountStateChanged,
    });
  }

  makeCall = (toNumber: string) => {
    this._serverTelephonyService.makeCall(toNumber, {
      onCallStateChange: this._onCallStateChange,
    });

    // tslint:disable-next-line:no-this-assignment
    const serviceThis = this;
    // TODO: There is a LeaveBlockerService, but it can't support multi-blocker. When it can support, we should use that service.
    if (!this._registeredOnbeforeunload) {
      // If makeCall return success, register this handle
      window.onbeforeunload = function () {
        if (serviceThis._callCount > 0) {
          mainLogger.info(
            `Notify user has call count: ${serviceThis._callCount}`,
          );
          return true;
        }
        // if we return nothing here (just calling return;) then there will be no pop-up question at all
        return;
      };
      this._registeredOnbeforeunload = true;
    }
  }

  directCall = (toNumber: string) => {
    if (this._accountState === RTC_ACCOUNT_STATE.REGISTERED) {
      this.makeCall(toNumber);
      this._telephonyStore.directCall();
    }
  }

  hangUp = () => {
    if (this._callId) {
      this._serverTelephonyService.hangUp(this._callId);
    }
  }

  minimize = () => {
    this._telephonyStore.closeDialer();
  }

  handleWindow = () => {
    if (this._telephonyStore.isDetached) {
      this._telephonyStore.attachedWindow();
      return;
    }
    this._telephonyStore.detachedWindow();
  }
}

export { TelephonyService };
