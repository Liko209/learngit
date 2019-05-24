/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 17:21:43
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import {
  SettingEntityIds,
  IModuleSetting,
  UserSettingEntity,
} from 'sdk/module/setting';
import { IProfileService } from '../service/IProfileService';
import { CallerIdSettingHandler } from './CallerIdSettingHandler';
import { Nullable } from 'sdk/types';

type HandlerMap = {
  [SettingEntityIds.CallerId]: CallerIdSettingHandler;
};

class ProfileSetting implements IModuleSetting {
  private _handlerMap: HandlerMap;

  constructor(private _profileService: IProfileService) {
    this._handlerMap = {
      [SettingEntityIds.CallerId]: new CallerIdSettingHandler(
        this._profileService,
      ),
    };
  }

  async getById<T>(
    settingId: SettingEntityIds,
  ): Promise<Nullable<UserSettingEntity<T>>> {
    if (this._handlerMap[settingId]) {
      return await this._handlerMap[settingId].getUserSettingEntity();
    }
    return null;
  }
}

export { ProfileSetting };
