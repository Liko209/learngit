/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-07-18 10:13:13
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RCPresenceEventPayload,
  ActiveCall,
} from 'sdk/module/rcEventSubscription/types';
import { AccountGlobalConfig } from 'sdk/module/account/config';
import { mainLogger } from 'foundation/log';
import { TELEPHONY_STATUS } from 'sdk/module/rcEventSubscription/constants';
import { CALL_DIRECTION } from 'sdk/module/RCItems';
import {
  notificationCenter,
  SUBSCRIPTION,
  SERVICE,
  RC_INFO,
  ENTITY,
  EVENT_TYPES,
  WINDOW,
} from 'sdk/service';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { ITelephonyService } from '../service/ITelephonyService';
import { SettingService, SettingEntityIds } from 'sdk/module/setting';
import { CALLING_OPTIONS } from 'sdk/module/profile';
import { UndefinedAble } from 'sdk/types';
import { SequenceProcessorHandler, IProcessor } from 'sdk/framework/processor';
import { IdModel } from 'sdk/framework/model';
import { NotificationEntityPayload } from 'sdk/service/notificationCenter';
import { Call, CALL_STATE } from '../entity';

const MAX_CALL_CACHE_CNT = 30;
const MODULE_NAME = 'CallSwitchController';
const AvailableCallStatus = [
  TELEPHONY_STATUS.CallConnected,
  TELEPHONY_STATUS.Ringing,
  TELEPHONY_STATUS.OnHold,
  TELEPHONY_STATUS.ParkedCall,
];
const SYNC_RC_PRESENCE_AFTER_CALL_DELAY = 5 * 1000;
const SYNC_RC_PRESENCE_DEBOUNCE_TIME = 2 * 1000;
type ActiveCallWithSequence = ActiveCall & { sequence: number };
type CallUniqueInfo = {
  callId: string;
  fromTag: string;
  toTag: string;
};
type CallUniqueRecord = IdModel & CallUniqueInfo;

class UpdateSwitchCallProcessor implements IProcessor {
  constructor(
    private _name: string,
    private _processFunc: () => Promise<void>,
  ) {}

  async process(): Promise<boolean> {
    try {
      await this._processFunc();
    } catch (e) {
      mainLogger
        .tags(MODULE_NAME)
        .warn(`failed to execute UpdateSwitchCallProcessor, ${this._name}`, e);
    }
    return Promise.resolve(true);
  }

  name(): string {
    return this._name;
  }
}

class CallSwitchController {
  private _isSubscribe = false;
  private _currentUserExtId: number;
  private _sessionToSequence: { sessionId: string; sequence: number }[] = [];
  private _endedCalls: CallUniqueRecord[] = [];
  private _currentActiveCalls: ActiveCallWithSequence[] = [];
  private _lastBannerIsShown = false;
  /* eslint-disable */
  private _updateSwitchCallQueue = new SequenceProcessorHandler({
    name: MODULE_NAME,
    addProcessorStrategy: (
      totalProcessors: IProcessor[],
      newProcessor: IProcessor,
      existed: boolean,
    ) => {
      return [newProcessor];
    },
  });
  /* eslint-disable */

  constructor(private _telephonyService: ITelephonyService) {}

  async start() {
    this._listenRCPresence();

    notificationCenter.on(
      SERVICE.TELEPHONY_SERVICE.VOIP_CALLING,
      this._checkSubscription,
    );

    notificationCenter.on(RC_INFO.EXTENSION_INFO, this._checkSubscription);
    notificationCenter.on(ENTITY.CALL, this._handleCallStateChanged);
    notificationCenter.on(
      SERVICE.WAKE_UP_FROM_SLEEP,
      this._clearAndSyncRCPresence,
    );
    notificationCenter.on(
      SERVICE.RC_EVENT_SUBSCRIPTION.SUBSCRIPTION_CONNECTED,
      this._handleRCSubscriptionConnected,
    );
    notificationCenter.on(WINDOW.ONLINE, this._clearAndSyncRCPresence);
    await this._checkSubscription();
    this._clearAndSyncRCPresence();
  }

  private _listenRCPresence() {
    notificationCenter.on(
      RC_INFO.RC_PRESENCE,
      (payload: RCPresenceEventPayload) => {
        this.handleTelephonyPresence(payload, false);
      },
    );
  }

  private _checkSubscription = async () => {
    const canUseCallSwitch = await this._canUseCallSwitch();
    if (!this._isSubscribe && canUseCallSwitch) {
      this._listenSwitchCall();
    } else if (this._isSubscribe && !canUseCallSwitch) {
      this._stopListenSwitchCall();
    }

    mainLogger.tags(MODULE_NAME).log('_checkSubscription', {
      canUseCallSwitch,
      _isSubscribe: this._isSubscribe,
    });
  };

  private _listenSwitchCall() {
    this._isSubscribe = true;
    notificationCenter.on(
      SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
      this.handleTelephonyPresence,
    );
  }

  private _stopListenSwitchCall() {
    this._isSubscribe = false;
    notificationCenter.off(
      SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL,
      this.handleTelephonyPresence,
    );
  }

  handleTelephonyPresence = (
    payload: RCPresenceEventPayload,
    isFromPush = true,
  ) => {
    mainLogger.tags(MODULE_NAME).log('--- START --- handleTelephonyPresence', {
      payload,
      isFromPush,
    });

    if (isFromPush && payload.extensionId !== this._getExtensionId()) {
      mainLogger.tags(MODULE_NAME).log('extension id not match', {
        cur: this._getExtensionId(),
        incoming: payload.extensionId,
      });
      return;
    }

    if (isFromPush && !payload.sequence) {
      mainLogger.tags(MODULE_NAME).log('no sequence data');
      return;
    }

    const payLoadSequence = payload.sequence || 0;
    if (payload.activeCalls && payload.activeCalls.length) {
      this._handleActiveCalls(payload.activeCalls, payLoadSequence, isFromPush);
    } else {
      this._handleNoActiveCallPayload(payLoadSequence, isFromPush);
    }

    this._updateBannerStatus();
    mainLogger.tags(MODULE_NAME).log('--- END --- handleTelephonyPresence');
  };

  private _handleNoActiveCallPayload(
    payLoadSequence: number,
    isFromPush: boolean,
  ) {
    let shouldClearAllCalls = !isFromPush;
    mainLogger.tags(MODULE_NAME).log('_handleNoActiveCallPayload', {
      isFromPush,
      payLoadSequence,
    });

    if (!shouldClearAllCalls) {
      let localMaxSequence: number = 0;
      for (const iterator of this._sessionToSequence) {
        localMaxSequence = Math.max(iterator.sequence, localMaxSequence);
      }
      shouldClearAllCalls = payLoadSequence > localMaxSequence;
      mainLogger
        .tags(MODULE_NAME)
        .log('local max sequence may smaller then incoming one', {
          localMaxSequence,
          payLoadSequence,
        });
    }

    if (shouldClearAllCalls) {
      this._currentActiveCalls = [];
    }
  }

  private _handleActiveCalls(
    rawCalls: ActiveCall[],
    payLoadSequence: number,
    isFromPush: boolean,
  ) {
    const tempValidCallList: ActiveCallWithSequence[] = [];
    const tempCallList: ActiveCallWithSequence[] = [];
    let payLoadMaxSequence = 0;

    for (const rawCall of rawCalls) {
      const sessionId = rawCall.sessionId || '';
      const record = this._sessionToSequence.find(x => {
        return x.sessionId === sessionId;
      });
      const previousSequence = (record && record.sequence) || 0;
      const sequenceNumber = isFromPush ? payLoadSequence : previousSequence;
      const call = { ...rawCall, sequence: sequenceNumber };

      if (sequenceNumber >= previousSequence) {
        this._cacheSession(sessionId, sequenceNumber);
        if (this._isCallDataValid(call) && !this._isCallEndedBefore(call)) {
          mainLogger
            .tags(MODULE_NAME)
            .log('_handleActiveCalls - add valid active call', { call });
          tempValidCallList.push(call);
        } else {
          mainLogger
            .tags(MODULE_NAME)
            .log('_handleActiveCalls - add invalid call with larger sequence', {
              call,
            });
          tempCallList.push(call);
        }
      } else {
        mainLogger
          .tags(MODULE_NAME)
          .log('_handleActiveCalls - add invalid call', { call });
        tempCallList.push(call);
      }

      payLoadMaxSequence = Math.max(payLoadMaxSequence, sequenceNumber);
    }

    if (tempValidCallList.length) {
      mainLogger
        .tags(MODULE_NAME)
        .log('_handleActiveCalls - new active call list', {
          tempValidCallList,
        });
      this._currentActiveCalls = tempValidCallList;
    } else if (tempCallList.length && this._currentActiveCalls.length) {
      this._currentActiveCalls = this._currentActiveCalls.filter(
        (currentCall: ActiveCallWithSequence) => {
          return currentCall.sequence > payLoadMaxSequence;
        },
      );

      mainLogger
        .tags(MODULE_NAME)
        .log('_handleActiveCalls - filter active call by sequence ', {
          tempValidCallList,
        });
    } else {
      mainLogger.tags(MODULE_NAME).log('_handleActiveCalls clear all call');
      this._currentActiveCalls = [];
    }
  }

  private _getExtensionId() {
    if (this._currentUserExtId === undefined) {
      this._currentUserExtId = _.toInteger(
        AccountGlobalConfig.getUserDictionary(),
      );
    }
    return this._currentUserExtId;
  }

  private _cacheSession(sessionId: string, sequenceNumber: number) {
    this._sessionToSequence.push({ sessionId, sequence: sequenceNumber });
    if (this._sessionToSequence.length > MAX_CALL_CACHE_CNT) {
      this._sessionToSequence = _.tail(this._sessionToSequence);
    }
  }

  private _isCallDataValid(call: ActiveCall) {
    let isValid = false;
    do {
      if (
        !call.id ||
        !call.sessionId ||
        !call.telephonyStatus ||
        !call.direction
      ) {
        mainLogger
          .tags(MODULE_NAME)
          .log('!!INVALID: incomplete call data', { call });
        break;
      }

      const sipData = call.sipData;
      if (!sipData || !sipData.fromTag || !sipData.toTag) {
        mainLogger
          .tags(MODULE_NAME)
          .log('!!INVALID: incomplete call sip data', { call });
        break;
      }

      const telephonyStatus = call.telephonyStatus;
      const isRingingInboundCall =
        call.direction === CALL_DIRECTION.INBOUND &&
        telephonyStatus === TELEPHONY_STATUS.Ringing;

      if (isRingingInboundCall) {
        mainLogger
          .tags(MODULE_NAME)
          .log('!!INVALID: ringing inbound call', { call });
        break;
      }

      if (!AvailableCallStatus.some(v => v === telephonyStatus)) {
        mainLogger
          .tags(MODULE_NAME)
          .log('!!INVALID: invalid telephony status', { call });
        break;
      }

      isValid = true;
    } while (this._falseCondition());
    return isValid;
  }

  private _isCallEndedBefore(call: ActiveCall) {
    return this._endedCalls.some((endedCall: CallUniqueInfo) => {
      return this._isSameCall(this._activeCall2UniqueCallInfo(call), endedCall);
    });
  }

  private _falseCondition() {
    return false;
  }

  private _isSameCall(callA: CallUniqueInfo, callB: CallUniqueInfo) {
    let isSame = false;
    do {
      if (callA.callId !== callB.callId) {
        return false;
      }

      const isSameTag =
        (callA.fromTag === callB.fromTag && callA.toTag === callB.toTag) ||
        (callA.fromTag === callB.toTag && callA.toTag === callB.fromTag);
      if (!isSameTag) {
        break;
      }

      isSame = true;
    } while (this._falseCondition());

    return isSame;
  }

  private async _shouldShowSwitchCall() {
    if (this._currentActiveCalls.length > 1) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_shouldShowBanner - over size active call');
      return false;
    }

    if (this._telephonyService.getAllCallCount() > 0) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_shouldShowBanner - has active call in Jupiter');
      return false;
    }

    if (!(await this._canUseCallSwitch())) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_shouldShowBanner - can not use call switch');
      return false;
    }

    return true;
  }

  private async _canUseCallSwitch() {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );

    const voipCallPermission = await this._telephonyService.getVoipCallPermission();
    if (!voipCallPermission) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_canUseCallSwitch - no voip permission');
      return false;
    }

    const callSwitchPermission = await rcInfoService.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.CALL_SWITCH,
    );
    if (!callSwitchPermission) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_canUseCallSwitch - call switch permission');
      return false;
    }

    const webPhonePermission = await rcInfoService.isRCFeaturePermissionEnabled(
      ERCServiceFeaturePermission.WEB_PHONE,
    );
    if (!webPhonePermission) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_canUseCallSwitch - web phone permission');
      return false;
    }

    // check use where use phone
    const settingService = ServiceLoader.getInstance<SettingService>(
      ServiceConfig.SETTING_SERVICE,
    );
    const callOption = await settingService.getById(
      SettingEntityIds.Phone_DefaultApp,
    );
    if (callOption && callOption.value !== CALLING_OPTIONS.GLIP) {
      mainLogger
        .tags(MODULE_NAME)
        .info('_canUseCallSwitch - do not use glip phone');
      return false;
    }

    return true;
  }

  private _updateBannerStatus() {
    const processor = new UpdateSwitchCallProcessor(
      Date.now().toString(),
      async () => {
        const hasCall = !!(await this.getSwitchCall());
        mainLogger
          .tags(MODULE_NAME)
          .log('notify call switch status, hasCall: ', {
            hasCall,
            _currentActiveCalls: this._currentActiveCalls,
          });
        if (this._lastBannerIsShown !== hasCall) {
          this._lastBannerIsShown = hasCall;
          notificationCenter.emit(
            SERVICE.TELEPHONY_SERVICE.CALL_SWITCH,
            hasCall,
          );
        }
      },
    );
    this._updateSwitchCallQueue.addProcessor(processor);
  }

  async getSwitchCall() {
    let call: UndefinedAble<ActiveCall>;
    const shouldShowBanner = await this._shouldShowSwitchCall();
    if (shouldShowBanner) {
      call = _.first(this._currentActiveCalls);
    }

    return call;
  }

  private _handleRCSubscriptionConnected = async () => {
    if (this._lastBannerIsShown) {
      mainLogger
        .tags(MODULE_NAME)
        .log('sync user rc presence when rc subscription connected');
      await this._syncLatestUserPresenceDebounce();
    }
  };

  private _handleCallStateChanged = (
    payload: NotificationEntityPayload<Call>,
  ) => {
    if (payload.type === EVENT_TYPES.UPDATE) {
      const call: Call[] = Array.from(payload.body.entities.values());
      let hasEndedCall = false;
      call.forEach((item: Call) => {
        const isEndedCall = item.call_state === CALL_STATE.DISCONNECTING;
        if (isEndedCall) {
          this._onCallEnded(item);
          hasEndedCall = true;
        }
      });

      if (hasEndedCall) {
        this._updateBannerStatus();
        this._syncLatestPresenceAfterCallEnd();
      }
    }
  };

  private _syncLatestPresenceAfterCallEnd = _.debounce(async () => {
    mainLogger
      .tags(MODULE_NAME)
      .log('sync user rc presence after call ended + 5s');
    await this._syncLatestUserPresence();
  }, SYNC_RC_PRESENCE_AFTER_CALL_DELAY);

  private _clearAndSyncRCPresence = () => {
    if (this._lastBannerIsShown) {
      this._currentActiveCalls = [];
      this._updateBannerStatus();
    }

    this._syncLatestUserPresenceDebounce();
  };

  private _syncLatestUserPresenceDebounce = _.debounce(async () => {
    await this._syncLatestUserPresence();
  }, SYNC_RC_PRESENCE_DEBOUNCE_TIME);

  private _syncLatestUserPresence = async () => {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    await rcInfoService.syncUserRCPresence().catch(error => {
      mainLogger
        .tags(MODULE_NAME)
        .log('silent sync rc presence is done with error', error);
    });
  };

  private _recordEndedCalls(record: CallUniqueRecord) {
    const isRecorded = this._endedCalls.some(x => {
      return x.id === record.id;
    });
    if (isRecorded) {
      return;
    }

    mainLogger
      .tags(MODULE_NAME)
      .log('_recordEndedCalls, receive new ended call', record);
    this._endedCalls.push(record);
    if (this._endedCalls.length > MAX_CALL_CACHE_CNT) {
      this._endedCalls = _.tail(this._endedCalls);
    }
  }

  private async _onCallEnded(callEntity: Call) {
    mainLogger.tags(MODULE_NAME).log('onCallEnded, call is', callEntity);
    if (
      callEntity &&
      callEntity.call_id &&
      callEntity.from_tag &&
      callEntity.to_tag
    ) {
      const record = {
        id: callEntity.id,
        callId: callEntity.call_id,
        fromTag: callEntity.from_tag,
        toTag: callEntity.to_tag,
      };
      this._removeExistCallByCallData(record);
      this._recordEndedCalls(record);
    }
  }

  private _removeExistCallByCallData(record: CallUniqueRecord) {
    if (this._currentActiveCalls.length) {
      this._currentActiveCalls = this._currentActiveCalls.filter(
        (call: ActiveCallWithSequence) => {
          this._isSameCall(this._activeCall2UniqueCallInfo(call), record);
        },
      );
    }
  }

  private _activeCall2UniqueCallInfo(call: ActiveCall) {
    return {
      callId: call.id,
      fromTag: (call.sipData && call.sipData.fromTag) || '',
      toTag: (call.sipData && call.sipData.toTag) || '',
    };
  }
}

export { CallSwitchController };
