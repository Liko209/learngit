/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { SettingEntityIds, BaseModuleSetting } from 'sdk/module/setting';
import { IProfileService } from '../service/IProfileService';
import { CallerIdSettingHandler } from './CallerIdSettingHandler';

type HandlerMap = {
  [SettingEntityIds.Phone_CallerId]: CallerIdSettingHandler;
};

class ProfileSetting extends BaseModuleSetting<HandlerMap> {
  constructor(private _profileService: IProfileService) {
    super();
  }

  getHandlerMap() {
    return {
      [SettingEntityIds.Phone_CallerId]: new CallerIdSettingHandler(
        this._profileService,
      ),
    };
  }
}

export { ProfileSetting };
