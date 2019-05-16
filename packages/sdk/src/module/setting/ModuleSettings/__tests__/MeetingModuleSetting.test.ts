/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { MeetingModuleSetting } from '../MeetingModuleSetting';
import { SettingModuleIds } from '../../constants';

describe('MeetingModuleSetting', () => {
  describe('constructor', () => {
    it('should return MeetingModuleSetting', () => {
      const setting = new MeetingModuleSetting();
      expect(setting).toBeInstanceOf(MeetingModuleSetting);
      expect(setting.id()).toEqual(SettingModuleIds.MeetingSetting.id);
      expect(setting['_weight']).toEqual(
        SettingModuleIds.MeetingSetting.weight,
      );
    });
  });
});
