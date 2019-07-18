/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 13:56:44
 * Copyright © RingCentral. All rights reserved.
 */

import { SettingEntityIds } from 'sdk/module/setting';
import { IRCInfoService } from '../service/IRCInfoService';
import { BaseModuleSetting } from '../../setting';
import { RegionSettingHandler } from './RegionSettingHandler';
import { CallerIdSettingHandler } from './CallerIdSettingHandler';
import { ExtensionSettingHandler } from './ExtensionSettingHandler';
import { DefaultAppSettingHandler } from './DefaultAppSettingHandler';

type HandlerMap = {
  [SettingEntityIds.Phone_CallerId]: CallerIdSettingHandler;
  [SettingEntityIds.Phone_DefaultApp]: DefaultAppSettingHandler;
  [SettingEntityIds.Phone_Region]: RegionSettingHandler;
  [SettingEntityIds.Phone_Extension]: ExtensionSettingHandler;
};

class RcInfoSettings extends BaseModuleSetting<HandlerMap> {
  constructor(private _rcInfoService: IRCInfoService) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_CallerId]: new CallerIdSettingHandler(),
      [SettingEntityIds.Phone_DefaultApp]: new DefaultAppSettingHandler(),
      [SettingEntityIds.Phone_Region]: new RegionSettingHandler(
        this._rcInfoService,
      ),
      [SettingEntityIds.Phone_Extension]: new ExtensionSettingHandler(
        this._rcInfoService,
      ),
    };
  }
}

export { RcInfoSettings };
