/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-06-04 20:25:36
 * Copyright © RingCentral. All rights reserved.
 */

import {
  MissedCallEventPayload,
  RCPresenceEventPayload,
  ActiveCall,
} from 'sdk/module/rcEventSubscription/types';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLog } from '../entity';
import { TELEPHONY_STATUS } from 'sdk/module/rcEventSubscription/constants';
import { Nullable } from 'sdk/types';
import {
  CALL_LOG_SOURCE,
  CALL_TYPE,
  CALL_ACTION,
  CALL_RESULT,
} from '../constants';
import { CALL_DIRECTION } from '../../constants';
import { notificationCenter } from 'sdk/service';
import { daoManager } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { CallLogUserConfig } from '../config/CallLogUserConfig';
import { mainLogger } from 'foundation';
import { PseudoCallLogInfo } from '../types';
import { PhoneNumberType } from 'sdk/module/phoneNumber/entity';

const LOG_TAG = 'CallLogHandleDataController';

class CallLogHandleDataController {
  constructor(
    private _userConfig: CallLogUserConfig,
    private _sourceController: IEntitySourceController<CallLog, string>,
  ) {}

  handleMissedCallEvent = async (payload: MissedCallEventPayload) => {
    if (
      !this._userConfig.getSyncToken() ||
      !payload.sessionId ||
      !payload.timestamp ||
      !(payload.extensionId > 0)
    ) {
      mainLogger.tags(LOG_TAG).info('ignore the missed call, ', payload);
      return;
    }

    const pseudos = (await this._userConfig.getPseudoCallLogInfo()) || {};
    if (
      pseudos[payload.sessionId] &&
      pseudos[payload.sessionId].result === CALL_RESULT.MISSED
    ) {
      mainLogger
        .tags(LOG_TAG)
        .info('already has the pseudo missed call, ', payload);
      return;
    }

    const localData = await this._getCallLogBySessionId(payload.sessionId);
    if (localData && localData.result === CALL_RESULT.MISSED) {
      mainLogger
        .tags(LOG_TAG)
        .info('already has the local missed call, ', payload);
      return;
    }

    // parse data
    const pseudoId = payload.sessionId + CALL_DIRECTION.INBOUND;
    const callLog = this._getCallLogFromMissedCall(payload, pseudoId);
    pseudos[callLog.sessionId] = {
      id: pseudoId,
      result: CALL_RESULT.MISSED,
    };
    mainLogger.tags(LOG_TAG).info('create pseudo missed call, ', callLog);

    // save data and notify
    this._saveDataAndNotify(pseudos, [callLog]);
  }

  handleRCPresenceEvent = async (payload: RCPresenceEventPayload) => {
    if (!this._userConfig.getSyncToken()) {
      mainLogger.tags(LOG_TAG).info('ignore the rc presence');
      return;
    }

    // parse data
    const pseudos = (await this._userConfig.getPseudoCallLogInfo()) || {};
    const callLogs: CallLog[] = [];
    await Promise.all(
      payload.activeCalls.map(async (call: ActiveCall) => {
        if (
          this._hasValidDataInActiveCall(call) &&
          this._isAnEndCall(call) &&
          !pseudos[call.sessionId] &&
          !(await this._getCallLogBySessionId(call.sessionId))
        ) {
          const pseudoId = call.sessionId + call.direction;
          const callLog = this._getCallLogFromActiveCall(call, pseudoId);
          pseudos[callLog.sessionId] = {
            id: pseudoId,
            result: CALL_RESULT.UNKNOWN,
          };
          callLogs.push(callLog);
        }
      }),
    );
    mainLogger
      .tags(LOG_TAG)
      .info('create pseudo calls from presence, ', callLogs);

    // save data and notify
    if (callLogs.length) {
      this._saveDataAndNotify(pseudos, callLogs);
    }
  }

  private async _saveDataAndNotify(
    pseudos: PseudoCallLogInfo,
    callLogs: CallLog[],
  ) {
    await this._userConfig.setPseudoCallLogInfo(pseudos);
    await this._sourceController.bulkUpdate(callLogs);
    notificationCenter.emitEntityUpdate<CallLog, string>(
      this._sourceController.getEntityNotificationKey(),
      callLogs,
    );
  }

  private _hasValidDataInActiveCall(call: ActiveCall): boolean {
    return !!(
      call.sessionId &&
      call.direction &&
      call.telephonyStatus &&
      call.terminationType &&
      call.startTime
    );
  }

  private _isAnEndCall(call: ActiveCall): boolean {
    return (
      call.telephonyStatus === TELEPHONY_STATUS.NoCall &&
      call.terminationType === 'final'
    );
  }

  private async _getCallLogBySessionId(
    sessionId: string,
  ): Promise<Nullable<CallLog>> {
    return await daoManager
      .getDao(CallLogDao)
      .queryCallLogBySessionId(sessionId);
  }

  private _getCallLogFromActiveCall(
    call: ActiveCall,
    pseudoId: string,
  ): CallLog {
    const callLog = this._parseCallLog(
      pseudoId,
      call.sessionId,
      call.from,
      call.fromName,
      call.to,
      call.toName,
      call.direction,
      call.startTime,
      CALL_RESULT.UNKNOWN,
    );
    if (callLog.from.phoneNumber === PhoneNumberType.PhoneNumberAnonymous) {
      delete callLog.from;
    }
    return callLog;
  }

  private _getCallLogFromMissedCall(
    call: MissedCallEventPayload,
    pseudoId: string,
  ): CallLog {
    return this._parseCallLog(
      pseudoId,
      call.sessionId,
      call.from,
      call.fromName,
      call.to,
      call.toName,
      CALL_DIRECTION.INBOUND,
      call.timestamp,
      CALL_RESULT.MISSED,
    );
  }

  private _parseCallLog(
    pseudoId: string,
    sessionId: string,
    fromNumber: string,
    fromName: string,
    toNumber: string,
    toName: string,
    direction: CALL_DIRECTION,
    startTime: string,
    result: CALL_RESULT,
  ): CallLog {
    return {
      sessionId,
      direction,
      startTime,
      result,
      id: pseudoId,
      uri: '',
      from: {
        phoneNumber: fromNumber,
        extensionNumber: '',
        location: '',
        name: fromName,
      },
      to: {
        phoneNumber: toNumber,
        extensionNumber: '',
        location: '',
        name: toName,
      },
      type: CALL_TYPE.VOICE,
      action: CALL_ACTION.UNKNOWN,
      duration: 0,
      __source: CALL_LOG_SOURCE.ALL,
      __timestamp: Date.parse(startTime),
      __deactivated: false,
    };
  }
}

export { CallLogHandleDataController };
