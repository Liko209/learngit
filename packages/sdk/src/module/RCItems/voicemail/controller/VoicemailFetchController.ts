/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-28 10:43:14
 * Copyright © RingCentral. All rights reserved.
 */

import { Voicemail } from '../entity';
import { RCItemUserConfig } from '../../config';
import { RCItemApi } from 'sdk/api/ringcentral/RCItemApi';
import { IEntitySourceController } from 'sdk/framework/controller/interface/IEntitySourceController';
import { RCItemSyncResponse } from 'sdk/api/ringcentral/types/RCItemSync';
import { RC_MESSAGE_TYPE, MESSAGE_AVAILABILITY } from '../../constants';
import { SYNC_TYPE } from '../../sync';
import { JError, ERROR_CODES_RC, ERROR_MSG_RC } from 'sdk/error';
import { mainLogger } from 'foundation/log';
import { PerformanceTracer } from 'foundation/performance';
import { Caller, FilterOptions, FetchDataOptions } from '../../types';
import { daoManager } from 'sdk/dao';
import { VoicemailDao } from '../dao';
import { VoicemailBadgeController } from './VoicemailBadgeController';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { VOICEMAIL_PERFORMANCE_KEYS } from '../config/performanceKeys';
import { RCItemFetchController } from '../../common/controller/RCItemFetchController';

const MODULE_NAME = 'VoicemailFetchController';

class VoicemailFetchController extends RCItemFetchController<Voicemail> {
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

  async buildFilterFunc(
    option: FilterOptions<Voicemail>,
  ): Promise<(voicemail: Voicemail) => boolean> {
    const filterFunc = await super.buildFilterFunc(option);
    return (voicemail: Voicemail): boolean => (
      voicemail.availability === MESSAGE_AVAILABILITY.ALIVE &&
        filterFunc(voicemail)
    );
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
    const performanceTracer = PerformanceTracer.start();
    mainLogger.tags(MODULE_NAME).log('clearMessages');
    await RCItemApi.deleteAllMessages({ type: RC_MESSAGE_TYPE.VOICEMAIL });
    performanceTracer.trace({
      key: VOICEMAIL_PERFORMANCE_KEYS.CLEAR_ALL_VOICEMAILS_FROM_SERVER,
    });
    await this.removeLocalData();
    performanceTracer.end({
      key: VOICEMAIL_PERFORMANCE_KEYS.CLEAR_ALL_VOICEMAILS,
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
        vm.__timestamp = Date.parse(vm.creationTime);
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

  protected async hasPermission(): Promise<boolean> {
    if (!(await super.hasPermission())) {
      return false;
    }

    return ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    ).isRCFeaturePermissionEnabled(ERCServiceFeaturePermission.READ_MESSAGES);
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

  protected getFilterInfo(data: Voicemail): Caller {
    return data.from || {};
  }

  protected async fetchDataFromDB(
    options: FetchDataOptions<Voicemail>,
  ): Promise<Voicemail[]> {
    const dao = daoManager.getDao(VoicemailDao);
    return await dao.queryVoicemails(options);
  }

  protected onDBFetchFinished(
    results: Voicemail[],
    performanceTracer?: PerformanceTracer,
  ): void {
    performanceTracer &&
      performanceTracer.trace({
        key: VOICEMAIL_PERFORMANCE_KEYS.FETCH_VOICEMAILS_FROM_DB,
        count: results.length,
      });
  }

  protected onFetchFinished(
    results: Voicemail[],
    performanceTracer?: PerformanceTracer,
  ): void {
    this._badgeController.handleVoicemails(results);
    performanceTracer &&
      performanceTracer.end({
        key: VOICEMAIL_PERFORMANCE_KEYS.FETCH_VOICEMAILS,
        count: results.length,
      });
  }
}

export { VoicemailFetchController };
