/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 17:27:00
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractFetchController } from './AbstractFetchController';
import { IRCItemSyncConfig } from '../../config/IRCItemSyncConfig';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLog } from '../entity';
import { RCItemSyncResponse } from 'sdk/api/ringcentral/types/RCItemSync';
import { mainLogger } from 'foundation';
import { CALL_LOG_SOURCE } from '../constants';
import _ from 'lodash';
import { daoManager } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { SYNC_TYPE } from '../../sync';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from '../service';
import { Nullable } from 'sdk/types';

const SYNC_NAME = 'MissedCallLogFetchController';

class MissedCallLogFetchController extends AbstractFetchController {
  constructor(
    userConfig: IRCItemSyncConfig,
    sourceController: IEntitySourceController<CallLog, string>,
    badgeController: CallLogBadgeController,
  ) {
    super(SYNC_NAME, userConfig, sourceController, badgeController);
  }

  protected async handleDataAndSave(
    data: RCItemSyncResponse<CallLog>,
  ): Promise<CallLog[]> {
    const dao = daoManager.getDao(CallLogDao);
    let oldestTime: Nullable<number> = null;
    const result: CallLog[] = [];

    if (data.syncInfo.syncType === SYNC_TYPE.FSYNC) {
      await this.sourceController.clear();
      await ServiceLoader.getInstance<CallLogService>(
        ServiceConfig.CALL_LOG_SERVICE,
      ).userConfig.setPseudoCallLogInfo({});
    } else {
      oldestTime = await dao.queryOldestTimestamp();
    }

    data.records.forEach((callLog: CallLog) => {
      const timestamp = Date.parse(callLog.startTime);
      if (!oldestTime || oldestTime > timestamp) {
        callLog.__source = CALL_LOG_SOURCE.MISSED;
        callLog.__timestamp = timestamp;
        callLog.__deactivated = false;
        result.push(_.cloneDeep(callLog));
      }
    });
    mainLogger
      .tags(SYNC_NAME)
      .info('handleDataAndSave, data length: ', result.length);
    result.length && (await this.sourceController.bulkPut(result));
    return result;
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
      statusGroup:
        syncType === SYNC_TYPE.FSYNC ? CALL_LOG_SOURCE.MISSED : undefined,
    });
  }
}

export { MissedCallLogFetchController };
