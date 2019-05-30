/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { RCExtensionInfo } from 'sdk/api';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  ESettingValueType,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { SettingModuleIds } from 'sdk/module/setting/constants';
import { RC_INFO } from 'sdk/service';
import { IRCInfoService } from '../service/IRCInfoService';
import { ERCWebSettingUri } from '../types';

export class ExtensionSettingHandler extends AbstractSettingEntityHandler<
  string
> {
  id = SettingEntityIds.Phone_Region;

  constructor(private _rcInfoService: IRCInfoService) {
    super();
    this._subscribe();
  }

  private _subscribe() {
    this.on<RCExtensionInfo>(RC_INFO.CLIENT_INFO, async () => {
      this.notifyUserSettingEntityUpdate(await this.getUserSettingEntity());
    });
  }

  async updateValue(value: string) {}

  async fetchUserSettingEntity() {
    return this._getExtensionSetting();
  }

  private _getExtensionSetting(): UserSettingEntity<string> {
    return {
      id: SettingEntityIds.Phone_Extension,
      weight: SettingModuleIds.ExtensionSetting.weight,
      valueType: ESettingValueType.LINK,
      valueGetter: () => {
        return this._rcInfoService.generateWebSettingUri(
          ERCWebSettingUri.EXTENSION_URI,
        );
      },
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      state: ESettingItemState.ENABLE,
    };
  }
}
