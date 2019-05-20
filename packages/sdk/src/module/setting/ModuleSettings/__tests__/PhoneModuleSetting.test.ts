/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-06 14:41:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ESettingItemState } from 'sdk/framework/model/setting';
import { PhoneModuleSetting } from '../PhoneModuleSetting';
import { SettingModuleIds } from '../../constants';
import { ESettingValueType, ModuleSettingTypes } from '../../entity';
import { ServiceLoader } from '../../../serviceLoader';
import { notificationCenter } from 'sdk/service';

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('PhoneModuleSetting', () => {
  let phoneModuleSetting: PhoneModuleSetting;

  function setUp() {
    phoneModuleSetting = new PhoneModuleSetting();
  }
  beforeEach(() => {
    clearMocks();
  });

  describe('getSections', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return sections of PhoneModuleSetting', () => {
      const res = phoneModuleSetting.getSections();
      expect(res).toEqual([
        {
          id: SettingModuleIds.PhoneSetting_General.id,
          weight: SettingModuleIds.PhoneSetting_General.weight,
          state: ESettingItemState.ENABLE,
          parentModelId: SettingModuleIds.PhoneSetting.id,
          valueType: ESettingValueType.SECTION,
        },
        {
          id: SettingModuleIds.PhoneSetting_AudioSource.id,
          weight: SettingModuleIds.PhoneSetting_AudioSource.weight,
          state: ESettingItemState.ENABLE,
          parentModelId: SettingModuleIds.PhoneSetting.id,
          valueType: ESettingValueType.SECTION,
        },
      ]);
    });
  });

  describe('buildSettingItem', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return expected entity', async () => {
      ServiceLoader.getInstance = jest.fn().mockReturnValue({
        isRCFeaturePermissionEnabled: jest.fn().mockResolvedValue(true),
      });

      const res = await phoneModuleSetting.buildSettingItem();
      expect(res).toEqual({
        state: ESettingItemState.ENABLE,
        id: SettingModuleIds.PhoneSetting.id,
        value: ModuleSettingTypes.PHONE,
        weight: SettingModuleIds.PhoneSetting.weight,
        valueType: ESettingValueType.SECTION,
      });
    });
  });

  describe('dispose', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      notificationCenter.off = jest.fn();
    });

    it('should off notification when dispose', () => {
      phoneModuleSetting.dispose();
      expect(notificationCenter.off).toHaveBeenCalled();
    });
  });

  describe('id', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return id of phone setting module', () => {
      expect(phoneModuleSetting.id()).toEqual(SettingModuleIds.PhoneSetting.id);
    });
  });
});
