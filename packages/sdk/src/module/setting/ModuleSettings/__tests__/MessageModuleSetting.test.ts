/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { MessageModuleSetting } from '../MessageModuleSetting';
import { SettingModuleIds } from '../../constants';

describe('MessageModuleSetting', () => {
  describe('constructor', () => {
    it('should return MessageModuleSetting', () => {
      const setting = new MessageModuleSetting();
      expect(setting).toBeInstanceOf(MessageModuleSetting);
      expect(setting.id()).toEqual(SettingModuleIds.MessageSetting.id);
      expect(setting['_weight']).toEqual(
        SettingModuleIds.MessageSetting.weight,
      );
    });
  });
});
