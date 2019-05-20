/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { CalendarModuleSetting } from '../CalendarModuleSetting';
import { SettingModuleIds } from '../../constants';

describe('CalendarModuleSetting', () => {
  describe('constructor', () => {
    it('should return CalendarModuleSetting', () => {
      const setting = new CalendarModuleSetting();
      expect(setting).toBeInstanceOf(CalendarModuleSetting);
      expect(setting.id()).toEqual(SettingModuleIds.CalendarSetting.id);
      expect(setting['_weight']).toEqual(
        SettingModuleIds.CalendarSetting.weight,
      );
    });
  });
});
