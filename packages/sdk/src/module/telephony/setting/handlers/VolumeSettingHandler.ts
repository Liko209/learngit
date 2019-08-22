/*
 * @Author: Paynter Chen
 * @Date: 2019-05-29 23:30:11
 * Copyright © RingCentral. All rights reserved.
 */

import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';

import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';
import { RC_INFO, SERVICE } from 'sdk/service/eventKey';
import { RCInfoService } from 'sdk/module/rcInfo';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ERCServiceFeaturePermission } from 'sdk/module/rcInfo/types';
import { ITelephonyService } from '../../service/ITelephonyService';

export class VolumeSettingHandler extends AbstractSettingEntityHandler<number> {
  id = SettingEntityIds.Phone_Volume;

  constructor(private _telephonyService: ITelephonyService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on(RC_INFO.EXTENSION_INFO, this._onPermissionChange);
    this.on(RC_INFO.ROLE_PERMISSIONS, this._onPermissionChange);
    this.on(SERVICE.TELEPHONY_SERVICE.VOIP_CALLING, this._onPermissionChange);
    TelephonyGlobalConfig.on(
      TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
      this._onVolumeUpdate,
    );
  }

  private _getEntityState = async () => {
    const rcInfoService = ServiceLoader.getInstance<RCInfoService>(
      ServiceConfig.RC_INFO_SERVICE,
    );
    const isEnable =
      (await this._telephonyService.getVoipCallPermission()) ||
      (await rcInfoService.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.VIDEO_CONFERENCING,
      )) ||
      (await rcInfoService.isRCFeaturePermissionEnabled(
        ERCServiceFeaturePermission.CONFERENCING,
      ));
    return isEnable ? ESettingItemState.ENABLE : ESettingItemState.INVISIBLE;
  };

  private _onPermissionChange = async () => {
    await this.getUserSettingEntity();
  };

  private _onVolumeUpdate = (type: number, value: string) => {
    const volume = Number(value);
    if (
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value !== volume
    ) {
      this.getUserSettingEntity();
    }
  };

  dispose() {
    super.dispose();
    TelephonyGlobalConfig.off(
      TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
      this._onVolumeUpdate,
    );
  }

  async updateValue(value: number) {
    TelephonyGlobalConfig.setCurrentVolume(String(value));
  }

  async fetchUserSettingEntity() {
    const volume = Number(TelephonyGlobalConfig.getCurrentVolume());

    const settingItem: UserSettingEntity<number> = {
      id: SettingEntityIds.Phone_Volume,
      value: volume,
      state: await this._getEntityState(),
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
