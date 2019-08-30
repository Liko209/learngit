/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-28 21:58:13
 * Copyright © RingCentral. All rights reserved.
 */

import { notificationCenter } from 'sdk/service';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CallLog } from '../entity';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { RCItemApi } from 'sdk/api';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ProfileService, SETTING_KEYS } from 'sdk/module/profile';
import { daoManager } from 'sdk/dao';
import { CallLogDao } from '../dao';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../config/performanceKeys';

const LOG_TAG = 'CallLogActionController';

class CallLogActionController {
  constructor(
    private _entitySourceController: IEntitySourceController<CallLog, string>,
  ) {}

  async deleteCallLogs(entityIds: string[]) {
    const performanceTracer = PerformanceTracer.start();
    mainLogger.tags(LOG_TAG).info('deleteCallLogs', entityIds);
    try {
      const callLogs = await this._entitySourceController.getEntitiesLocally(
        entityIds,
        false,
      );
      callLogs.forEach((value: CallLog) => {
        value.deleted = true;
      });
      await RCItemApi.deleteCallLog(entityIds);
      performanceTracer.trace({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.DELETE_CALL_LOG_FROM_SERVER,
      });

      await this._entitySourceController.bulkDelete(entityIds);
      notificationCenter.emitEntityUpdate<CallLog, string>(
        this._entitySourceController.getEntityNotificationKey(),
        callLogs,
      );
    } catch (error) {
      mainLogger.tags(LOG_TAG).warn('failed to delete callLogs: ', entityIds);
      throw error;
    } finally {
      performanceTracer.end({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.DELETE_CALL_LOG,
      });
    }
  }

  async clearUnreadMissedCall() {
    const newestTime = await daoManager
      .getDao(CallLogDao)
      .queryNewestTimestamp();
    if (!newestTime) {
      mainLogger
        .tags(LOG_TAG)
        .warn('can not clear unread missed call, newest timestamp is invalid');
      return;
    }
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );
    await profileService.updateSettingOptions([
      { key: SETTING_KEYS.LAST_READ_MISSED, value: newestTime },
    ]);
  }
}

export { CallLogActionController };
