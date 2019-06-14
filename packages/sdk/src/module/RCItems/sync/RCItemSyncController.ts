/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-15 14:44:44
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { AbstractSyncController } from './AbstractSyncController';
import { DEFAULT_REQUEST_SYNC_INTERVAL } from './constants';
import { SYNC_DIRECTION } from '../constants';
import { notificationCenter, WINDOW, SERVICE } from 'sdk/service';
import { IRCItemSyncConfig } from '../config/IRCItemSyncConfig';
import { RCItemSyncInfo } from 'sdk/api/ringcentral/types/RCItemSync';
import { IdModel, ModelIdType } from 'sdk/framework/model';

const VISIBLE = 'visible';
abstract class RCItemSyncController<
  T extends IdModel<IdType>,
  IdType extends ModelIdType = number
> extends AbstractSyncController<T, IdType> {
  private _lastRequestSyncTime = 0;
  private _triggerSilentFetchKeys = [
    SERVICE.LOGIN,
    WINDOW.FOCUS,
    WINDOW.ONLINE,
  ];
  constructor(
    syncName: string,
    syncConfig: IRCItemSyncConfig,
    entityKey: string,
    interval?: number,
    private _requestSyncInterval: number = DEFAULT_REQUEST_SYNC_INTERVAL,
  ) {
    super(syncName, syncConfig, entityKey, interval);
  }

  init() {
    this._triggerSilentFetchKeys.forEach((key: string) => {
      notificationCenter.on(key, this.handleNotification);
    });
  }

  dispose() {
    this._triggerSilentFetchKeys.forEach((key: string) => {
      notificationCenter.off(key, this.handleNotification);
    });
  }

  handleNotification = async () => {
    await this.doSync(true, SYNC_DIRECTION.NEWER);
  }

  protected canUpdateSyncToken(syncInfo: RCItemSyncInfo): boolean {
    return true;
  }

  async requestSync() {
    if (Date.now() - this._lastRequestSyncTime > this._requestSyncInterval) {
      this.doSync(true, SYNC_DIRECTION.NEWER);
      this._lastRequestSyncTime = Date.now();
    }
  }

  protected canDoSilentSync(): boolean {
    return document.visibilityState === VISIBLE && window.navigator.onLine;
  }

  protected async hasPermission(): Promise<boolean> {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    return await rcInfoService.isVoipCallingAvailable();
  }
}

export { RCItemSyncController };
