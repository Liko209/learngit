/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from '../../../rcInfo';
import { ENTITY } from '../../../../service';
import { ServiceConfig, ServiceLoader } from '../../../serviceLoader';
import { ProfileService } from '../../service/ProfileService';
import notificationCenter from '../../../../service/notificationCenter';
import { SettingModuleIds } from '../../../setting/constants';
import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AccountService } from 'sdk/module/account';
import { CallerIdSettingHandler } from '../handlers/MicrophoneSourceSettingHandler';
import { SettingEntityIds, UserSettingEntity } from 'sdk/module/setting';

jest.mock('sdk/module/account/config/AccountUserConfig');
jest.mock('../../service/ProfileService');
jest.mock('../../../rcInfo');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallerIdSettingHandler ', () => {
  let iProfileService: ProfileService;
  let rcInfoService: RCInfoService;
  const profileId = 111;
  let callerIdSettingHandler: CallerIdSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingModuleIds.CallerIdSetting.id,
      parentModelId: SettingModuleIds.PhoneSetting_General.id,
      source: [{ id: 1 }, { id: 2 }],
      state: 0,
      value: { id: 2 },
      valueSetter: expect.any(Function),
      valueType: 4,
      weight: SettingModuleIds.CallerIdSetting.weight,
    };
    rcInfoService = new RCInfoService();
    const accountService = new AccountService({} as any);
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.RC_INFO_SERVICE) {
        return rcInfoService;
      }
      if (key === ServiceConfig.ACCOUNT_SERVICE) {
        return accountService;
      }
    });
    iProfileService = new ProfileService();
    rcInfoService.getCallerIdList = jest
      .fn()
      .mockResolvedValue([{ id: 1 }, { id: 2 }]);
    iProfileService.getDefaultCaller = jest.fn().mockResolvedValue({ id: 2 });
    iProfileService.updateSettingOptions = jest.fn();
    AccountUserConfig.prototype.getCurrentUserProfileId.mockReturnValue(
      profileId,
    );
    callerIdSettingHandler = new CallerIdSettingHandler(iProfileService);
    callerIdSettingHandler.notifyUserSettingEntityUpdate = jest.fn();
  }

  function cleanUp() {
    callerIdSettingHandler.dispose();
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  afterEach(() => {
    cleanUp();
  });

  describe('handleProfileUpdated()', () => {
    afterEach(() => {
      cleanUp();
    });
    it('should emit update when has default default phone number in cache and comes new number', (done: jest.DoneCallback) => {
      callerIdSettingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      callerIdSettingHandler.getUserSettingEntity = jest
        .fn()
        .mockResolvedValue({});

      notificationCenter.emitEntityUpdate(ENTITY.PROFILE, [
        {
          id: profileId,
          default_number: { id: 888, phoneNumber: '123' },
        },
      ]);
      setTimeout(() => {
        expect(callerIdSettingHandler.getUserSettingEntity).toBeCalled();
        expect(
          callerIdSettingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });
    it('should not emit when can not get profile from payload', (done: jest.DoneCallback) => {
      callerIdSettingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      callerIdSettingHandler.getUserSettingEntity = jest
        .fn()
        .mockResolvedValue({});

      notificationCenter.emitEntityUpdate(ENTITY.PROFILE, []);
      setTimeout(() => {
        expect(callerIdSettingHandler.getUserSettingEntity).not.toBeCalled();
        expect(
          callerIdSettingHandler.notifyUserSettingEntityUpdate,
        ).not.toBeCalled();
        done();
      });
    });
    it('should not emit when has no cache', (done: jest.DoneCallback) => {
      callerIdSettingHandler.getUserSettingEntity = jest
        .fn()
        .mockResolvedValue({});

      notificationCenter.emitEntityUpdate(ENTITY.PROFILE, [
        {
          id: profileId,
          default_number: { id: 888, phoneNumber: '123' },
        },
      ]);
      setTimeout(() => {
        expect(callerIdSettingHandler.getUserSettingEntity).not.toBeCalled();
        expect(
          callerIdSettingHandler.notifyUserSettingEntityUpdate,
        ).not.toBeCalled();
        done();
      });
    });
  });

  describe('fetchUserSettingEntity()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });
    it('should return all setting entity', async () => {
      const res = await callerIdSettingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_CallerId,
        parentModelId: SettingModuleIds.PhoneSetting_General.id,
        source: [{ id: 1 }, { id: 2 }],
        state: 0,
        value: { id: 2 },
        valueSetter: expect.any(Function),
        valueType: 4,
        weight: SettingModuleIds.CallerIdSetting.weight,
      });
    });
  });

  describe('updateValue()', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    afterEach(() => {
      cleanUp();
    });

    it('should call profileService.updateSettingOptions', async () => {
      await callerIdSettingHandler.updateValue({
        id: 111,
      } as any);
      expect(iProfileService.updateSettingOptions).toBeCalledWith([
        {
          key: 'default_number',
          value: 111,
        },
      ]);
    });
  });
});
