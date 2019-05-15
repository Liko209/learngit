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
  RTC_REPLY_MSG_PATTERN,
  RTC_REPLY_MSG_TIME_UNIT,
} from 'sdk/module/telephony';
import {
  MAKE_CALL_ERROR_CODE,
  TelephonyCallInfo,
} from 'sdk/module/telephony/types';
import { RC_INFO, notificationCenter } from 'sdk/service';
import { PersonService, ContactType } from 'sdk/module/person';
import { GlobalConfigService } from 'sdk/module/config';
import { PhoneNumberModel } from 'sdk/module/person/entity';
import { mainLogger } from 'sdk';
import { TelephonyStore, CALL_TYPE } from '../store';
import { ToastCallError } from './ToastCallError';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { ANONYMOUS } from '../interface/constant';
import { AccountUserConfig } from 'sdk/module/account/config';
import { reaction, IReactionDisposer, runInAction, action } from 'mobx';
import { RCInfoService } from 'sdk/module/rcInfo';
import { Profile } from 'sdk/module/profile/entity';
import ProfileModel from '@/store/models/Profile';
import { getSingleEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import { CALL_WINDOW_STATUS } from '../FSM';

const ringTone = require('./sounds/Ringtone.mp3');

const DIRECT_NUMBER = 'DirectNumber';
const DIALER_OPENED_KEY = 'dialerOpenedCount';

class TelephonyService {
  static TAG: string = '[UI TelephonyService] ';

  @inject(TelephonyStore) private _telephonyStore: TelephonyStore;
  // prettier-ignore
  private _serverTelephonyService = ServiceLoader.getInstance<ServerTelephonyService>(ServiceConfig.TELEPHONY_SERVICE);
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );
  private _globalConfigService = ServiceLoader.getInstance<GlobalConfigService>(
    ServiceConfig.GLOBAL_CONFIG_SERVICE,
  );
  private _callId?: string;
  private _shouldResumeDisposer: IReactionDisposer;
  private _shouldDisplayDialerDisposer: IReactionDisposer;
  private _callerPhoneNumberDisposer: IReactionDisposer;
  private _incomingCallDisposer: IReactionDisposer;

  private _onAccountStateChanged = (state: RTC_ACCOUNT_STATE) => {
    mainLogger.debug(
      `${TelephonyService.TAG}[Telephony_Service_Account_State]: ${state}`,
    );
  }

  private _onMadeOutgoingCall = (callId: string) => {
    // TODO: This should be a list in order to support multiple call
    // Ticket: https://jira.ringcentral.com/browse/FIJI-4274
    mainLogger.info(
      `${TelephonyService.TAG} Call object created, call id=${callId}`,
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
    const phoneNumber = fromNum !== ANONYMOUS ? fromNum : '';
    if (phoneNumber !== this._telephonyStore.phoneNumber) {
      this._telephonyStore.isContactMatched = false;
      this._telephonyStore.phoneNumber = phoneNumber;
    }
    this._telephonyStore.callId = callId;
    this._telephonyStore.incomingCall();
    mainLogger.info(
      `${TelephonyService.TAG}Call object created, call id=${
        callInfo.callId
      }, from name=${fromName}, from num=${fromNum}`,
    );
  }

  private _playRingtone = async (shouldMute: boolean = false) => {
    if (!this._canPlayMP3 || this._isRingtonePlaying) {
      return;
    }

    (this._audio as HTMLAudioElement).src = ringTone;
    (this._audio as HTMLAudioElement).currentTime = 0;
    (this._audio as HTMLAudioElement).autoplay = true;
    (this._audio as HTMLAudioElement).muted = shouldMute;
    mainLogger
      .tags(TelephonyService.TAG)
      .info('ready to play the ringtone', new Date());
    try {
      await (this._audio as HTMLAudioElement).play();
      mainLogger
        .tags(TelephonyService.TAG)
        .info('ringtone playing', new Date());
    } catch (e) {
      mainLogger
        .tags(TelephonyService.TAG)
        .error(
          `play ringtone fail, code: ${e.code}, the message is: ${
            e.message
          }, ${new Date()}`,
        );
      switch (e.code) {
        case 0:
          this._pauseRingtone();
          ['mousedown', 'keydown'].forEach(evt => {
            const cb = () => {
              if (!this._telephonyStore.hasIncomingCall) {
                return;
              }
              this._playRingtone();
              window.removeEventListener(evt, cb);
            };
            window.addEventListener(evt, cb);
          });
          return;
        default:
          // any other errors, pause and report through sentry
          this._pauseRingtone();
          throw e;
      }
    }
  }

  private _pauseRingtone = async () => {
    if (!this._audio) {
      return;
    }
    mainLogger.tags(TelephonyService.TAG).info(`pause audio, ${new Date()}`);
    (this._audio as HTMLAudioElement).pause();
    this._audio.src = '';
    return;
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

  private _setDialerOpenedCount = () => {
    const cache = this._getDialerOpenedCount() || {};
    const glipUserId = this._getGlipUserId();
    const openedTimes = cache[glipUserId] || 0;

    this._globalConfigService.put(
      TelephonyService.TAG,
      DIALER_OPENED_KEY,
      Object.assign(cache, {
        [glipUserId]: openedTimes + 1,
      }),
    );
  }

  private _getDialerOpenedCount = () => {
    const cache = this._globalConfigService.get(
      TelephonyService.TAG,
      DIALER_OPENED_KEY,
    );
    this._telephonyStore.dialerOpenedCount =
      (cache && cache[this._getGlipUserId()]) || 0;
    return cache;
  }

  private _getGlipUserId = () => {
    // FIXME: register this on service loader
    const userConfig = new AccountUserConfig();
    return userConfig.getGlipUserId();
  }

  init = () => {
    this._telephonyStore.canUseTelephony = true;

    if (document && document.createElement) {
      this._audio = document.createElement('audio');
      this._audio.loop = true;
    }

    this._getDialerOpenedCount();

    // Read firstly
    this._getCallerPhoneNumberList();

    notificationCenter.on(
      RC_INFO.EXTENSION_PHONE_NUMBER_LIST,
      this._getCallerPhoneNumberList,
    );

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

    this._shouldDisplayDialerDisposer = reaction(
      () =>
        this._telephonyStore.shouldDisplayDialer &&
        this._telephonyStore.callWindowState !== CALL_WINDOW_STATUS.MINIMIZED,
      shouldDisplayDialer => {
        if (!shouldDisplayDialer) {
          return;
        }
        this._telephonyStore.shouldResume = true;
      },
      { fireImmediately: true },
    );

    this._shouldResumeDisposer = reaction(
      () => ({
        shouldResume: this._telephonyStore.shouldResume,
        defaultCallerPhoneNumber: this._telephonyStore.defaultCallerPhoneNumber,
      }),
      async ({
        shouldResume,
        defaultCallerPhoneNumber,
      }: {
        shouldResume: boolean;
        defaultCallerPhoneNumber: string;
      }) => {
        // restore things to default values
        if (!shouldResume) {
          runInAction(() => {
            this.deleteInputString(true);
            this.setCallerPhoneNumber(defaultCallerPhoneNumber);
          });
        }
      },
      { fireImmediately: true },
    );

    this._callerPhoneNumberDisposer = reaction(
      () => {
        const defaultNumberId = getSingleEntity<Profile, ProfileModel>(
          ENTITY_NAME.PROFILE,
          'defaultNumberId',
        );
        return {
          defaultNumberId,
          callerPhoneNumberList: this._telephonyStore.callerPhoneNumberList,
        };
      },
      async ({
        defaultNumberId,
        callerPhoneNumberList,
      }: {
        defaultNumberId: number;
        callerPhoneNumberList: PhoneNumberModel[];
      }) => {
        if (!callerPhoneNumberList) {
          return;
        }
        if (
          typeof defaultNumberId !== 'number' &&
          callerPhoneNumberList &&
          callerPhoneNumberList.length
        ) {
          this._telephonyStore.updateDefaultChosenNumber();
          return;
        }
        const defaultPhoneNumber = callerPhoneNumberList.find(
          callerPhoneNumber => callerPhoneNumber.id === defaultNumberId,
        );
        if (defaultPhoneNumber) {
          this._telephonyStore.updateDefaultChosenNumber(
            defaultPhoneNumber.phoneNumber,
          );
        }
      },
      { fireImmediately: true },
    );

    this._incomingCallDisposer = reaction(
      () => this._telephonyStore.hasIncomingCall,
      hasIncomingCall => {
        if (hasIncomingCall) {
          this._playRingtone();
        } else {
          this._pauseRingtone();
        }
      },
      { fireImmediately: true },
    );

    // triggering a change of caller id list
    this._getCallerPhoneNumberList();
  }

  getDefaultCallerId = () => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const person = personService.getSynchronously(this._getGlipUserId());
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
    // FIXME: move this logic to SDK and always using callerID
    const phoneNumber = this._telephonyStore.callerPhoneNumberList.find(
      phone =>
        phone.phoneNumber === this._telephonyStore.chosenCallerPhoneNumber,
    );
    mainLogger.info(
      `${TelephonyService.TAG}Make call with: ${
        this._telephonyStore.chosenCallerPhoneNumber
      }`,
    );
    const id = `${(phoneNumber && phoneNumber.id) || ANONYMOUS}`;
    const rv = await this._serverTelephonyService.makeCall(toNumber, id);

    switch (true) {
      case MAKE_CALL_ERROR_CODE.NO_INTERNET_CONNECTION === rv: {
        ToastCallError.toastNoNetwork();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.INVALID_PHONE_NUMBER === rv: {
        ToastCallError.toastInvalidNumber();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false;
      }
      case MAKE_CALL_ERROR_CODE.NO_ERROR !== rv: {
        ToastCallError.toastCallFailed();
        mainLogger.error(
          `${TelephonyService.TAG}Make call error: ${rv.toString()}`,
        );
        return false; // For other errors, need not show call UI
      }
    }

    this._telephonyStore.phoneNumber = toNumber;
    return true;
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

  @action
  minimize = () => {
    const dialBtnPos = this._dialpadBtnRect;
    const _dialerRect = this._dialerRect;

    if (dialBtnPos && _dialerRect) {
      // animation
      this._telephonyStore.dialerMinimizeTranslateX =
        dialBtnPos.left +
        dialBtnPos.width / 2 -
        (_dialerRect.left + _dialerRect.width / 2);

      this._telephonyStore.dialerMinimizeTranslateY =
        dialBtnPos.top +
        dialBtnPos.height / 2 -
        (_dialerRect.top + _dialerRect.height / 2);

      this._telephonyStore.dialerWidth = _dialerRect.width;
      this._telephonyStore.dialerHeight = _dialerRect.height;

      this._telephonyStore.startAnimation();
      return;
    }
    // when no destination, hide the dialer directly.
    this._telephonyStore.closeDialer();
  }

  @action
  onAnimationEnd = async () => {
    this._telephonyStore.closeDialer();
    this._telephonyStore.dialerMinimizeTranslateX = NaN;
    this._telephonyStore.dialerMinimizeTranslateY = NaN;
    this._telephonyStore.dialerWidth = NaN;
    this._telephonyStore.dialerHeight = NaN;
    this._telephonyStore.stopAnimation();
  }

  maximize = () => {
    this._telephonyStore.openDialer();
  }

  onAfterDialerOpen = () => {
    this._setDialerOpenedCount();
    this._getDialerOpenedCount();
  }

  handleWindow = () => {
    if (this._telephonyStore.isDetached) {
      this._telephonyStore.attachedWindow();
      return;
    }
    this._telephonyStore.detachedWindow();
  }

  muteOrUnmute = () => {
    if (this._callId) {
      this._telephonyStore.switchBetweenMuteAndUnmute();
      const { isMute } = this._telephonyStore;
      isMute
        ? this._serverTelephonyService.mute(this._callId)
        : this._serverTelephonyService.unmute(this._callId);
      mainLogger.info(
        `${TelephonyService.TAG}${isMute ? 'mute' : 'unmute'} call id=${
          this._callId
        }`,
      );
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
    this._telephonyStore.inputKey(digits);
    return this._serverTelephonyService.dtmf(this._callId as string, digits);
  }

  callComponent = () => import('../container/Call');

  setCallerPhoneNumber = (phoneNumber?: string) => {
    if (
      typeof phoneNumber !== 'string' &&
      this._telephonyStore.defaultCallerPhoneNumber
    ) {
      this._telephonyStore.chosenCallerPhoneNumber = this._telephonyStore.defaultCallerPhoneNumber;
    } else if (
      typeof phoneNumber !== 'string' &&
      this._telephonyStore.callerPhoneNumberList &&
      this._telephonyStore.callerPhoneNumberList.length
    ) {
      this._telephonyStore.chosenCallerPhoneNumber = this._telephonyStore.callerPhoneNumberList[0].phoneNumber;
    } else if (typeof phoneNumber === 'string' && phoneNumber.length) {
      this._telephonyStore.chosenCallerPhoneNumber = phoneNumber;
    }

    mainLogger.info(
      `${TelephonyService.TAG} set caller phone number: ${
        this._telephonyStore.chosenCallerPhoneNumber
      }`,
    );
  }

  concatInputString = (str: string) => {
    if (
      this._telephonyStore.inputString.length <
      this._telephonyStore.maximumInputLength
    ) {
      this._telephonyStore.inputString += str;
    }
  }

  updateInputString = (str: string) => {
    this._telephonyStore.inputString = str.slice(
      0,
      this._telephonyStore.maximumInputLength,
    );
  }

  deleteInputString = (clearAll: boolean = false) => {
    if (clearAll) {
      this._telephonyStore.inputString = '';
      return;
    }
    this._telephonyStore.inputString = this._telephonyStore.inputString.slice(
      0,
      this._telephonyStore.inputString.length - 1,
    );
  }

  dispose = () => {
    this._shouldResumeDisposer && this._shouldResumeDisposer();
    this._shouldDisplayDialerDisposer && this._shouldDisplayDialerDisposer();
    this._callerPhoneNumberDisposer && this._callerPhoneNumberDisposer();
    this._incomingCallDisposer && this._incomingCallDisposer();

    this._pauseRingtone();

    delete this._telephonyStore;
    delete this._serverTelephonyService;
    delete this._callId;
    delete this._shouldResumeDisposer;
    delete this._shouldDisplayDialerDisposer;
    delete this._callerPhoneNumberDisposer;
    delete this._incomingCallDisposer;
    delete this._audio;
  }

  @action
  _getCallerPhoneNumberList = async () => {
    const callerPhoneNumberList = await this._rcInfoService.getCallerIdList();
    runInAction(() => {
      this._telephonyStore.callerPhoneNumberList = callerPhoneNumberList;
    });
  }

  get lastCalledNumber() {
    return this._serverTelephonyService.getLastCalledNumber() || '';
  }

  private get _dialpadBtnRect() {
    const destination = document.getElementById(
      this._telephonyStore.dialpadBtnId,
    );
    if (!destination) {
      return null;
    }
    return destination.getBoundingClientRect();
  }

  private get _dialerRect() {
    const dialer = document.getElementById(this._telephonyStore.dialerId);
    if (!dialer) {
      return null;
    }
    return dialer.getBoundingClientRect();
  }

  private _audio: HTMLAudioElement | null;

  private get _isRingtonePlaying() {
    // https://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error
    return (
      this._audio &&
      this._audio.currentTime > 0 &&
      !this._audio.paused &&
      !this._audio.ended &&
      this._audio.readyState > 2
    );
  }

  private get _canPlayMP3() {
    return this._audio && this._audio.canPlayType('audio/mp3') !== '';
  }
  startReply = () => {
    if (!this._callId) {
      return;
    }
    return this._serverTelephonyService.startReply(this._callId as string);
  }

  replyWithMessage = (message: string) => {
    if (!this._callId) {
      return;
    }
    return this._serverTelephonyService.replyWithMessage(
      this._callId as string,
      message,
    );
  }

  replyWithPattern = (
    pattern: RTC_REPLY_MSG_PATTERN,
    time?: number,
    timeUnit?: RTC_REPLY_MSG_TIME_UNIT,
  ) => {
    if (!this._callId) {
      return;
    }
    return this._serverTelephonyService.replyWithPattern(
      this._callId as string,
      pattern,
      time,
      timeUnit,
    );
  }
}

export { TelephonyService };
