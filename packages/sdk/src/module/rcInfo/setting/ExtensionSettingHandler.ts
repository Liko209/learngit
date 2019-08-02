/*
 * @Author: Paynter Chen
 * @Date: 2019-05-24 13:33:49
 * Copyright © RingCentral. All rights reserved.
 */
import { RCExtensionInfo } from 'sdk/api';
import { ESettingItemState } from 'sdk/framework/model/setting';
import {
  AbstractSettingEntityHandler,
  SettingEntityIds,
  UserSettingEntity,
} from 'sdk/module/setting';
import { RC_INFO } from 'sdk/service';
import { IRCInfoService } from '../service/IRCInfoService';
import { ERCWebUris } from '../types';

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
      await this.getUserSettingEntity();
    });
  }

  async updateValue() {}

  async fetchUserSettingEntity() {
    return this._getExtensionSetting();
  }

  private _getExtensionSetting(): UserSettingEntity<string> {
    return {
      id: SettingEntityIds.Phone_Extension,
      valueGetter: () =>
        this._rcInfoService.generateWebSettingUri(ERCWebUris.EXTENSION_URI),
      state: ESettingItemState.ENABLE,
    };
  }
}
