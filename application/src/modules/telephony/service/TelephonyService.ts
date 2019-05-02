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
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { mainLogger } from 'sdk';
import { TelephonyStore, CALL_TYPE } from '../store';
import { ToastCallError } from './ToastCallError';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AccountUserConfig } from 'sdk/module/account/config';

const ANONYMOUS = 'anonymous';
const DIRECT_NUMBER = 'DirectNumber';
class TelephonyService {
  static TAG: string = '[UI TelephonyService] ';
  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
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

  private _onReceiveIncomingCall = async (callInfo: TelephonyCallInfo) => {
    const { fromName, fromNum, callId } = callInfo;
    this._callId = callId;
    this._telephonyStore.callType = CALL_TYPE.INBOUND;
    this._telephonyStore.callerName = fromName;
    this._telephonyStore.phoneNumber = fromNum !== ANONYMOUS ? fromNum : '';
    this._telephonyStore.contact = await this.matchContactByPhoneNumber(
      this._telephonyStore.phoneNumber,
    );
    this._telephonyStore.callId = callId;
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
        this._initializeCallState();
        break;
      }
      case RTC_CALL_STATE.DISCONNECTED: {
        this._resetCallState();
        break;
      }
    }
  }

  private _initializeCallState() {
    this._telephonyStore.connected();
    this._telephonyStore.enableHold();
    this._telephonyStore.enableRecord();
  }

  private _resetCallState() {
    this._telephonyStore.end();
    this._telephonyStore.disableHold();
    this._telephonyStore.disableRecord();
    /**
     * Be careful that the server might not respond for the request, so since we design
     * the store as a singleton then we need to restore every single state for the next call.
     */
    this._telephonyStore.setPendingForHoldBtn(false);
    this._telephonyStore.setPendingForRecordBtn(false);
    delete this._callId;
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
        this._telephonyStore.setPendingForHoldBtn(false);
        this._telephonyStore.hold();
        break;
      }
      case RTC_CALL_ACTION.UNHOLD: {
        this._telephonyStore.setPendingForHoldBtn(false);
        this._telephonyStore.unhold();
        break;
      }
      case RTC_CALL_ACTION.START_RECORD: {
        this._telephonyStore.setPendingForRecordBtn(false);
        this._telephonyStore.startRecording();
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._telephonyStore.setPendingForRecordBtn(false);
        this._telephonyStore.stopRecording();
        break;
      }
    }
  }

  // TODO: need more info here
  private _onCallActionFailed = (callAction: RTC_CALL_ACTION): void => {
    switch (callAction) {
      case RTC_CALL_ACTION.CALL_TIME_OUT: {
        ToastCallError.toastCallTimeout();
        break;
      }
      case RTC_CALL_ACTION.HOLD: {
        this._telephonyStore.setPendingForHoldBtn(false);
        ToastCallError.toastFailedToHold();
        this._telephonyStore.unhold();
        break;
      }
      case RTC_CALL_ACTION.UNHOLD: {
        this._telephonyStore.setPendingForHoldBtn(false);
        ToastCallError.toastFailedToResume();
        this._telephonyStore.hold();
        break;
      }
      case RTC_CALL_ACTION.START_RECORD: {
        // TODO: FIJI-4803 phase2 error handlings
        this._telephonyStore.setPendingForRecordBtn(false);
        ToastCallError.toastFailedToRecord();
        this._telephonyStore.stopRecording();
        break;
      }
      case RTC_CALL_ACTION.STOP_RECORD: {
        this._telephonyStore.setPendingForRecordBtn(false);
        ToastCallError.toastFailedToStopRecording();
        this._telephonyStore.startRecording();
        break;
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

  getDefaultCallerId = () => {
    const userConfig = new AccountUserConfig();
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const person = personService.getSynchronously(userConfig.getGlipUserId());
    if (person && person.rc_phone_numbers) {
      const res = person.rc_phone_numbers.find(
        (phoneNumber: PhoneNumberModel) => {
          return phoneNumber.usageType === DIRECT_NUMBER;
        },
      );
      if (res) {
        return res.phoneNumber;
      }
      return '';
    }
    return '';
  }

  makeCall = async (toNumber: string) => {
    const callerId = this.getDefaultCallerId();
    const rv = await this._serverTelephonyService.makeCall(toNumber, callerId);

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

  holdOrUnhold = () => {
    if (
      this._telephonyStore.holdDisabled ||
      this._telephonyStore.pendingForHold ||
      !this._callId
    ) {
      mainLogger.debug(
        `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_PENDING_STATE]: ${
          this._telephonyStore.pendingForHold
        }`,
      );
      mainLogger.debug(
        `${TelephonyService.TAG}[TELEPHONY_HOLD_BUTTON_DISABLE_STATE]: ${
          this._telephonyStore.holdDisabled
        }`,
      );
      return;
    }
    if (this._telephonyStore.held) {
      mainLogger.info(`${TelephonyService.TAG}unhold call id=${this._callId}`);
      this._telephonyStore.setPendingForHoldBtn(true);
      return this._serverTelephonyService.unhold(this._callId);
    }
    mainLogger.info(`${TelephonyService.TAG}hold call id=${this._callId}`);
    this._telephonyStore.hold(); // for swift UX
    this._telephonyStore.setPendingForHoldBtn(true);
    return this._serverTelephonyService.hold(this._callId);
  }

  startOrStopRecording = () => {
    if (
      !this._callId ||
      this._telephonyStore.pendingForRecord ||
      this._telephonyStore.recordDisabled
    ) {
      return;
    }
    if (this._telephonyStore.isRecording) {
      this._telephonyStore.setPendingForRecordBtn(true);
      return this._serverTelephonyService.stopRecord(this._callId as string);
    }

    this._telephonyStore.setPendingForRecordBtn(true);
    this._telephonyStore.startRecording(); // for swift UX
    return this._serverTelephonyService.startRecord(this._callId as string);
  }

  dtmf = (digits: string) => {
    // TODO: determine if the dialer is minimized
    this._telephonyStore.inputKey(digits);
    return this._serverTelephonyService.dtmf(this._callId as string, digits);
  }
}

export { TelephonyService };
