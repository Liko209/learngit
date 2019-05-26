/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SettingEntityIds, BaseModuleSetting } from 'sdk/module/setting';
import { IProfileService } from '../service/IProfileService';
import { CallerIdSettingHandler } from './CallerIdSettingHandler';
import { DefaultAppSettingHandler } from './DefaultAppSettingHandler';
import { TelephonyService } from 'sdk/module/telephony';

type HandlerMap = {
  [SettingEntityIds.Phone_CallerId]: CallerIdSettingHandler;
  [SettingEntityIds.Phone_DefaultApp]: DefaultAppSettingHandler;
};

class ProfileSetting extends BaseModuleSetting<HandlerMap> {
  constructor(
    private _profileService: IProfileService,
    private _telephonyService: TelephonyService,
  ) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_CallerId]: new CallerIdSettingHandler(
        this._profileService,
      ),
      [SettingEntityIds.Phone_DefaultApp]: new DefaultAppSettingHandler(
        this._profileService,
        this._telephonyService,
      ),
    };
  }
}

export { ProfileSetting };
