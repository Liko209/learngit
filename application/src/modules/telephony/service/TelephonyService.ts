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
  RTC_CALL_ACTION,
  RTCCallActionSuccessOptions,
} from 'sdk/module/telephony';
import { MAKE_CALL_ERROR_CODE } from 'sdk/module/telephony/types';
import { mainLogger } from 'sdk';
import { TelephonyStore } from '../store';
import { ToastCallError } from './ToastCallError';

class TelephonyService {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;

  private _serverTelephonyService: ServerTelephonyService = ServerTelephonyService.getInstance();

  private _callId?: string;

  private _accountState?: RTC_ACCOUNT_STATE;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(`[Telephony_Service_Account_State]: ${state}`);
    this._accountState = state;
  }

  private _onCallStateChange = (callId: string, state: RTC_CALL_STATE) => {
    mainLogger.debug(`[Telephony_Service_Call_State]: ${state}`);

    this._callId = callId;
    switch (state) {
      case RTC_CALL_STATE.CONNECTED:
        this._telephonyStore.connected();
        break;
      case RTC_CALL_STATE.DISCONNECTED:
        this._telephonyStore.end();
        break;
    }
  }

  private _onCallActionSuccess = (
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) => {
    mainLogger.info(`Call action: ${callAction} succeed, options: ${options}`);
  }

  private _onCallActionFailed = (callAction: RTC_CALL_ACTION): void => {
    switch (callAction) {
      case RTC_CALL_ACTION.CALL_TIME_OUT: {
        ToastCallError.toastCallTimeout();
      }
    }
  }

  constructor() {
    this._serverTelephonyService.createAccount({
      onAccountStateChanged: this._onAccountStateChanged,
    });
  }

  makeCall = async (toNumber: string) => {
    const rv = await this._serverTelephonyService.makeCall(toNumber, {
      onCallStateChange: this._onCallStateChange,
      onCallActionSuccess: this._onCallActionSuccess,
      onCallActionFailed: this._onCallActionFailed,
    });

    // TODO: When it reaches the max call count, we should not show new call UI
    if (MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION === rv) {
      ToastCallError.toastNoNetwork();
    } else if (MAKE_CALL_ERROR_CODE.NO_ERROR !== rv) {
      ToastCallError.toastCallFailed();
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
