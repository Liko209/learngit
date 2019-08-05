/*
 * @Author: Paynter Chen
 * @Date: 2019-05-26 21:42:27
 * Copyright © RingCentral. All rights reserved.
 */

import { AccountUserConfig } from 'sdk/module/account/config/AccountUserConfig';
import { AccountService } from 'sdk/module/account';
import { CallerIdSettingHandler } from '../CallerIdSettingHandler';
import {
  SettingEntityIds,
  UserSettingEntity,
  SettingService,
} from 'sdk/module/setting';
import { RCInfoService } from 'sdk/module/rcInfo';
import { notificationCenter, ENTITY } from 'sdk/service';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { CALLING_OPTIONS } from 'sdk/module/profile/constants';

jest.mock('sdk/module/account/config/AccountUserConfig');
jest.mock('sdk/module/profile');
jest.mock('sdk/module/rcInfo');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('CallerIdSettingHandler ', () => {
  let rcInfoService: RCInfoService;
  let settingService: SettingService;
  const profileId = 111;
  let callerIdSettingHandler: CallerIdSettingHandler;
  let mockDefaultSettingItem: UserSettingEntity;
  function setUp() {
    jest.spyOn(notificationCenter, 'on');
    jest.spyOn(notificationCenter, 'off');
    jest.spyOn(notificationCenter, 'emitEntityUpdate');
    mockDefaultSettingItem = {
      id: SettingEntityIds.Phone_CallerId,
      source: [{ id: 1 }, { id: 2 }],
      state: 0,
      value: { id: 2 },
      valueSetter: expect.any(Function),
    };
    rcInfoService = new RCInfoService();
    settingService = new SettingService();
    const accountService = new AccountService({} as any);
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.RC_INFO_SERVICE) {
        return rcInfoService;
      }
      if (key === ServiceConfig.ACCOUNT_SERVICE) {
        return accountService;
      }
      if (key === ServiceConfig.SETTING_SERVICE) {
        return settingService;
      }
    });
    rcInfoService.getCallerIdList = jest
      .fn()
      .mockResolvedValue([{ id: 1 }, { id: 2 }]);
    rcInfoService.DBConfig = {
      on: jest.fn(),
      off: jest.fn(),
    };
    rcInfoService.getDefaultCallerId = jest.fn().mockResolvedValue({ id: 2 });
    AccountUserConfig.prototype.getCurrentUserProfileId.mockReturnValue(
      profileId,
    );
    callerIdSettingHandler = new CallerIdSettingHandler();
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
      settingService.getById = jest
        .fn()
        .mockReturnValue({ value: CALLING_OPTIONS.RINGCENTRAL });
      const res = await callerIdSettingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        state: 2,
        id: SettingEntityIds.Phone_CallerId,
        source: [{ id: 1 }, { id: 2 }],
        value: { id: 2 },
        valueSetter: expect.any(Function),
      });
    });

    it('should return all setting entity when callOption is undefined', async () => {
      settingService.getById = jest.fn().mockReturnValue({ value: undefined });
      const res = await callerIdSettingHandler.fetchUserSettingEntity();
      expect(res).toEqual({
        id: SettingEntityIds.Phone_CallerId,
        source: [{ id: 1 }, { id: 2 }],
        state: 0,
        value: { id: 2 },
        valueSetter: expect.any(Function),
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
      expect(rcInfoService.setDefaultCallerId).toHaveBeenCalledWith(111);
    });
  });

  describe('handleSettingModelUpdated', () => {
    it('should emit update when has subscribe update and Phone_DefaultApp change', (done: jest.DoneCallback) => {
      callerIdSettingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      callerIdSettingHandler.getUserSettingEntity = jest
        .fn()
        .mockResolvedValue({});
      notificationCenter.emitEntityUpdate<UserSettingEntity>(
        ENTITY.USER_SETTING,
        [
          {
            id: SettingEntityIds.Phone_DefaultApp,
            value: true,
          } as UserSettingEntity,
        ],
      );
      setTimeout(() => {
        expect(callerIdSettingHandler.getUserSettingEntity).toHaveBeenCalled();
        expect(
          callerIdSettingHandler.notifyUserSettingEntityUpdate,
        ).toHaveBeenCalledWith({});
        done();
      });
    });

    it('should not emit update when no change', (done: jest.DoneCallback) => {
      callerIdSettingHandler['userSettingEntityCache'] = mockDefaultSettingItem;
      callerIdSettingHandler.getUserSettingEntity = jest
        .fn()
        .mockResolvedValue({});
      notificationCenter.emitEntityUpdate<UserSettingEntity>(
        ENTITY.USER_SETTING,
        [],
      );
      setTimeout(() => {
        expect(
          callerIdSettingHandler.getUserSettingEntity,
        ).not.toHaveBeenCalled();
        expect(
          callerIdSettingHandler.notifyUserSettingEntityUpdate,
        ).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
