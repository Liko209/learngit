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
import {
  MAKE_CALL_ERROR_CODE,
  TelephonyCallInfo,
} from 'sdk/module/telephony/types';
import { PersonService, ContactType } from 'sdk/module/person';
import { mainLogger } from 'sdk';
import { TelephonyStore, CALL_TYPE } from '../store';
import { ToastCallError } from './ToastCallError';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

const ANONYMOUS = 'anonymous';
class TelephonyService {
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  static TAG: string = '[UI TelephonyService] ';

  // prettier-ignore
  private _serverTelephonyService = ServiceLoader.getInstance<ServerTelephonyService>(ServiceConfig.TELEPHONY_SERVICE);
  private _callId?: string;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(
      `${TelephonyService.TAG}[Telephony_Service_Account_State]: ${state}`,
    );
  }

  private _onMadeOutgoingCall = (callId: string) => {
    // TODO: This should be a list in order to support multiple call
    // Ticket: https://jira.ringcentral.com/browse/FIJI-4274
    mainLogger.info(
      `${TelephonyService.TAG}Call object created, call id=${callId}`,
    );
    this._callId = callId;
    this._telephonyStore.callType = CALL_TYPE.OUTBOUND;
    this._telephonyStore.directCall();
  }

  private _onReceiveIncomingCall = (callInfo: TelephonyCallInfo) => {
    const { fromName, fromNum, callId } = callInfo;
    this._callId = callId;
    this._telephonyStore.callType = CALL_TYPE.INBOUND;
    this._telephonyStore.phoneNumber = fromNum !== ANONYMOUS ? fromNum : '';
    this._telephonyStore.incomingCall();
    mainLogger.info(
      `${TelephonyService.TAG}Call object created, call id=${
        callInfo.callId
      }, from name=${fromName}, from num=${fromNum}`,
    );
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
    switch (callAction) {
      case RTC_CALL_ACTION.HOLD: {
        this._telephonyStore.unhold();
        this._telephonyStore.setPendingForHoldBtn(false);
      }
      case RTC_CALL_ACTION.UNHOLD: {
        this._telephonyStore.hold();
        this._telephonyStore.setPendingForHoldBtn(false);
      }
    }
  }

  private _onCallActionFailed = (callAction: RTC_CALL_ACTION): void => {
    switch (callAction) {
      case RTC_CALL_ACTION.CALL_TIME_OUT: {
        ToastCallError.toastCallTimeout();
      }
      case RTC_CALL_ACTION.HOLD: {
        ToastCallError.toastFailedToHold();
        this._telephonyStore.setPendingForHoldBtn(false);
        this._telephonyStore.unhold();
      }
      case RTC_CALL_ACTION.UNHOLD: {
        ToastCallError.toastFailedToResume();
        this._telephonyStore.setPendingForHoldBtn(false);
        this._telephonyStore.hold();
      }
    }
  }

  init = () => {
    this._serverTelephonyService.createAccount(
      {
        onAccountStateChanged: this._onAccountStateChanged,
        onMadeOutgoingCall: this._onMadeOutgoingCall,
        onReceiveIncomingCall: this._onReceiveIncomingCall,
      },
      {
        onCallStateChange: this._onCallStateChange,
        onCallActionSuccess: this._onCallActionSuccess,
        onCallActionFailed: this._onCallActionFailed,
      },
    );
  }

  makeCall = async (toNumber: string) => {
    const rv = await this._serverTelephonyService.makeCall(toNumber);

    switch (true) {
      case MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION === rv: {
        ToastCallError.toastNoNetwork();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        break;
      }
      case MAKE_CALL_ERROR_CODE.NO_ERROR !== rv: {
        ToastCallError.toastCallFailed();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return; // For other errors, need not show call UI
      }
    }

    this._telephonyStore.phoneNumber = toNumber;
  }

  directCall = (toNumber: string) => {
    // TODO: SDK telephony service can't support multiple call, we need to check here. When it supports, we can remove it.
    // Ticket: https://jira.ringcentral.com/browse/FIJI-4275
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

  answer = () => {
    if (this._callId) {
      mainLogger.info(`${TelephonyService.TAG}answer call id=${this._callId}`);
      this._telephonyStore.answer();
      this._serverTelephonyService.answer(this._callId);
    }
  }

  sendToVoiceMail = () => {
    if (this._callId) {
      mainLogger.info(
        `${TelephonyService.TAG}send to voicemail call id=${this._callId}`,
      );
      this._serverTelephonyService.sendToVoiceMail(this._callId);
    }
  }

  ignore = () => {
    if (this._callId) {
      mainLogger.info(`${TelephonyService.TAG}ignore call id=${this._callId}`);
      this._serverTelephonyService.ignore(this._callId);
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

  muteOrUnmute = (mute: boolean) => {
    if (this._callId) {
      mainLogger.info(
        `${TelephonyService.TAG}${mute ? 'mute' : 'unmute'} call id=${
        this._callId
        }`,
      );
      mute
        ? this._serverTelephonyService.mute(this._callId)
        : this._serverTelephonyService.unmute(this._callId);
    }
  }

  matchContactByPhoneNumber = async (phone: string) => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );

    return await personService.matchContactByPhoneNumber(
      phone,
      ContactType.GLIP_CONTACT,
    );
  }

  getAllCallCount = () => {
    return this._serverTelephonyService.getAllCallCount();
  }

  hold = () => {
    if (this._callId) {
      mainLogger.info(
        `${TelephonyService.TAG}hold call id=${
        this._callId
        }`,
      );
      this._telephonyStore.setPendingForHoldBtn(true);
      return this._serverTelephonyService.hold(this._callId);
    }
  }
  unhold = () => {
    if (this._callId) {
      mainLogger.info(
        `${TelephonyService.TAG}unhold call id=${
        this._callId
        }`,
      );
      this._telephonyStore.setPendingForHoldBtn(true);
      return this._serverTelephonyService.unhold(this._callId);
    }
  }
}

export { TelephonyService };
