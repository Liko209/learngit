/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:42:08
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseModuleSetting } from '../BaseModuleSetting';
import { ESettingItemState } from '../../../../framework/model/setting';
import { ESettingValueType } from '../../entity';

describe('BaseModuleSetting', () => {
  let baseModuleSetting: BaseModuleSetting;
  beforeEach(() => {
    baseModuleSetting = new BaseModuleSetting(1, 2, 3);
  });

  describe('constructor', () => {
    it('should return CalendarModuleSetting', () => {
      const setting = new BaseModuleSetting(1, 2, 3);
      expect(setting).toBeInstanceOf(BaseModuleSetting);
      expect(setting.id()).toEqual(1);
      expect(setting['_weight']).toEqual(2);
    });
  });

  describe('getSections', () => {
    it('should return empty section by default', () => {
      expect(baseModuleSetting.getSections()).toEqual([]);
    });
  });

  describe('buildSettingItem', () => {
    it('should return default entity', () => {
      expect(baseModuleSetting.buildSettingItem()).toEqual({
        id: 1,
        state: ESettingItemState.ENABLE,
        value: 3,
        valueType: ESettingValueType.SECTION,
        weight: 2,
      });
    });
  });
});
