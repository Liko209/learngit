/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 17:27:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractFetchController } from './AbstractFetchController';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLog } from '../entity';
import { RCItemSyncResponse } from 'sdk/api/ringcentral/types/RCItemSync';
import { mainLogger, PerformanceTracer } from 'foundation';
import { CALL_RESULT, LOCAL_INFO_TYPE, CALL_LOG_SOURCE } from '../constants';
import _ from 'lodash';
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
    const updateResult: CallLog[] = [];
    const deleteResult: string[] = [];
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

      callLog.__timestamp = Date.parse(callLog.startTime);
      callLog.__deactivated = false;
      const pseudoInfo = pseudos[callLog.sessionId];
      if (pseudoInfo) {
        deleteResult.push(pseudoInfo.id);
        updateResult.push(callLog);
        replaceResult.set(pseudoInfo.id, callLog);
        delete pseudos[callLog.sessionId];
      } else {
        updateResult.push(callLog);
      }
    });

    mainLogger
      .tags(SYNC_NAME)
      .info(
        'handleDataAndSave, updateLength:',
        updateResult.length,
        'deleteLength:',
        deleteResult.length,
        'pseudoInfo:',
        pseudos,
      );

    deleteResult.length &&
      (await this.sourceController.bulkDelete(deleteResult));
    updateResult.length &&
      (await this.sourceController.bulkUpdate(updateResult));
    await this._userConfig.setPseudoCallLogInfo(pseudos);
    replaceResult.size &&
      notificationCenter.emitEntityReplace(
        this.sourceController.getEntityNotificationKey(),
        replaceResult,
      );
    return updateResult;
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
