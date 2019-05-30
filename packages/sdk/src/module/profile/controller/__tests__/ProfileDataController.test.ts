/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-15 09:26:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ProfileDataController } from '../ProfileDataController';
import { Profile } from '../../entity';
import { MockEntitySourceController } from './MockEntitySourceController';
import { ServiceLoader } from '../../../serviceLoader';

jest.mock('../../../../api/glip/profile');
jest.mock('../../../../framework/controller/interface/IEntitySourceController');

function clearMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

describe('ProfileDataController', () => {
  let profileDataController: ProfileDataController;
  let mockEntitySourceController: MockEntitySourceController;

  beforeEach(() => {
    mockEntitySourceController = new MockEntitySourceController();
    profileDataController = new ProfileDataController(
      mockEntitySourceController,
    );
  });

  afterEach(() => {
    clearMocks();
  });

  describe('getProfile()', () => {
    it('should return current user profile', async () => {
      jest
        .spyOn(profileDataController, 'getCurrentProfileId')
        .mockReturnValue(2);
      jest
        .spyOn(mockEntitySourceController, 'get')
        .mockImplementationOnce(id => id);

      const result = await profileDataController.getProfile();
      expect(result).toEqual(2);
    });
  });

  describe('isConversationHidden()', () => {
    it('should return false because of not profile', async () => {
      profileDataController.getProfile = jest
        .fn()
        .mockImplementationOnce(() => undefined);
      const result = await profileDataController.isConversationHidden(2);
      expect(result).toBeFalsy();
    });

    it('should return 5 because of  hide_group_1 in profile is 5', async () => {
      profileDataController.getProfile = jest
        .fn()
        .mockImplementationOnce(() => {
          return {
            hide_group_1: 5,
          };
        });
      const result = await profileDataController.isConversationHidden(1);
      expect(result).toBe(5);
    });
  });

  describe('profileHandleData()', () => {
    it('should return null because of not profile', async () => {
      const data = undefined;
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toBeNull();
    });

    it('should return {id: 2} because of profile is not an array', async () => {
      const data = {
        id: 2,
      };
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toEqual({ id: 2 });
    });

    it('should return {id: 2} because of profile is an array', async () => {
      const data = [
        {
          id: 2,
        },
      ];
      jest
        .spyOn(profileDataController, '_handleProfile')
        .mockImplementationOnce(profile => profile);

      const result = await profileDataController.profileHandleData(
        data as Profile,
      );
      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getDefaultCaller', () => {
    const profile = {
      id: 111,
      default_number: 1,
    };
    let rcInfoService: any;
    beforeEach(() => {
      clearMocks();
      rcInfoService = {
        getCallerById: jest.fn().mockResolvedValue({ id: 1, phoneNumber: '1' }),
        getFirstDidCaller: jest
          .fn()
          .mockResolvedValue({ id: 2, phoneNumber: '2' }),
      };
      ServiceLoader.getInstance = jest.fn().mockReturnValue(rcInfoService);
      profileDataController.getProfile = jest.fn().mockResolvedValue(profile);
    });

    it('should return default caller id when has set in profile', async () => {
      const res = await profileDataController.getDefaultCaller();
      expect(rcInfoService.getCallerById).toBeCalledWith(
        profile.default_number,
      );
      expect(res).toEqual({ id: 1, phoneNumber: '1' });
    });

    it('should return first did when has not set in profile', async () => {
      rcInfoService.getCallerById = jest.fn().mockResolvedValue(undefined);
      const res = await profileDataController.getDefaultCaller();
      expect(res).toEqual({ id: 2, phoneNumber: '2' });
    });
  });
});
