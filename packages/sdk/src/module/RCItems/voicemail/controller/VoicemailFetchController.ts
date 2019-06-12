/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 10:43:14
 * Copyright © RingCentral. All rights reserved.
 */

import { RCItemSyncController } from '../../sync/RCItemSyncController';
import { Voicemail } from '../entity';
import { RCItemUserConfig } from '../../config';
import { RCItemApi } from 'sdk/api/ringcentral/RCItemApi';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { RCItemSyncResponse } from 'sdk/api/ringcentral/types/RCItemSync';
import {
  RC_MESSAGE_TYPE,
  SYNC_DIRECTION,
  DEFAULT_FETCH_SIZE,
  MESSAGE_AVAILABILITY,
} from '../../constants';
import { SYNC_TYPE } from '../../sync';
import { JError, ERROR_CODES_RC, ERROR_MSG_RC } from 'sdk/error';
import { mainLogger } from 'foundation';
import { FetchResult } from '../../types';
import { PerformanceTracer, PERFORMANCE_KEYS } from 'sdk/utils';
import { daoManager, QUERY_DIRECTION } from 'sdk/dao';
import { VoicemailDao } from '../dao';
import { VoicemailBadgeController } from './VoicemailBadgeController';

const MODULE_NAME = 'VoicemailFetchController';

class VoicemailFetchController extends RCItemSyncController<Voicemail> {
  constructor(
    userConfig: RCItemUserConfig,
    private _entitySourceController: IEntitySourceController<Voicemail>,
    private _badgeController: VoicemailBadgeController,
  ) {
    super(
      MODULE_NAME,
      userConfig,
      _entitySourceController.getEntityNotificationKey(),
    );
  }

  async fetchVoicemails(
    limit = DEFAULT_FETCH_SIZE,
    direction = QUERY_DIRECTION.OLDER,
    anchorId?: number,
  ): Promise<FetchResult<Voicemail>> {
    const performanceTracer = PerformanceTracer.initial();
    let hasMore = true;
    mainLogger
      .tags(this.syncName)
      .info(
        `fetchVoicemails, anchorId:${anchorId}, limit:${limit}, direction:${direction}, anchorId:${anchorId}`,
      );

    let results: Voicemail[] = [];
    const dao = daoManager.getDao(VoicemailDao);
    results = results.concat(
      await dao.queryVoicemails(limit, direction, anchorId),
    );

    performanceTracer.trace({
      key: PERFORMANCE_KEYS.FETCH_VOICEMAILS_FROM_DB,
      count: results.length,
    });

    // only request from server when has no data in local
    if (results.length < limit) {
      hasMore = await this.syncConfig.getHasMore();
      if (hasMore) {
        results = results.concat(
          await this.doSync(
            false,
            direction === QUERY_DIRECTION.OLDER
              ? SYNC_DIRECTION.OLDER
              : SYNC_DIRECTION.NEWER,
          ),
        );
        this._badgeController.handleVoicemails(results);
        hasMore = await this.syncConfig.getHasMore();
      }
    }

    mainLogger
      .tags(this.syncName)
      .info(
        `fetchVoicemails success, dataSize:${
          results.length
        }, hasMore:${hasMore}`,
      );

    performanceTracer.end({
      key: PERFORMANCE_KEYS.FETCH_VOICEMAILS,
      count: results.length,
    });
    return {
      hasMore,
      data: results,
    };
  }

  protected isTokenInvalidError(reason: JError): boolean {
    mainLogger.tags(MODULE_NAME).log('receive sync error', reason);

    return (
      reason &&
      (reason.code === ERROR_CODES_RC.MSG_333 ||
        reason.message === ERROR_MSG_RC.SYNC_TOKEN_INVALID_ERROR_MSG)
    );
  }

  protected async requestClearAllAndRemoveLocalData(): Promise<void> {
    const performanceTracer = PerformanceTracer.initial();
    mainLogger.tags(MODULE_NAME).log('clearMessages');
    await RCItemApi.deleteAllMessages({ type: RC_MESSAGE_TYPE.VOICEMAIL });
    performanceTracer.trace({
      key: PERFORMANCE_KEYS.CLEAR_ALL_VOICEMAILS_FROM_SERVER,
    });
    await this.removeLocalData();
    performanceTracer.end({
      key: PERFORMANCE_KEYS.CLEAR_ALL_VOICEMAILS,
    });
  }

  protected async removeLocalData(): Promise<void> {
    await this._entitySourceController.clear();
  }

  protected async handleDataAndSave(
    data: RCItemSyncResponse<Voicemail>,
  ): Promise<Voicemail[]> {
    if (data && data.records && data.records.length) {
      mainLogger
        .tags(MODULE_NAME)
        .log('handleDataAndSave, receive vms length is', data.records.length);

      const deactivatedVmIds: number[] = [];
      const normalVms: Voicemail[] = [];

      data.records.forEach(vm => {
        if (vm.availability === MESSAGE_AVAILABILITY.ALIVE) {
          normalVms.push(vm);
        } else {
          deactivatedVmIds.push(vm.id);
        }
      });
      normalVms.length &&
        (await this._entitySourceController.bulkUpdate(normalVms));
      deactivatedVmIds.length &&
        (await this._entitySourceController.bulkDelete(deactivatedVmIds));
    }
    return data.records;
  }

  protected async sendSyncRequest(
    syncType: SYNC_TYPE,
    syncToken?: string,
    recordCount?: number,
  ): Promise<RCItemSyncResponse<Voicemail>> {
    return await RCItemApi.syncMessage({
      syncType,
      recordCount,
      syncToken,
      messageType:
        syncType === SYNC_TYPE.FSYNC ? RC_MESSAGE_TYPE.VOICEMAIL : undefined,
    });
  }
}

export { VoicemailFetchController };
