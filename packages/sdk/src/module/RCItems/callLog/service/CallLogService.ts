/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 13:20:41
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLog } from '../entity';
import { EntityBaseService } from 'sdk/framework';
import { daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { DEFAULT_FETCH_SIZE } from '../../constants';
import { FetchResult } from '../../types';
import { CALL_LOG_SOURCE, MODULE_NAME } from '../constants';
import { CallLogController } from '../controller/CallLogController';
import { RCItemUserConfig } from '../../config';

class CallLogService extends EntityBaseService<CallLog, string> {
  private _callLogController: CallLogController;
  private _userConfig: RCItemUserConfig;
  private _missedCallUserConfig: RCItemUserConfig;

  constructor() {
    super(false, daoManager.getDao(CallLogDao));
  }

  onStarted() {
    super.onStarted();
    this.callLogController.allCallLogFetchController.init();
    this.callLogController.callLogBadgeController.init();
  }

  private get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new RCItemUserConfig(
        `${MODULE_NAME}.${CALL_LOG_SOURCE.ALL}`,
      );
    }
    return this._userConfig;
  }

  private get missedCallUserConfig() {
    if (!this._missedCallUserConfig) {
      this._missedCallUserConfig = new RCItemUserConfig(
        `${MODULE_NAME}.${CALL_LOG_SOURCE.MISSED}`,
      );
    }
    return this._missedCallUserConfig;
  }

  private get callLogController() {
    if (!this._callLogController) {
      this._callLogController = new CallLogController(
        this.getEntitySource(),
        this.userConfig,
        this.missedCallUserConfig,
      );
    }
    return this._callLogController;
  }

  async requestSyncNewer(source: CALL_LOG_SOURCE) {
    if (source === CALL_LOG_SOURCE.ALL) {
      this.callLogController.allCallLogFetchController.requestSync();
    } else {
      this.callLogController.missedCallLogFetchController.requestSync();
    }
  }

  async fetchCallLogs(
    source: CALL_LOG_SOURCE,
    anchorId?: string,
    limit = DEFAULT_FETCH_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  ): Promise<FetchResult<CallLog>> {
    if (source === CALL_LOG_SOURCE.ALL) {
      return this.callLogController.allCallLogFetchController.fetchCallLogs(
        source,
        anchorId,
        limit,
        direction,
      );
    }
    return this.callLogController.missedCallLogFetchController.fetchCallLogs(
      source,
      anchorId,
      limit,
      direction,
    );
  }

  async clearUnreadMissedCall() {
    await this.callLogController.callLogActionController.clearUnreadMissedCall();
  }

  async deleteCallLogs(ids: string[]) {
    return await this.callLogController.callLogActionController.deleteCallLogs(
      ids,
    );
  }

  async clearAllCallLogs() {
    return await this.callLogController.allCallLogFetchController.clearAll();
  }
}

export { CallLogService };
