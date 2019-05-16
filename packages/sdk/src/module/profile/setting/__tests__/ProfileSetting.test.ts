/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-09 20:05:55
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoService } from '../../../rcInfo';
import { ENTITY } from '../../../../service';
import { ServiceConfig, ServiceLoader } from '../../../serviceLoader';
import { ProfileSetting } from '../ProfileSetting';
import { ProfileService } from '../../service/ProfileService';
import notificationCenter from '../../../../service/notificationCenter';
import { SettingModuleIds } from '../../../setting/constants';
import { AccountUserConfig } from 'sdk/module/account/config';

jest.mock('sdk/module/account/config');
jest.mock('../../../../service/notificationCenter');
jest.mock('../../service/ProfileService');
jest.mock('../../../rcInfo');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ProfileSetting ', () => {
  let profileSetting: ProfileSetting;
  let iProfileService: ProfileService;
  let rcInfoService: RCInfoService;
  const profileId = 111;
  function setUp() {
    rcInfoService = new RCInfoService();
    iProfileService = new ProfileService();
    profileSetting = new ProfileSetting(iProfileService);
    ServiceLoader.getInstance = jest.fn().mockImplementation((key: any) => {
      if (key === ServiceConfig.RC_INFO_SERVICE) {
        return rcInfoService;
      }
    });
    rcInfoService.getCallerIdList = jest
      .fn()
      .mockResolvedValue([{ id: 1 }, { id: 2 }]);
    iProfileService.getDefaultCaller = jest.fn().mockResolvedValue({ id: 2 });
    iProfileService.updateSettingOptions = jest.fn();
    AccountUserConfig.prototype.getCurrentUserProfileId.mockReturnValue(
      profileId,
    );
  }

  beforeEach(() => {
    clearMocks();
    setUp();
  });

  describe('handleProfileUpdated', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
      profileSetting['_glipProfileId'] = profileId;

      profileSetting['_lastNumberSetting'] = {
        id: 404,
        value: { id: 999, phoneNumber: '123' } as any,
      };
    });

    it('should emit update when has default default phone number in cache and comes new number', async () => {
      notificationCenter.emitEntityUpdate = jest.fn();
      const newProfilePayload = {
        type: 'update',
        body: {
          entities: new Map([
            [
              profileId,
              {
                id: profileId,
                default_number: { id: 888, phoneNumber: '123' },
              } as any,
            ],
          ]),
        },
      } as any;

      await profileSetting.handleProfileUpdated(newProfilePayload);
      expect(notificationCenter.emitEntityUpdate).toHaveBeenCalledWith(
        ENTITY.USER_SETTING,
        [
          {
            id: SettingModuleIds.CallerIdSetting.id,
            parentModelId: SettingModuleIds.PhoneSetting_General.id,
            source: [{ id: 1 }, { id: 2 }],
            state: 0,
            value: { id: 2 },
            valueSetter: expect.any(Function),
            valueType: 4,
            weight: SettingModuleIds.CallerIdSetting.weight,
          },
        ],
      );
    });

    it('should not emit when can not get profile from payload', async () => {
      notificationCenter.emitEntityUpdate = jest.fn();
      const newProfilePayload = {
        type: 'update',
        body: {
          entities: new Map(),
        },
      } as any;
      await profileSetting.handleProfileUpdated(newProfilePayload);
      expect(notificationCenter.emitEntityUpdate).not.toBeCalled();
    });

    it('should not emit when has no last number', async () => {
      notificationCenter.emitEntityUpdate = jest.fn();
      const newProfilePayload = {
        type: 'update',
        body: {
          entities: new Map([
            [
              profileId,
              {
                id: profileId,
                default_number: { id: 888, phoneNumber: '123' },
              } as any,
            ],
          ]),
        },
      } as any;

      profileSetting['_lastNumberSetting'] = undefined;

      await profileSetting.handleProfileUpdated(newProfilePayload);
      expect(notificationCenter.emitEntityUpdate).not.toBeCalled();
    });
  });

  describe('getSettingsByParentId', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all setting entities', async () => {
      const res = await profileSetting.getSettingsByParentId(
        SettingModuleIds.PhoneSetting_General.id,
      );
      expect(res).toEqual([
        {
          id: SettingModuleIds.CallerIdSetting.id,
          parentModelId: SettingModuleIds.PhoneSetting_General.id,
          source: [{ id: 1 }, { id: 2 }],
          state: 0,
          value: { id: 2 },
          valueSetter: expect.any(Function),
          valueType: 4,
          weight: SettingModuleIds.CallerIdSetting.weight,
        },
      ]);
      await res[0].valueSetter({ id: 111 });
      expect(iProfileService.updateSettingOptions).toBeCalledWith([
        {
          key: 'default_number',
          value: 111,
        },
      ]);
    });
  });

  describe('getSettingById', () => {
    beforeEach(() => {
      clearMocks();
      setUp();
    });

    it('should return all setting entities', async () => {
      const res = await profileSetting.getSettingById(
        SettingModuleIds.CallerIdSetting.id,
      );
      expect(res).toEqual({
        id: SettingModuleIds.CallerIdSetting.id,
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
});
