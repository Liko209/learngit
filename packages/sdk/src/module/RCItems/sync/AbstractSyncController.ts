/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-14 14:26:48
 * Copyright © RingCentral. All rights reserved.
 */

import {
  SILENT_SYNC_INTERVAL,
  SYNC_TYPE,
  DEFAULT_RECORD_COUNT,
  MAX_RECORD_COUNT,
  SYNC_STATUS,
} from './constants';
import { mainLogger } from 'foundation/log';
import { silentSyncProcessorHandler } from './SilentSyncProcessorHandler';
import { SilentSyncProcessor } from './SilentSyncProcessor';
import {
  RCItemSyncResponse,
  RCItemSyncInfo,
} from 'sdk/api/ringcentral/types/RCItemSync';
import { JError, JRCError, ERROR_CODES_RC } from 'sdk/error';
import { SYNC_DIRECTION } from '../constants';
import { IRCItemSyncConfig } from '../config/IRCItemSyncConfig';
import { notificationCenter } from 'sdk/service';
import { IdModel, ModelIdType } from 'sdk/framework/model';
import { UndefinedAble } from 'sdk/types';

type FSyncResponse<T> = {
  resolve: (data: T[]) => void;
  reject: (reason: JError) => void;
};

abstract class AbstractSyncController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> {
  private _syncStatus: number = 0;
  private _lastSyncNewerTime: number = 0;
  private _FSyncQueue: FSyncResponse<T>[] = [];

  constructor(
    protected syncName: string,
    protected syncConfig: IRCItemSyncConfig,
    private _entityKey: string,
    private _interval: number = SILENT_SYNC_INTERVAL,
  ) {}

  async doSync(
    isSilent: boolean,
    direction: SYNC_DIRECTION,
    needNotification = true,
    recordCount = DEFAULT_RECORD_COUNT,
  ): Promise<T[]> {
    if (!(await this.hasPermission()) || this._isInClear()) {
      mainLogger
        .tags(this.syncName)
        .info(`can not do sync now, status: ${this._syncStatus}`);
      return [];
    }
    const syncToken = await this.getSyncToken();
    if (!syncToken) {
      return await this._doFSync(isSilent, recordCount);
    }

    if (!isSilent) {
      mainLogger.tags(this.syncName).info('start do ISync');
      if (direction === SYNC_DIRECTION.NEWER) {
        this._lastSyncNewerTime = Date.now();
      }
      return await this._startSync(
        isSilent,
        SYNC_TYPE.ISYNC,
        direction,
        recordCount,
        needNotification,
      ).catch((reason: JError) => {
        mainLogger
          .tags(this.syncName)
          .warn(
            `do ISync failed, direction: ${direction}, count: ${recordCount}, error: ${reason}`,
          );
        return [];
      });
    }

    const canDoSilentSync =
      Date.now() - this._lastSyncNewerTime > this._interval &&
      this.canDoSilentSync();

    if (canDoSilentSync) {
      mainLogger.tags(this.syncName).info('try to add ISync processor');
      this._lastSyncNewerTime = Date.now();
      const processor = new SilentSyncProcessor(this.syncName, async () => {
        await this._startSync(
          isSilent,
          SYNC_TYPE.ISYNC,
          SYNC_DIRECTION.NEWER,
          recordCount,
          needNotification,
        ).catch((reason: JError) => {
          mainLogger
            .tags(this.syncName)
            .warn(
              `do silent ISync failed, direction: ${direction}, count: ${recordCount}, error: ${reason}`,
            );
        });
      });
      silentSyncProcessorHandler.addProcessor(processor);
    }
    return [];
  }

  private async _doFSync(
    isSilent: boolean,
    recordCount?: number,
  ): Promise<T[]> {
    if (this._isInFSync()) {
      mainLogger
        .tags(this.syncName)
        .info(`is already in Fsync now, status: ${this._syncStatus}`);
      if (isSilent) {
        return [];
      }
      return new Promise<T[]>((resolve, reject) => {
        this._FSyncQueue.push({ resolve, reject });
      });
    }
    this._syncStatus = this._syncStatus | SYNC_STATUS.IN_FSYNC;
    let result: T[] = [];
    if (isSilent) {
      mainLogger.tags(this.syncName).info('try to add FSync processor');
      const processor = new SilentSyncProcessor(this.syncName, async () => {
        const data = await this._startSync(
          isSilent,
          SYNC_TYPE.FSYNC,
          undefined,
          recordCount,
        )
          .catch((reason: JError) => {
            mainLogger
              .tags(this.syncName)
              .warn(`do silent FSync, count: ${recordCount}, error: ${reason}`);
            this._rejectResponses(reason);
          })
          .finally(() => {
            this._syncStatus = this._syncStatus & ~SYNC_STATUS.IN_FSYNC;
          });
        this._resolveResponses(data || []);
      });
      silentSyncProcessorHandler.addProcessor(processor);
    } else {
      mainLogger.tags(this.syncName).info('start do FSync');
      result = await this._startSync(
        isSilent,
        SYNC_TYPE.FSYNC,
        undefined,
        recordCount,
      )
        .catch((reason: JError) => {
          mainLogger
            .tags(this.syncName)
            .warn(`do FSync, count: ${recordCount}, error: ${reason}`);
          this._rejectResponses(reason);
          throw reason;
        })
        .finally(() => {
          this._syncStatus = this._syncStatus & ~SYNC_STATUS.IN_FSYNC;
        });
      this._resolveResponses(result);
    }
    return result;
  }

  private async _startSync(
    isSilent: boolean,
    syncType: SYNC_TYPE,
    direction?: SYNC_DIRECTION,
    recordCount?: number,
    needNotification?: boolean,
  ): Promise<T[]> {
    let fetchCount: UndefinedAble<number>;
    if (syncType === SYNC_TYPE.FSYNC) {
      fetchCount = MAX_RECORD_COUNT;
    } else if (direction === SYNC_DIRECTION.OLDER) {
      fetchCount = recordCount || DEFAULT_RECORD_COUNT;
    }

    mainLogger
      .tags(this.syncName)
      .info(
        `start sync, isSilent: ${isSilent}, type:${syncType}, direction:${direction}, count:${fetchCount}`,
      );

    const syncToken = await this.getSyncToken();
    return await this.sendSyncRequest(syncType, syncToken, fetchCount)
      .then(async (result: RCItemSyncResponse<T>) => {
        if (!result || !result.records || !result.syncInfo) {
          throw new JRCError(
            ERROR_CODES_RC.UNKNOWN,
            'incomplete response data',
          );
        }
        mainLogger
          .tags(this.syncName)
          .info(`sync success, size:${result.records.length}`, result.syncInfo);
        return await this._handleSuccessResponse(
          result,
          isSilent,
          fetchCount,
          needNotification,
        );
      })
      .catch(async (reason: JError) => {
        await this._handleFailedResponse(reason);
        return [];
      });
  }

  async clearAll(): Promise<void> {
    if (this._isInClear()) {
      mainLogger
        .tags(this.syncName)
        .info(`is already in clear now, status: ${this._syncStatus}`);
    }

    this._syncStatus = this._syncStatus | SYNC_STATUS.IN_CLEAR;
    await this.requestClearAllAndRemoveLocalData()
      .then(async () => {
        await this.reset();
        notificationCenter.emitEntityReload(this._entityKey, [], true);
      })
      .catch((reason: JError) => {
        throw reason;
      })
      .finally(() => {
        this._syncStatus = this._syncStatus & ~SYNC_STATUS.IN_CLEAR;
      });
  }

  async reset() {
    silentSyncProcessorHandler.removeProcessorByName(this.syncName);
    this._syncStatus = 0;
    this._lastSyncNewerTime = 0;
    await this.removeHasMore();
    await this.removeSyncToken();
  }

  private async _handleSuccessResponse(
    result: RCItemSyncResponse<T>,
    isSilent: boolean,
    count?: number,
    needNotification?: boolean,
  ): Promise<T[]> {
    const data = await this.handleDataAndSave(result);
    if (this.canUpdateSyncToken(result.syncInfo)) {
      await this.setSyncToken(result.syncInfo.syncToken);
    }
    if (count && result.records.length < count) {
      await this.setHasMore(false);
    }

    if (isSilent && result.syncInfo.syncType === SYNC_TYPE.FSYNC) {
      notificationCenter.emitEntityReload(this._entityKey, [], true);
    }

    if (needNotification && data.length) {
      notificationCenter.emitEntityUpdate<T, IdType>(this._entityKey, data);
    }
    return data;
  }

  private async _handleFailedResponse(reason: JError): Promise<void> {
    if (this.isTokenInvalidError(reason)) {
      await this.removeLocalData();
      await this.reset();
      this.doSync(true, SYNC_DIRECTION.NEWER);
    } else {
      throw reason;
    }
  }

  private _isInClear() {
    return !!(this._syncStatus & SYNC_STATUS.IN_CLEAR);
  }

  private _isInFSync() {
    return !!(this._syncStatus & SYNC_STATUS.IN_FSYNC);
  }

  private _resolveResponses(data: T[]) {
    this._FSyncQueue.forEach((response: FSyncResponse<T>) => {
      response.resolve(data);
    });
    this._FSyncQueue = [];
  }

  private _rejectResponses(reason: JError) {
    this._FSyncQueue.forEach((response: FSyncResponse<T>) => {
      response.reject(reason);
    });
    this._FSyncQueue = [];
  }

  protected async setSyncToken(token: string): Promise<void> {
    await this.syncConfig.setSyncToken(token);
  }
  protected async getSyncToken(): Promise<string> {
    return await this.syncConfig.getSyncToken();
  }

  protected async removeSyncToken(): Promise<void> {
    return await this.syncConfig.removeSyncToken();
  }

  protected async setHasMore(hasMore: boolean): Promise<void> {
    await this.syncConfig.setHasMore(hasMore);
  }

  protected async removeHasMore(): Promise<void> {
    await this.syncConfig.removeHasMore();
  }

  protected abstract hasPermission(): Promise<boolean>;
  protected abstract canDoSilentSync(): boolean;
  protected abstract isTokenInvalidError(reason: JError): boolean;
  protected abstract canUpdateSyncToken(syncInfo: RCItemSyncInfo): boolean;
  protected abstract async requestClearAllAndRemoveLocalData(): Promise<void>;
  protected abstract async removeLocalData(): Promise<void>;
  protected abstract async handleDataAndSave(
    data: RCItemSyncResponse<T>,
  ): Promise<T[]>;

  protected abstract async sendSyncRequest(
    syncType: SYNC_TYPE,
    syncToken?: string,
    recordCount?: number,
  ): Promise<RCItemSyncResponse<T>>;
}

export { AbstractSyncController };
