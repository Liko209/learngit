/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-07-24 08:41:27
 * Copyright © RingCentral. All rights reserved.
 */
import { E911SettingHandler } from '../E911SettingHandler';
import { TelephonyService } from '../../../telephony';
import { SettingEntityIds } from '../../../setting';
import { ESettingItemState } from 'sdk/framework/model/setting';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { RCInfoService } from '../../service';
import { TelephonyGlobalConfig } from 'sdk/module/telephony/config/TelephonyGlobalConfig';
import { notificationCenter } from 'sdk/service';

describe('E911SettingHandler', () => {
  let settingHandler: E911SettingHandler;
  let telephonyService: TelephonyService;
  let rcInfoService: RCInfoService;
  const emergencyAddr = {
    country: 'US',
    countryId: '1',
  };

  function clearMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }

  function setUp() {
    clearMocks();
    telephonyService = {
      subscribeEmergencyAddressChange: jest.fn(),
      subscribeSipProvChange: jest.fn(),
      subscribeSipProvEAUpdated: jest.fn(),
      subscribeSipProvReceived: jest.fn(),
      updateLocalEmergencyAddress: jest.fn(),
      setLocalEmergencyAddress: jest.fn(),
      isAddressEqual: jest.fn(),
    } as any;
    rcInfoService = {} as any;
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        switch (config) {
          case ServiceConfig.RC_INFO_SERVICE:
            return rcInfoService;
          case ServiceConfig.TELEPHONY_SERVICE:
            return telephonyService;
          default:
            return {};
        }
      });
    settingHandler = new E911SettingHandler();
  }

  function cleanUp() {
    settingHandler.dispose();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('updateValue', () => {
    it('should update line if line has been assigned', async () => {
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(null);
      rcInfoService.updateLine = jest.fn();
      telephonyService.getWebPhoneId = jest.fn().mockReturnValue(1);
      TelephonyGlobalConfig.setEmergencyAddress = jest.fn();
      await settingHandler.updateValue(emergencyAddr);
      expect(rcInfoService.updateLine).toHaveBeenCalledWith(1, {
        emergencyServiceAddress: emergencyAddr,
      });
      expect(telephonyService.updateLocalEmergencyAddress).toHaveBeenCalledWith(
        emergencyAddr,
      );
    });
    it('should assign line if no assigned line', async () => {
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(undefined);
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(null);
      rcInfoService.assignLine = jest.fn();
      telephonyService.getWebPhoneId = jest.fn().mockReturnValue(1);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([{ id: 2 }]);
      TelephonyGlobalConfig.setEmergencyAddress = jest.fn();
      await settingHandler.updateValue(emergencyAddr);
      expect(rcInfoService.assignLine).toHaveBeenCalledWith(1, {
        emergencyServiceAddress: emergencyAddr,
        originalDeviceId: 2,
      });
      expect(telephonyService.setLocalEmergencyAddress).toHaveBeenCalledWith(
        emergencyAddr,
      );
    });
  });

  describe('_getDefaultEmergencyAddress', () => {
    it('should return local address if it is same as remote address', async () => {
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.isAddressEqual = jest.fn().mockReturnValue(true);
      const res = await settingHandler._getDefaultEmergencyAddress();
      expect(res).toBe(emergencyAddr);
    });

    it('should return remote address if local address is not same as remote address', async () => {
      const remoteAddr = { test: 'test' };
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(remoteAddr);
      telephonyService.isAddressEqual = jest.fn().mockReturnValue(false);
      const res = await settingHandler._getDefaultEmergencyAddress();
      expect(res).toBe(remoteAddr);
    });

    it('should return address from first digital line', async () => {
      telephonyService.getLocalEmergencyAddress = jest.fn();
      rcInfoService.getDigitalLines = jest
        .fn()
        .mockReturnValue([{ emergencyServiceAddress: emergencyAddr }, {}]);
      const res = await settingHandler._getDefaultEmergencyAddress();
      expect(res).toBe(emergencyAddr);
    });
  });

  describe('_e911Updated', () => {
    beforeEach(() => {
      Object.assign(settingHandler, {
        _isSipReady: true,
      });
    });
    it('should emit when condition met', async () => {
      const spy = jest.spyOn(notificationCenter, 'emit');
      telephonyService.isEmergencyAddrConfirmed = jest
        .fn()
        .mockReturnValue(false);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([1]);
      await settingHandler._e911Updated();
      expect(spy).toHaveBeenCalled();
    });
    it('should not emit when no dl', async () => {
      const spy = jest.spyOn(notificationCenter, 'emit');
      telephonyService.isEmergencyAddrConfirmed = jest
        .fn()
        .mockReturnValue(false);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([]);
      await settingHandler._e911Updated();
      expect(spy).not.toHaveBeenCalled();
    });
    it('should not emit when it is confirmed', async () => {
      const spy = jest.spyOn(notificationCenter, 'emit');
      telephonyService.isEmergencyAddrConfirmed = jest
        .fn()
        .mockReturnValue(true);
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue([1]);
      await settingHandler._e911Updated();
      expect(spy).not.toHaveBeenCalled();
    });
    it('should not emit when sip is not ready', async () => {
      Object.assign(settingHandler, {
        _isSipReady: false,
      });
      rcInfoService.getDigitalLines = jest.fn();
      await settingHandler._e911Updated();
      expect(rcInfoService.getDigitalLines).not.toHaveBeenCalled();
    });
  });

  describe('fetchUserSettingEntity', () => {
    const dl = [];
    beforeEach(() => {
      rcInfoService.getDigitalLines = jest.fn().mockReturnValue(dl);
    });
    it('should return emergency address [JPT-2697]', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockReturnValue(true);
      rcInfoService.isRCFeaturePermissionEnabled = jest
        .fn()
        .mockReturnValue(true);
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      dl.length = 0;
      dl.push(1);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_E911,
        state: ESettingItemState.ENABLE,
        value: emergencyAddr,
        valueSetter: expect.any(Function),
      });
    });

    it('should hide config when no calling permission', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockReturnValue(false);
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_E911,
        state: ESettingItemState.INVISIBLE,
        value: emergencyAddr,
        valueSetter: expect.any(Function),
      });
    });

    it('should hide config item when no assigned line ', async () => {
      rcInfoService.isVoipCallingAvailable = jest.fn().mockReturnValue(false);
      telephonyService.getRemoteEmergencyAddress = jest
        .fn()
        .mockReturnValue(undefined);
      telephonyService.getLocalEmergencyAddress = jest
        .fn()
        .mockReturnValue(emergencyAddr);
      const res = await settingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_E911,
        state: ESettingItemState.INVISIBLE,
        value: emergencyAddr,
        valueSetter: expect.any(Function),
      });
    });
  });
});
