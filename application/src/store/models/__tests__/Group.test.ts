/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:33:16
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '../Group';
import { Group } from 'sdk/models';
import * as utils from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { NewGroupService } from 'sdk/module/group';

jest.mock('sdk/module/group');
const groupService = new NewGroupService();

describe('GroupModel', () => {
  describe('isThePersonGuest()', () => {
    it('should return result base on whether person company is in guest_user_company_ids', () => {
      const personA = { id: 10, company_id: 1 };
      const personB = { id: 10, company_id: 4 };
      const gm = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [1, 2, 3],
      } as Group);
      expect(gm.isThePersonGuest(personA.company_id)).toBeTruthy;
      expect(gm.isThePersonGuest(personB.company_id)).toBeFalsy;
    });
  });
  describe('canPost', () => {
    it('should return true when the group is not term', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: false,
      } as Group);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is admin', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(true);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions is undefined', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: undefined,
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user is undefined', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: undefined,
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user.level is 0', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: {
            level: 0,
          },
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeFalsy();
    });
    it('should return true when the group is term and current user is not admin and permissions.user.level is 13', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        is_team: true,
        permissions: {
          user: {
            level: 13,
          },
        },
      } as Group);
      gm.isThePersonAdmin = jest.fn().mockReturnValue(false);
      expect(gm.canPost).toBeTruthy();
    });
  });

  describe('isMember', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'getGlobalValue').mockImplementationOnce((key: any) => {
        if (key === GLOBAL_KEYS.CURRENT_USER_ID) {
          return 123;
        }
        return null;
      });
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should return true if currentUserId is in the members array', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [123, 3, 11, 654],
      } as Group);

      expect(gm.isMember).toBe(true);
    });

    it('should return false if currentUserId is not in the members array', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [3, 11, 654],
      } as Group);

      expect(gm.isMember).toBe(false);
    });
  });

  describe('isCurrentUserHasPermissionAddMember', () => {
    beforeEach(() => {
      NewGroupService.getInstance = jest.fn().mockReturnValue(groupService);
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });
    it('should return false if current user is not a member', () => {
      const gm = GroupModel.fromJS({
        id: 1,
      } as Group);
      groupService.isCurrentUserHasPermission.mockImplementationOnce(() => {});
      jest.spyOn(gm, 'isMember', 'get').mockReturnValueOnce(false);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(false);
      expect(groupService.isCurrentUserHasPermission).not.toHaveBeenCalled();
    });
    it('should return the value from service method', () => {
      const gm = GroupModel.fromJS({
        id: 1,
      } as Group);
      jest.spyOn(gm, 'isMember', 'get').mockReturnValueOnce(true);
      jest
        .spyOn(groupService, 'isCurrentUserHasPermission')
        .mockReturnValueOnce(true);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(true);
      expect(groupService.isCurrentUserHasPermission).toHaveBeenCalled();
    });
    it('should return the value from service method', () => {
      const gm = GroupModel.fromJS({
        id: 1,
      } as Group);
      jest.spyOn(gm, 'isMember', 'get').mockReturnValueOnce(true);
      groupService.isCurrentUserHasPermission.mockReturnValueOnce(false);
      expect(gm.isCurrentUserHasPermissionAddMember).toBe(false);
      expect(groupService.isCurrentUserHasPermission).toHaveBeenCalled();
    });
  });
});
