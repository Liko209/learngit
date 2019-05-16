/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { NotificationModuleSetting } from '../NotificationModuleSetting';
import { SettingModuleIds } from '../../constants';

describe('NotificationModuleSetting', () => {
  describe('constructor', () => {
    it('should return NotificationModuleSetting', () => {
      const setting = new NotificationModuleSetting();
      expect(setting).toBeInstanceOf(NotificationModuleSetting);
      expect(setting.id()).toEqual(SettingModuleIds.NotificationSetting.id);
      expect(setting['_weight']).toEqual(
        SettingModuleIds.NotificationSetting.weight,
      );
    });
  });
});
