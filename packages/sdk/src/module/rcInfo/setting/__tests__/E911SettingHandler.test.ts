/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-24 08:41:27
 * Copyright © RingCentral. All rights reserved.
 */
import { E911SettingHandler } from '../E911SettingHandler';
import { ITelephonyService } from '../../../telephony';
import { ESettingValueType, SettingEntityIds } from '../../../setting';
import { SettingModuleIds } from '../../../setting/constants';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { ServiceLoader } from 'sdk/module/serviceLoader';

describe('E911SettingHandler', () => {
  let settingHandler: E911SettingHandler;
  let telephonyService: ITelephonyService;

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  function setUp() {
    clearMocks();
    telephonyService = {
      getEmergencyAddress: () => {},
    } as any;
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        return telephonyService;
      });
    settingHandler = new E911SettingHandler();
  }

  function cleanUp() {
    // settingHandler.dispose();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('fetchUserSettingEntity', () => {
    it('should return emergency address', async () => {
      // const emergencyAddr = {
      //   country: 'US',
      //   countryId: '1',
      // };
      // telephonyService.getEmergencyAddress = jest
      //   .fn()
      //   .mockReturnValue(emergencyAddr);
      // const res = await settingHandler.fetchUserSettingEntity();
      // expect(res).toEqual({
      //   id: SettingEntityIds.Phone_E911,
      //   weight: SettingModuleIds.ExtensionSetting.weight,
      //   valueType: ESettingValueType.LINK,
      //   parentModelId: SettingModuleIds.PhoneSetting_General.id,
      //   state: ESettingItemState.ENABLE,
      //   value: emergencyAddr,
      // });
    });
  });
});
