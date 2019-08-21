/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-24 13:20:41
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLog } from '../entity';
import { EntityBaseService } from 'sdk/framework';
import { daoManager } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { FetchResult, FetchDataOptions, FilterOptions } from '../../types';
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
    super({ isSupportedCache: false }, daoManager.getDao(CallLogDao));
    this.setSubscriptionController(
      SubscribeController.buildSubscriptionController({
        [SUBSCRIPTION.PRESENCE_WITH_TELEPHONY_DETAIL]: this
          ._handleRCPresenceEvent,
        [SUBSCRIPTION.MISSED_CALLS]: this._handleMissedCallEvent,
      }),
    );
  }

  onRCLogin() {
    super.onRCLogin();
    this._initBadge();
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
        this.getEntityNotificationController(),
      );
    }
    return this._callLogController;
  }

  async requestSyncNewer() {
    this.callLogController.allCallLogFetchController.requestSync();
  }

  async buildFilterFunc(
    options: FilterOptions<CallLog>,
  ): Promise<(callLog: CallLog) => boolean> {
    return this.callLogController.allCallLogFetchController.buildFilterFunc(
      options,
    );
  }

  async fetchCallLogs(
    options: FetchDataOptions<CallLog, string>,
  ): Promise<FetchResult<CallLog>> {
    const { callLogSource = CALL_LOG_SOURCE.ALL } = options;
    return callLogSource === CALL_LOG_SOURCE.ALL
      ? this.callLogController.allCallLogFetchController.fetchData(options)
      : this.callLogController.missedCallLogFetchController.fetchData(options);
  }

  async fetchRecentCallLogs() {
    return this.callLogController.allCallLogFetchController.fetchAllUniquePhoneNumberCalls();
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

  async resetFetchControllers() {
    await this.callLogController.allCallLogFetchController.internalReset();
    await this.callLogController.missedCallLogFetchController.internalReset();
  }

  async getTotalCount(): Promise<number> {
    return await this.getEntitySource().getTotalCount();
  }

  private _handleMissedCallEvent = async (payload: MissedCallEventPayload) => {
    await this.callLogController.callLogHandleDataController.handleMissedCallEvent(
      payload,
    );
  };

  private _handleRCPresenceEvent = async (payload: RCPresenceEventPayload) => {
    await this.callLogController.callLogHandleDataController.handleRCPresenceEvent(
      payload,
    );
  };

  private _initBadge = async () => {
    await this.callLogController.callLogBadgeController.initializeUnreadCount();
  };
}

export { CallLogService };
