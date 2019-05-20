/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { GeneralModuleSetting } from '../GeneralModuleSetting';
import { SettingModuleIds } from '../../constants';

describe('GeneralModuleSetting', () => {
  describe('constructor', () => {
    it('should return GeneralModuleSetting', () => {
      const setting = new GeneralModuleSetting();
      expect(setting).toBeInstanceOf(GeneralModuleSetting);
      expect(setting.id()).toEqual(SettingModuleIds.GeneralSetting.id);
      expect(setting['_weight']).toEqual(
        SettingModuleIds.GeneralSetting.weight,
      );
    });
  });
});
