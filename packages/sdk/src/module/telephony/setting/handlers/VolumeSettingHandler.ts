/*
 * @Author: Paynter Chen
 * @Date: 2019-05-29 23:30:11
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';

import { TELEPHONY_GLOBAL_KEYS } from '../../config/configKeys';
import { TelephonyGlobalConfig } from '../../config/TelephonyGlobalConfig';

export class VolumeSettingHandler extends AbstractSettingEntityHandler<number> {
  id = SettingEntityIds.Phone_Volume;

  constructor() {
    super();
    this._subscribe();
  }

  private _subscribe() {
    TelephonyGlobalConfig.on(
      TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
      this._onVolumeUpdate,
    );
  }

  private _onVolumeUpdate = (value: number) => {
    const volume = Number(value);
    if (
      this.userSettingEntityCache &&
      this.userSettingEntityCache.value !== volume
    ) {
      this.getUserSettingEntity().then(entity =>
        this.notifyUserSettingEntityUpdate(entity),
      );
    }
  }

  dispose() {
    super.dispose();
    TelephonyGlobalConfig.off(
      TELEPHONY_GLOBAL_KEYS.CURRENT_VOLUME,
      this._onVolumeUpdate,
    );
  }

  async updateValue(value: number) {
    await TelephonyGlobalConfig.setCurrentVolume(String(value));
  }

  async fetchUserSettingEntity() {
    const volume = Number(TelephonyGlobalConfig.getCurrentVolume());

    const settingItem: UserSettingEntity<number> = {
      weight: 0,
      valueType: 0,
      parentModelId: 0,
      id: SettingEntityIds.Phone_Volume,
      value: volume,
      state: ESettingItemState.ENABLE,
      valueSetter: value => this.updateValue(value),
    };
    return settingItem;
  }
}
