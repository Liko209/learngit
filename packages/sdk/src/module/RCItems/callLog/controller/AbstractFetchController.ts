/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-29 15:54:50
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemSyncController } from '../../sync/RCItemSyncController';
import { CallLog } from '../entity';
import { IRCItemSyncConfig } from '../../config/IRCItemSyncConfig';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { CALL_LOG_SOURCE } from '../constants';
import { DEFAULT_FETCH_SIZE, SYNC_DIRECTION } from '../../constants';
import { QUERY_DIRECTION, daoManager } from 'sdk/dao';
import { FetchResult } from '../../types';
import { PerformanceTracer, PERFORMANCE_KEYS } from 'sdk/utils';
import { CallLogDao } from '../dao';
import { JError, ERROR_MSG_RC, ERROR_CODES_RC } from 'sdk/error';
import { mainLogger } from 'foundation';
import { RCItemApi } from 'sdk/api';
import { CallLogBadgeController } from './CallLogBadgeController';

abstract class AbstractFetchController extends RCItemSyncController<
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

  async fetchCallLogs(
    source: CALL_LOG_SOURCE,
    anchorId?: string,
    limit = DEFAULT_FETCH_SIZE,
    direction = QUERY_DIRECTION.OLDER,
  ): Promise<FetchResult<CallLog>> {
    const performanceTracer = PerformanceTracer.initial();

    let hasMore = true;
    mainLogger
      .tags(this.syncName)
      .info(
        `fetchCallLogs, source:${source}, anchorId:${anchorId}, limit:${limit}, direction:${direction}`,
      );

    const dao = daoManager.getDao(CallLogDao);
    let results: CallLog[] = await dao.queryCallLogs(
      source,
      anchorId,
      direction,
      limit,
    );

    performanceTracer.trace({
      key: PERFORMANCE_KEYS.FETCH_CALL_LOG_FROM_DB,
      count: results.length,
    });

    // only request from server when has no data in local
    if (results.length === 0) {
      results = await this.doSync(
        false,
        direction === QUERY_DIRECTION.OLDER
          ? SYNC_DIRECTION.OLDER
          : SYNC_DIRECTION.NEWER,
      );
      this._badgeController.handleCallLogs(results);
      hasMore = await this.syncConfig.getHasMore();
    }

    mainLogger
      .tags(this.syncName)
      .info(
        `fetchCallLogs success, dataSize:${results.length}, hasMore:${hasMore}`,
      );

    performanceTracer.end({
      key: PERFORMANCE_KEYS.FETCH_CALL_LOG,
      count: results.length,
    });
    return {
      hasMore,
      data: results,
    };
  }

  protected isTokenInvalidError(reason: JError): boolean {
    mainLogger.tags(this.syncName).info('receive sync token error', reason);
    return (
      reason &&
      reason.message === ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG &&
      (reason.code === ERROR_CODES_RC.CLG_101 ||
        reason.code === ERROR_CODES_RC.CLG_102 ||
        reason.code === ERROR_CODES_RC.CLG_104)
    );
  }

  protected async requestClearAllAndRemoveLocalData(): Promise<void> {
    const performanceTracer = PerformanceTracer.initial();
    mainLogger.tags(this.syncName).info('clear call logs');
    await RCItemApi.deleteAllCallLogs();
    performanceTracer.trace({
      key: PERFORMANCE_KEYS.CLEAR_ALL_CALL_LOG_FROM_SERVER,
    });
    await this.sourceController.clear();
    performanceTracer.end({
      key: PERFORMANCE_KEYS.CLEAR_ALL_CALL_LOG,
    });
  }
}

export { AbstractFetchController };
