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
import { mainLogger } from 'foundation/log';
import { CALL_LOG_SOURCE, LOCAL_INFO_TYPE } from '../constants';
import _ from 'lodash';
import { daoManager } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { SYNC_TYPE } from '../../sync';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';

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
    const oldestTime = await dao.queryOldestTimestamp();
    const result: CallLog[] = [];

    data.records.forEach((callLog: CallLog) => {
      const timestamp = Date.parse(callLog.startTime);
      if (!oldestTime || oldestTime > timestamp) {
        callLog.__localInfo =
          LOCAL_INFO_TYPE.IS_INBOUND |
          LOCAL_INFO_TYPE.IS_MISSED |
          LOCAL_INFO_TYPE.IS_MISSED_SOURCE;
        callLog.__timestamp = timestamp;
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
