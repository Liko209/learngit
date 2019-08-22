/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 15:54:50
 * Copyright © RingCentral. All rights reserved.
 */

import { CallLog } from '../entity';
import { IRCItemSyncConfig } from '../../config/IRCItemSyncConfig';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CALL_LOG_SOURCE, CALL_RESULT } from '../constants';
import { CALL_DIRECTION } from '../../constants';
import { daoManager } from 'sdk/dao';
import { FilterOptions, Caller, FetchDataOptions } from '../../types';
import { CallLogDao } from '../dao';
import { JError, ERROR_MSG_RC, ERROR_CODES_RC } from 'sdk/error';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CallLogService } from '../service';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { CALL_LOG_POST_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { RCItemFetchController } from '../../common/controller/RCItemFetchController';

abstract class AbstractFetchController extends RCItemFetchController<
CallLog,
string
> {
  constructor(
    syncName: string,
    userConfig: IRCItemSyncConfig,
    protected sourceController: IEntitySourceController<CallLog, string>,
    private _badgeController: CallLogBadgeController,
  ) {
    super(syncName, userConfig, sourceController.getEntityNotificationKey());
  }

  async buildFilterFunc(
    option: FilterOptions<CallLog>,
  ): Promise<(callLog: CallLog) => boolean> {
    const { callLogSource = CALL_LOG_SOURCE.ALL } = option;
    const filterFunc = await super.buildFilterFunc(option);
    return (callLog: CallLog): boolean => {
      const isMissedCall =
        callLog.result === CALL_RESULT.MISSED ||
        callLog.result === CALL_RESULT.VOICEMAIL;
      return (
        !callLog.deleted &&
        (callLogSource === CALL_LOG_SOURCE.ALL ? true : isMissedCall) &&
        filterFunc(callLog)
      );
    };
  }

  protected isTokenInvalidError(reason: JError): boolean {
    mainLogger.tags(this.syncName).info('receive sync error', reason);
    return (
      reason &&
      (reason.code === ERROR_CODES_RC.CLG_101 ||
        reason.code === ERROR_CODES_RC.CLG_102 ||
        reason.code === ERROR_CODES_RC.CLG_104 ||
        reason.message === ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG)
    );
  }

  protected async requestClearAllAndRemoveLocalData(): Promise<void> {
    const performanceTracer = PerformanceTracer.start();
    mainLogger.tags(this.syncName).info('clear call logs');
    await RCItemApi.deleteAllCallLogs();
    performanceTracer.trace({
      key: CALL_LOG_POST_PERFORMANCE_KEYS.CLEAR_ALL_CALL_LOG_FROM_SERVER,
    });
    await this.removeLocalData();
    performanceTracer.end({
      key: CALL_LOG_POST_PERFORMANCE_KEYS.CLEAR_ALL_CALL_LOG,
    });
  }

  protected async removeLocalData(): Promise<void> {
    await this.sourceController.clear();
    await await ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    ).userConfig.setPseudoCallLogInfo({});
  }

  protected async hasPermission(): Promise<boolean> {
    if (!(await super.hasPermission())) {
      return false;
    }

    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    ).isRCFeaturePermissionEnabled(ERCServiceFeaturePermission.READ_CALLLOG);
  }

  async reset() {
    await ServiceLoader.getInstance<CallLogService>(
      ServiceConfig.CALL_LOG_SERVICE,
    ).resetFetchControllers();
  }

  async internalReset() {
    super.reset();
  }

  protected getFilterInfo(data: CallLog): Caller {
    const caller =
      data.direction === CALL_DIRECTION.INBOUND ? data.from : data.to;
    return caller || {};
  }

  protected async fetchDataFromDB(
    options: FetchDataOptions<CallLog, string>,
  ): Promise<CallLog[]> {
    const dao = daoManager.getDao(CallLogDao);
    return await dao.queryCallLogs(options);
  }

  protected onDBFetchFinished(
    results: CallLog[],
    performanceTracer?: PerformanceTracer,
  ): void {
    performanceTracer &&
      performanceTracer.trace({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.FETCH_CALL_LOG_FROM_DB,
        count: results.length,
      });
  }

  protected onFetchFinished(
    results: CallLog[],
    performanceTracer?: PerformanceTracer,
  ): void {
    this._badgeController.handleCallLogs(results);
    performanceTracer &&
      performanceTracer.end({
        key: CALL_LOG_POST_PERFORMANCE_KEYS.FETCH_CALL_LOG,
        count: results.length,
      });
  }
}

export { AbstractFetchController };
