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
import { SYNC_TYPE } from '../../sync';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';

const SYNC_NAME = 'AllCallLogFetchController';

class AllCallLogFetchController extends AbstractFetchController {
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
    const result = _.cloneDeep(data.records);
    result.forEach((callLog: CallLog) => {
      callLog.__source = CALL_LOG_SOURCE.ALL;
      callLog.__timestamp = Date.parse(callLog.startTime);
      callLog.__deactivated = false;
    });
    mainLogger
      .tags(SYNC_NAME)
      .info('handleDataAndSave, data length: ', result.length);
    result && (await this.sourceController.bulkUpdate(result));
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
    });
  }
}

export { AllCallLogFetchController };
