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
import { SubscribeController } from 'sdk/module/base/controller/SubscribeController';
import { SUBSCRIPTION } from 'sdk/service';
import {
  MissedCallEventPayload,
  RCPresenceEventPayload,
} from 'sdk/module/rcEventSubscription/types';
import { CallLogUserConfig } from '../config/CallLogUserConfig';

class CallLogService extends EntityBaseService<CallLog, string> {
  private _callLogController: CallLogController;
  private _userConfig: CallLogUserConfig;
  private _missedCallUserConfig: RCItemUserConfig;

  constructor() {
    super(false, daoManager.getDao(CallLogDao));
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL]: this
          ._handleRCPresenceEvent,
        [SUBSCRIPTION.MISSED_CALLS]: this._handleMissedCallEvent,
      }),
    );
  }

  onStarted() {
    super.onStarted();
    this.callLogController.allCallLogFetchController.init();
    this.callLogController.callLogBadgeController.init();
  }

  onStopped() {
    super.onStopped();
    this.callLogController.allCallLogFetchController.dispose();
    this.callLogController.callLogBadgeController.dispose();
  }

  get userConfig() {
    if (!this._userConfig) {
      this._userConfig = new CallLogUserConfig(
        `${MODULE_NAME}.${CALL_LOG_SOURCE.ALL}`,
      );
    }
    return this._userConfig;
  }

  get missedCallUserConfig() {
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

  async requestSyncNewer() {
    this.callLogController.allCallLogFetchController.requestSync();
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

  private _handleMissedCallEvent = async (payload: MissedCallEventPayload) => {
    await this.callLogController.callLogHandleDataController.handleMissedCallEvent(
      payload,
    );
  }

  private _handleRCPresenceEvent = async (payload: RCPresenceEventPayload) => {
    await this.callLogController.callLogHandleDataController.handleRCPresenceEvent(
      payload,
    );
  }
}

export { CallLogService };
