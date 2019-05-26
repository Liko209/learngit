/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 13:56:44
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingEntityIds } from 'sdk/module/setting';
import { IRCInfoService } from '../service/IRCInfoService';
import { BaseModuleSetting } from '../../setting';
import { RegionSettingHandler } from './RegionSettingHandler';
import { ExtensionSettingHandler } from './ExtensionSettingHandler';
type HandlerMap = {
  [SettingEntityIds.Phone_Region]: RegionSettingHandler;
  [SettingEntityIds.Phone_Region]: ExtensionSettingHandler;
};

class RcInfoSettings extends BaseModuleSetting<HandlerMap> {
  constructor(private _rcInfoService: IRCInfoService) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_Region]: new RegionSettingHandler(
        this._rcInfoService,
      ),
      [SettingEntityIds.Phone_Region]: new ExtensionSettingHandler(
        this._rcInfoService,
      ),
    };
  }
}

export { RcInfoSettings };
