/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 17:27:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractFetchController } from './AbstractFetchController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLog } from '../entity';
import { RCItemSyncResponse } from 'sdk/api/ringcentral/types/RCItemSync';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { CALL_RESULT, LOCAL_INFO_TYPE, CALL_LOG_SOURCE } from '../constants';
import { SYNC_TYPE } from '../../sync';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';
import { CallLogUserConfig } from '../config/CallLogUserConfig';
import { notificationCenter } from 'sdk/service';
import { CALL_DIRECTION } from '../../constants';
import { CallLogDao } from '../dao';
import { daoManager } from 'sdk/dao';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../config/performanceKeys';

const SYNC_NAME = 'AllCallLogFetchController';

class AllCallLogFetchController extends AbstractFetchController {
  constructor(
    private _userConfig: CallLogUserConfig,
    sourceController: IEntitySourceController<CallLog, string>,
    badgeController: CallLogBadgeController,
  ) {
    super(SYNC_NAME, _userConfig, sourceController, badgeController);
  }

  protected async handleDataAndSave(
    data: RCItemSyncResponse<CallLog>,
  ): Promise<CallLog[]> {
    const updateResults: CallLog[] = [];
    const deleteResults: string[] = [];
    const replaceResult: Map<string, CallLog> = new Map();
    const pseudos = (await this._userConfig.getPseudoCallLogInfo()) || {};

    data.records.forEach((callLog: CallLog) => {
      callLog.__localInfo = 0;
      if (
        callLog.result === CALL_RESULT.MISSED ||
        callLog.result === CALL_RESULT.VOICEMAIL
      ) {
        callLog.__localInfo =
          callLog.__localInfo |
          LOCAL_INFO_TYPE.IS_MISSED |
          LOCAL_INFO_TYPE.IS_INBOUND;
      } else {
        callLog.direction === CALL_DIRECTION.INBOUND &&
          (callLog.__localInfo =
            callLog.__localInfo | LOCAL_INFO_TYPE.IS_INBOUND);
      }
      callLog.deleted = !!callLog.deleted;
      callLog.__timestamp = Date.parse(callLog.startTime);
      const pseudoInfo = pseudos[callLog.sessionId];
      if (pseudoInfo) {
        deleteResults.push(pseudoInfo.id);
        replaceResult.set(pseudoInfo.id, callLog);
        delete pseudos[callLog.sessionId];
      }

      if (callLog.deleted) {
        deleteResults.push(callLog.id);
      } else {
        updateResults.push(callLog);
      }
    });

    deleteResults.length &&
      (await this.sourceController.bulkDelete(deleteResults));
    updateResults.length &&
      (await this.sourceController.bulkPut(updateResults));
    await this._userConfig.setPseudoCallLogInfo(pseudos);
    replaceResult.size &&
      notificationCenter.emitEntityReplace(
        this.sourceController.getEntityNotificationKey(),
        replaceResult,
      );
    const needNotifyResults = data.records.filter((x: CallLog) => {
      return !replaceResult.has(x.id);
    });

    mainLogger.tags(SYNC_NAME).info('handleDataAndSave', {
      updateLength: updateResults.length,
      deleteLength: deleteResults.length,
      needNotifyResultsLen: needNotifyResults.length,
      pseudoInfo: pseudos,
    });

    return needNotifyResults;
  }

  protected async sendSyncRequest(
    syncType: SYNC_TYPE,
    syncToken?: string,
    recordCount?: number,
  ): Promise<RCItemSyncResponse<CallLog>> {
    return await RCItemApi.syncCallLog({
      syncType,
      recordCount,
      syncToken,
      showDeleted: syncType !== SYNC_TYPE.FSYNC,
    });
  }

  async fetchAllUniquePhoneNumberCalls() {
    const performanceTracer = PerformanceTracer.start();
    const dao = daoManager.getDao(CallLogDao);
    const result = await dao.queryAllUniquePhoneNumberCalls(
      CALL_LOG_SOURCE.ALL,
    );
    performanceTracer.end({
      key: CALL_LOG_POST_PERFORMANCE_KEYS.FETCH_RECENT_CALL_LOGS,
      count: result.size,
    });
    return result;
  }
}

export { AllCallLogFetchController };
