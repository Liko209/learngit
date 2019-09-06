/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-02-28 15:10:11
 * Copyright © RingCentral. All rights reserved.
 */

import { LifeCycle } from 'ts-javascript-state-machine';
import { observable, computed, action, reaction } from 'mobx';
import { sortBy, reverse } from 'lodash';
import { PersonService } from 'sdk/module/person';
import { PhoneNumberService } from 'sdk/module/phoneNumber';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { i18nP } from '@/utils/i18nT';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import PersonModel from '@/store/models/Person';
import { Person, PhoneNumberModel } from 'sdk/module/person/entity';
import { Voicemail } from 'sdk/module/RCItems/voicemail/entity/Voicemail';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { v4 } from 'uuid';
import {
  CALL_WINDOW_STATUS,
  CallWindowFSM,
  CALL_WINDOW_TRANSITION_NAMES,
} from '../FSM';
import {
  ANONYMOUS_NAME,
  ANONYMOUS_NUM,
  INCOMING_STATE,
  DIALING,
  INITIAL_REPLY_COUNTDOWN_TIME,
  CALL_TYPE,
} from '../interface/constant';
import {
  Call,
  HOLD_STATE,
  RECORD_STATE,
  MUTE_STATE,
  CALL_STATE,
  CALL_DIRECTION,
} from 'sdk/module/telephony/entity';
import { ENTITY } from 'sdk/service';
import CallModel from '@/store/models/Call';
import { FetchSortableDataListHandler } from '@/store/base/fetch/FetchSortableDataListHandler';
import { formatSeconds } from './utils';
import { IMediaService } from '@/interface/media';
import { VoicemailNotification, MissedCallNotification } from './types';

type SelectedCallItem = { phoneNumber: string; index: number };
const LOCAL_CALL_WINDOW_STATUS_KEY = 'localCallWindowStatusKey';

class TelephonyStore {
  private _callWindowFSM = new CallWindowFSM();
  private _intervalReplyId?: NodeJS.Timeout;
  private _history: Set<CALL_DIRECTION | typeof DIALING> = new Set();
  /**
   * foc
   */
  private _sortableListHandler: FetchSortableDataListHandler<Call>;
  private _phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
    ServiceConfig.PHONE_NUMBER_SERVICE,
  );

  @IMediaService private _mediaService: IMediaService;

  maximumInputLength = 30;

  @observable
  isConference: boolean = false;

  @observable
  canUseTelephony: boolean = false;

  @observable
  callWindowState: CALL_WINDOW_STATUS = this._callWindowFSM.state;

  isStopRecording: boolean = false; // whether the stop recording request is on the flight

  @observable
  uid?: number;

  @observable
  isContactMatched: boolean = false;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  replyCountdownTime?: number = INITIAL_REPLY_COUNTDOWN_TIME;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  keypadEntered: boolean = false;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  enteredKeys: string = '';

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  customReplyMessage: string = '';

  @observable
  shouldKeepDialog: boolean;

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  inputString: string = '';

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  forwardString: string = '';

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  transferString: string = '';

  @observable
  private _dialerString: string = '';

  @observable
  isValidInputStringNumber: boolean = false;

  @observable
  dialerInputFocused: boolean = false;

  @observable
  hasManualSelected: boolean = false;

  @observable
  chosenCallerPhoneNumber: string;

  @observable
  defaultCallerPhoneNumber: string;

  @observable
  callerPhoneNumberList: PhoneNumberModel[] = [];

  @observable
  dialerOpenedCount: number;

  @observable
  startMinimizeAnimation: boolean = false;

  @observable
  dialerMinimizeTranslateX: number = NaN;

  @observable
  dialerMinimizeTranslateY: number = NaN;

  @observable
  dialerHeight: number = NaN;

  @observable
  dialerWidth: number = NaN;

  dialpadBtnId = v4();
  dialerId = v4();

  @observable
  incomingState: INCOMING_STATE = INCOMING_STATE.IDLE;

  @observable
  dialerFocused: boolean;

  @observable
  isRecentCalls: boolean = false;

  @observable
  private _isRecentCallsInDialerPage: boolean = false;

  @observable
  isTransferPage: boolean = false;

  @observable
  isWarmTransferPage: boolean = false;

  @observable
  canCompleteTransfer: boolean = true;

  @observable
  selectedCallItem: SelectedCallItem = {
    phoneNumber: '',
    index: NaN,
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @observable
  firstLetterEnteredThroughKeypadForInputString: boolean;
  @observable
  firstLetterEnteredThroughKeypadForForwardString: boolean;

  @observable
  enteredDialer: boolean = false;

  @observable
  isExt: boolean = false;

  // TODO: current call id
  @observable
  currentCallId?: number;

  // only exist one e911 dialog
  @observable
  hasShowE911: boolean = false;

  @observable
  isBackToDefaultPos: boolean = false;

  @observable
  voicemailNotification: VoicemailNotification;

  @observable
  missedCallNotification: MissedCallNotification;

  @observable
  isEndMultipleIncomingCall: boolean = false;

  constructor() {
    type FSM = '_callWindowFSM';
    type FSMProps = 'callWindowState';

    this._sortableListHandler = new FetchSortableDataListHandler<Call>(
      undefined,
      {
        entityName: ENTITY_NAME.CALL,
        isMatchFunc: (call: Call) =>
          call.call_state !== CALL_STATE.DISCONNECTED,
        transformFunc: i => ({
          id: i.id,
          sortValue: i.id,
        }),
        eventName: ENTITY.CALL,
      },
    );

    [['_callWindowFSM', 'callWindowState']].forEach(
      ([fsm, observableProp]: [FSM, FSMProps]) => {
        this[fsm].observe('onAfterTransition', (lifecycle: LifeCycle) => {
          const { to } = lifecycle;
          this[observableProp] = to as CALL_WINDOW_STATUS;
        });
      },
    );

    reaction(
      () => this.phoneNumber,
      async (phoneNumber: string) => {
        if (phoneNumber) {
          const contact = await this._matchContactByPhoneNumber(phoneNumber);
          this.uid = contact ? contact.id : undefined;
        } else {
          this.uid = undefined;
        }
        this.isContactMatched = true;
      },
      { fireImmediately: true },
    );

    // TODO: move out of telephony store when minization won't destroy the telephony dialog
    reaction(
      () => this.inputString.length,
      async (length: number) => {
        if (!length) {
          this.resetFirstLetterThroughKeypadForInputString();
          this.transferString = this.inputString;
        }
        this.resetCallItem();
        this.isValidInputStringNumber = await this._phoneNumberService.isValidNumber(
          this.inputString,
        );
      },
    );

    // TODO: move out of telephony store when minization won't destroy the telephony dialog
    reaction(
      () => this.forwardString.length,
      length => {
        if (!length) {
          this.resetFirstLetterThroughKeypadForForwardString();
        }
      },
    );

    reaction(
      () => ({
        isMultipleCall: this.isMultipleCall,
        isIncomingCall: this.isIncomingCall,
      }),
      ({ isMultipleCall, isIncomingCall }) => {
        if (isMultipleCall && isIncomingCall) {
          this.changeBackToDefaultPos(true);
          return;
        }
      },
    );

    reaction(
      () => this.hasActiveCall,
      hasActiveCall => {
        hasActiveCall
          ? this._mediaService.setDuckVolume(0.7)
          : this._mediaService.setDuckVolume(1);
      },
    );
  }

  @computed
  get person() {
    if (!this.uid) return null;
    return getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, this.uid);
  }

  @computed
  get displayName() {
    if (!this.isContactMatched) {
      return undefined;
    }
    if (this.person) {
      return this.person.userDisplayName;
    }
    return this.callerName === ANONYMOUS_NAME || !this.callerName
      ? ''
      : this.callerName;
  }

  private _formatPhoneNumber = async (phoneNumber: string) => {
    const phoneNumberService = ServiceLoader.getInstance<PhoneNumberService>(
      ServiceConfig.PHONE_NUMBER_SERVICE,
    );

    return await phoneNumberService.getLocalCanonical(phoneNumber);
  };

  private _matchPersonByPhoneNumber = async (phoneNumber: string) => {
    const matchedContact = await this._matchContactByPhoneNumber(phoneNumber);

    return (
      matchedContact &&
      getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, matchedContact.id)
    );
  };

  private _matchContactByPhoneNumber = async (phone: string) => {
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );

    return await personService.matchContactByPhoneNumber(phone);
  };

  private get _localCallWindowStatus() {
    const localCallWindowStatus = localStorage.getItem(
      LOCAL_CALL_WINDOW_STATUS_KEY,
    );
    return localCallWindowStatus
      ? (localCallWindowStatus as CALL_WINDOW_STATUS)
      : CALL_WINDOW_STATUS.FLOATING;
  }

  private set _localCallWindowStatus(status: CALL_WINDOW_STATUS) {
    localStorage.setItem(LOCAL_CALL_WINDOW_STATUS_KEY, status);
  }

  @action
  private _closeCallWindow = () => {
    if (this.callWindowState !== CALL_WINDOW_STATUS.MINIMIZED) {
      this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.CLOSE_DIALER]();
    }
  };

  @action
  private _openCallWindow = () => {
    const {
      OPEN_DETACHED_DIALER,
      OPEN_FLOATING_DIALER,
    } = CALL_WINDOW_TRANSITION_NAMES;
    if (this.callWindowState === CALL_WINDOW_STATUS.MINIMIZED) {
      if (this._localCallWindowStatus === CALL_WINDOW_STATUS.DETACHED) {
        this._callWindowFSM[OPEN_DETACHED_DIALER]();
        return;
      }
      this._callWindowFSM[OPEN_FLOATING_DIALER]();
      this.stopAnimation();
    }
  };

  @action
  private _clearEnteredKeys = () => {
    this.enteredKeys = '';
  };

  @action
  private _clearForwardString = () => {
    this.forwardString = '';
  };

  @action
  private _clearTransferString = () => {
    this.transferString = '';
  };

  @action
  openKeypad = () => {
    this.keypadEntered = true;
  };

  @action
  quitKeypad = () => {
    this.keypadEntered = false;
  };

  @action
  inputKey = (key: string) => {
    this.enteredKeys += key;
  };

  inputCustomReplyMessage = (msg: string) => {
    this.customReplyMessage = msg.trimLeft();
  };

  @action
  openDialer = () => {
    this._history.add(DIALING);
    this._openCallWindow();
    this.shouldKeepDialog = true;
  };

  @action
  closeDialer = () => {
    this._closeCallWindow();
    this.shouldKeepDialog = false;
    this._history.delete(DIALING);
  };

  @action
  attachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.FLOATING;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.ATTACHED_WINDOW]();
  };

  @action
  detachedWindow = () => {
    this._localCallWindowStatus = CALL_WINDOW_STATUS.DETACHED;
    this._callWindowFSM[CALL_WINDOW_TRANSITION_NAMES.DETACHED_WINDOW]();
  };

  @action
  end = () => {
    const history = this._history;

    switch (true) {
      case this.isMultipleCall:
        this.endMultipleIncomingCall();
        break;
      case history.has(CALL_DIRECTION.INBOUND) &&
        history.has(DIALING) &&
        this.shouldKeepDialog:
        this.openDialer();
        break;

      case history.has(CALL_DIRECTION.INBOUND) || !history.has(DIALING):
        this._closeCallWindow();
        this._history.delete(DIALING);
        break;
      default:
        break;
    }

    // if end call isn't active call and incoming state reply don't reset state;
    // if multiple call and end current call don't reset state;
    if (this.isWarmTransferPage) {
      this.leaveWarmTransferPage();
    }

    if (this.isEndOtherCall) {
      this.endOtherCall();
      return;
    }

    // end incoming call
    if (this.isMultipleCall && this.isEndCurrentCall) {
      this.endCurrentCall();
      return;
    }

    this.endSingleCall();
  };

  @action
  endOtherCall = () => {
    this.quitKeypad();
    this._clearEnteredKeys();
    this._clearTransferString();
    this.isConference = false;
    if (this.isTransferPage) {
      this.backToDialerFromTransferPage();
    }

    this.isEndMultipleIncomingCall = false;
  };

  @action
  endCurrentCall = () => {
    this.resetReply();
    this._clearForwardString();
    this.backIncoming();

    this.isEndMultipleIncomingCall = true;
  };

  @action
  endSingleCall = () => {
    if (this.isTransferPage) {
      this.backToDialerFromTransferPage();
    }

    this.resetReply();
    this.backIncoming();
    this.quitKeypad();
    this._clearEnteredKeys();
    this._clearForwardString();
    this._clearTransferString();
    this.isEndMultipleIncomingCall = false;

    if (
      (this.phoneNumber !== '' || !this.isMultipleCall) &&
      !this.isEndOtherCall
    ) {
      this.isContactMatched = false;
    }

    this.hasManualSelected = false;
    this.isConference = false;
    this._history.delete(CALL_DIRECTION.INBOUND);
  };

  @action
  directCall = () => {
    this.resetFirstLetterThroughKeypadForInputString();
    this._openCallWindow();
  };

  @action
  incomingCall = () => {
    this._history.add(CALL_DIRECTION.INBOUND);
    this._openCallWindow();
  };

  @action
  onDialerInputFocus = () => {
    this.dialerInputFocused = true;
  };

  @action
  onDialerInputBlur = () => {
    this.dialerInputFocused = false;
  };

  @action
  onDialerFocus = () => {
    this.dialerFocused = true;
  };

  @action
  onDialerBlur = () => {
    this.dialerFocused = false;
  };

  @action
  startAnimation = () => {
    this.startMinimizeAnimation = true;
  };

  @action
  stopAnimation = () => {
    this.startMinimizeAnimation = false;
  };

  @action
  enterFirstLetterThroughKeypadForInputString = () => {
    this.firstLetterEnteredThroughKeypadForInputString = true;
  };

  @action
  resetFirstLetterThroughKeypadForInputString = () => {
    this.firstLetterEnteredThroughKeypadForInputString = false;
  };

  @action
  enterFirstLetterThroughKeypadForForwardString = () => {
    this.firstLetterEnteredThroughKeypadForForwardString = true;
  };

  @action
  resetFirstLetterThroughKeypadForForwardString = () => {
    this.firstLetterEnteredThroughKeypadForForwardString = false;
  };

  @action
  resetValidInputStringNumber = () => {
    this.isValidInputStringNumber = false;
  };

  @computed
  get isDetached() {
    if (this.callWindowState === CALL_WINDOW_STATUS.DETACHED) {
      return true;
    }
    return false;
  }

  // TODO: move to Hold.ViewModel.ts when implementing the multi-call feature
  @computed
  get holdDisabled() {
    return this.holdState === HOLD_STATE.DISABLED;
  }

  // TODO: move to Hold.ViewModel.ts when implementing the multi-call feature
  @computed
  get held() {
    return this.holdState === HOLD_STATE.HELD;
  }

  // TODO: move to Record.ViewModel.ts when implementing the multi-call feature
  @computed
  get isRecording() {
    return [RECORD_STATE.RECORDING, RECORD_STATE.RECORDING_DISABLED].includes(
      this.recordState,
    );
  }

  // TODO: move to Record.ViewModel.ts when implementing the multi-call feature
  @computed
  get recordDisabled() {
    return [RECORD_STATE.DISABLED, RECORD_STATE.RECORDING_DISABLED].includes(
      this.recordState,
    );
  }

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  directReply = () => {
    this.incomingState = INCOMING_STATE.REPLY;
    if (!this._intervalReplyId) {
      this._createReplyInterval();
    }
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  directForward = () => {
    this.incomingState = INCOMING_STATE.FORWARD;
  };

  @action
  forward = () => {
    this.incomingState = INCOMING_STATE.IDLE;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  backIncoming = () => {
    this.incomingState = INCOMING_STATE.IDLE;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action
  resetReply = () => {
    this.replyCountdownTime = undefined;
    this.customReplyMessage = '';
    this._intervalReplyId && clearInterval(this._intervalReplyId);
    this._intervalReplyId = undefined;
  };

  // TODO: move out of telephony store when minization won't destroy the telephony dialog
  @action.bound
  private _createReplyInterval() {
    this.replyCountdownTime = INITIAL_REPLY_COUNTDOWN_TIME;
    this._intervalReplyId = setInterval(() => {
      this.replyCountdownTime && --this.replyCountdownTime;
      if (!this.replyCountdownTime) {
        this._intervalReplyId && clearInterval(this._intervalReplyId);
      }
    }, 1000);
  }

  @computed
  get shouldDisplayDialer() {
    // TODO: change this when refactoring for multi-call
    return !this.call || this.callDisconnecting;
  }

  @computed
  get isIncomingCall() {
    return this.callState === CALL_STATE.IDLE && this.isInbound;
  }

  // TODO: it should current call
  @computed
  get call(): CallModel | undefined {
    if (!this.rawCalls.length) return undefined;

    // for transfer call switch current call
    if (this.currentCallId) {
      return this.rawCalls.find(
        call => call.id === this.currentCallId,
      ) as CallModel;
    }
    // The latest call
    return this.rawCalls[0];
  }

  @computed
  get holdState(): HOLD_STATE {
    if (!this.call) return HOLD_STATE.DISABLED;
    return this.call.holdState;
  }

  @computed
  get recordState(): RECORD_STATE {
    if (!this.call) return RECORD_STATE.DISABLED;
    return this.call.recordState;
  }

  @computed
  get callState(): CALL_STATE {
    if (!this.call) return CALL_STATE.IDLE;
    return this.call.callState;
  }

  @computed
  get isMute(): boolean {
    if (!this.call) return false;
    return this.call.muteState === MUTE_STATE.MUTED;
  }

  @computed
  get activeCallTime(): number {
    if (!this.call) return 0;
    return this.call.connectTime;
  }

  @computed
  get callConnectingTime(): number {
    if (!this.call) return 0;
    return this.call.connectingTime;
  }

  @computed
  get isInbound(): boolean {
    if (!this.call) return false;
    return this.call.direction === CALL_DIRECTION.INBOUND;
  }

  @computed
  get isOutbound(): boolean {
    if (!this.call) return false;
    return this.call.direction === CALL_DIRECTION.OUTBOUND;
  }

  @computed
  get activeCallDirection() {
    if (!this.call) return undefined;
    return this.call && this.call.direction;
  }

  @computed
  get callDisconnecting(): boolean {
    return this.callState === CALL_STATE.DISCONNECTING;
  }

  @computed
  get uuid() {
    if (!this.call) return '';
    return this.call.uuid;
  }

  // TODO: should change the prop's name since it's isomorphic to `CALL_DIRECTION`
  @computed
  get callType() {
    switch (true) {
      case this.isInbound:
        return CALL_TYPE.INBOUND;
      case this.isOutbound:
        return CALL_TYPE.OUTBOUND;
      default:
        return CALL_TYPE.NULL;
    }
  }

  @action
  syncDialerEntered(entered: boolean) {
    this.enteredDialer = entered;
  }

  @computed
  get hasActiveCall() {
    return [CALL_STATE.CONNECTED, CALL_STATE.CONNECTING].includes(
      this.callState,
    );
  }

  @computed
  get hasActiveOutBoundCall() {
    return this.hasActiveCall && this.isOutbound;
  }

  @computed
  get hasActiveInBoundCall() {
    return this.hasActiveCall && this.isInbound;
  }

  @computed
  get shouldDisplayRecentCalls() {
    return (
      !(
        this.hasActiveOutBoundCall ||
        this.hasActiveInBoundCall ||
        this.isIncomingCall
      ) || this.isTransferPage
    );
  }

  @computed
  get callerName() {
    if (!this.call) return '';
    return this.isInbound ? this.call.fromName : this.call.toName;
  }

  @computed
  get phoneNumber() {
    if (!this.call) return undefined;
    const phoneNumber = this.isInbound ? this.call.fromNum : this.call.toNum;
    return phoneNumber !== ANONYMOUS_NUM ? phoneNumber : '';
  }

  @action
  jumpToRecentCall = () => {
    this.isRecentCalls = true;
  };

  @action
  backToDialer = () => {
    this.isRecentCalls = false;
    this.resetCallItem();
  };

  @action
  switchE911Status = (status: boolean) => {
    this.hasShowE911 = status;
  };

  @action
  switchCurrentCall = (callId?: number) => {
    this.currentCallId = callId;
  };

  @computed
  get ids() {
    return this._sortableListHandler.sortableListStore.getIds;
  }

  @computed
  get rawCalls() {
    const calls = this.ids.map(id =>
      getEntity<Call, CallModel>(ENTITY_NAME.CALL, id),
    );
    return reverse(sortBy(calls, ['startTime']));
  }

  @computed
  get endCall() {
    return this.rawCalls.find(
      call => call.callState === CALL_STATE.DISCONNECTING,
    );
  }

  @computed
  get isEndOtherCall() {
    return this.endCall && this.call && this.endCall.id !== this.call.id;
  }

  @computed
  get isEndCurrentCall() {
    return this.endCall && this.call && this.endCall.id === this.call.id;
  }

  @action
  changeBackToDefaultPos = (status: boolean) => {
    this.isBackToDefaultPos = status;
  };

  @action
  endMultipleIncomingCall() {
    if (!this.isMultipleCall || !this.isInbound) return;
    this.isBackToDefaultPos = true;
  }

  @computed
  get isMultipleCall() {
    return this.ids.length > 1;
  }

  @computed
  get isThirdCall() {
    return this.ids.length > 2;
  }

  directToTransferPage = () => {
    this.isTransferPage = true;
    this._isRecentCallsInDialerPage = this.isRecentCalls;
    this.backToDialer();
    if (this.inputString.length) {
      this._dialerString = this.inputString;
      this.inputString = '';
    }
  };

  @action
  backToDialerFromTransferPage = () => {
    this.isTransferPage = false;
    this.isRecentCalls = this._isRecentCallsInDialerPage;
    this.resetValidInputStringNumber();
    if (this._dialerString.length) {
      this.inputString = this._dialerString;
      this._dialerString = '';
      return;
    }
    this.inputString = '';
    return;
  };

  @action
  directToWarmTransferPage = () => {
    this.isWarmTransferPage = true;
    this.backToDialerFromTransferPage();
    this.switchCurrentCall(this.rawCalls[0] && this.rawCalls[0].id);
  };

  @action
  leaveWarmTransferPage = () => {
    this.isWarmTransferPage = false;
    this.switchCurrentCall();
  };

  @action
  completeTransfer = () => {
    this.canCompleteTransfer = true;
  };

  @action
  processTransfer = () => {
    this.canCompleteTransfer = false;
  };

  @action
  setCallItem = (phoneNumber: string, index: number) => {
    this.selectedCallItem = {
      phoneNumber,
      index,
    };
  };

  @action
  resetCallItem = () => {
    this.selectedCallItem = {
      phoneNumber: '',
      index: NaN,
    };
  };

  updateVoicemailNotification = async (voicemail: Voicemail) => {
    const { id, from, attachments } = voicemail;
    const {
      displayName,
      displayNumber,
    } = await this._getNotificationCallerInfo(from);

    this.voicemailNotification = {
      id,
      title: `${displayName} ${displayNumber}`,
      body: this._getVoicemailNotificationBody(attachments),
    };
  };

  @action
  updateMissedCallNotification = async (callLog: CallLog) => {
    const { id, from } = callLog;
    const {
      displayName,
      displayNumber,
    } = await this._getNotificationCallerInfo(from);

    this.missedCallNotification = {
      id,
      displayNumber,
      title: i18nP('telephony.result.missedcall'),
      body: `${displayName} ${displayNumber}`,
    };
  };

  private _getNotificationCallerInfo = async ({
    name = '',
    phoneNumber = '',
    extensionNumber = '',
  } = {}) => {
    let displayNumber = extensionNumber || phoneNumber;
    let displayName = name || i18nP('phone.unknownCaller');

    if (!displayNumber) {
      return { displayName, displayNumber };
    }

    const { userDisplayName = '' } =
      (await this._matchPersonByPhoneNumber(displayNumber)) || {};

    displayNumber = await this._formatPhoneNumber(displayNumber);

    if (userDisplayName) {
      displayName = userDisplayName;
    }

    return { displayName, displayNumber };
  };

  private _getVoicemailNotificationBody = (
    attachments: Voicemail['attachments'],
  ) => {
    const audio = attachments && attachments[0];
    const text = i18nP('telephony.notification.newVoicemail');

    return audio ? `${text} ${formatSeconds(audio.vmDuration)}` : text;
  };

  @computed
  get mediaTrackIds() {
    const telephonyMediaTrackId = this._mediaService.createTrack(
      'telephony',
      200,
    );
    return {
      telephony: telephonyMediaTrackId,
    };
  }
}

export { TelephonyStore, CALL_TYPE, INCOMING_STATE, SelectedCallItem };
