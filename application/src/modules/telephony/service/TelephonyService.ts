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
import { PersonService, ContactType } from 'sdk/module/person';
import { mainLogger } from 'sdk';
import { TelephonyStore } from '../store';
import { ToastCallError } from './ToastCallError';

class TelephonyService {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  static TAG: string = '[UI TelephonyService] ';

  private _serverTelephonyService: ServerTelephonyService = ServerTelephonyService.getInstance();
  private _personService: PersonService = PersonService.getInstance();
  private _callId?: string;
  private _registeredOnbeforeunload: boolean = false;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(
      `${TelephonyService.TAG}[Telephony_Service_Account_State]: ${state}`,
    );
  }

  private _onMadeOutgoingCall = (callId: string) => {
    // TODO: This should be a list in order to support multiple call
    mainLogger.info(
      `${TelephonyService.TAG}Call object created, call id=${callId}`,
    );
    this._callId = callId;
    this._telephonyStore.directCall();
  }

  private _onCallStateChange = (callId: string, state: RTC_CALL_STATE) => {
    mainLogger.debug(
      `${TelephonyService.TAG}[Telephony_Service_Call_State]: ${state}`,
    );

    switch (state) {
      case RTC_CALL_STATE.CONNECTED: {
        this._telephonyStore.connected();
        break;
      }
      case RTC_CALL_STATE.DISCONNECTED: {
        this._telephonyStore.end();
        break;
      }
    }
  }

  private _onCallActionSuccess = (
    callAction: RTC_CALL_ACTION,
    options: RTCCallActionSuccessOptions,
  ) => {
    mainLogger.info(
      `${
        TelephonyService.TAG
      }Call action: ${callAction} succeed, options: ${options}`,
    );
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
      onMadeOutgoingCall: this._onMadeOutgoingCall,
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
      mainLogger.error(
        `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
      );
    } else if (MAKE_CALL_ERROR_CODE.NO_ERROR !== rv) {
      ToastCallError.toastCallFailed();
      mainLogger.error(
        `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
      );
      return; // For other errors, need not show call UI
    }
    this._telephonyStore.phoneNumber = toNumber;
    // TODO: There is a LeaveBlockerService, but it can't support multi-blocker. When it can support, we should use that service.
    if (!this._registeredOnbeforeunload) {
      // If makeCall return success, register this handle
      window.addEventListener(
        'beforeunload',
        (e: Event) => {
          e.preventDefault();
          if (this._serverTelephonyService.getAllCallCount() > 0) {
            mainLogger.info(
              `${
                TelephonyService.TAG
              }Notify user has call count: ${this._serverTelephonyService.getAllCallCount()}`,
            );
            const confirmationMessage = true;

            (e || window.event).returnValue = confirmationMessage; // Gecko + IE
            return confirmationMessage;
          }
          // if we return nothing here (just calling return;) then there will be no pop-up question at all
          return;
        },
        false,
      );
      this._registeredOnbeforeunload = true;
    }
  }

  directCall = (toNumber: string) => {
    // TODO: SDK telephony service can't support multiple call, we need to check here. When it supports, we can remove it.
    if (this._serverTelephonyService.getAllCallCount() > 0) {
      mainLogger.warn(
        `${TelephonyService.TAG}Only allow to make one call at the same time`,
      );
      return;
    }
    this.makeCall(toNumber);
  }

  hangUp = () => {
    if (this._callId) {
      mainLogger.info(`${TelephonyService.TAG}Hang up call id=${this._callId}`);
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

  matchContactByPhoneNumber = async (phone: string) => {
    return await this._personService.matchContactByPhoneNumber(
      phone,
      ContactType.GLIP_CONTACT,
    );
  }
}

export { TelephonyService };
