/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-26 21:33:16
 * Copyright © RingCentral. All rights reserved.
 */
import GroupModel from '../Group';
import { Group } from 'sdk/models';
import { UserConfig } from 'sdk/service/account/UserConfig';
import { PERMISSION_ENUM } from 'sdk/service';
jest.mock('sdk/api');
jest.mock('sdk/service/account/UserConfig');

jest.mock('sdk/api');

describe('GroupModel', () => {
  const mockUserId = 1;
  const mockUserCompanyId = 11;
  beforeEach(() => {
    jest.resetAllMocks();
    UserConfig.getCurrentUserId = jest
      .fn()
      .mockImplementation(() => mockUserId);
    UserConfig.getCurrentCompanyId = jest
      .fn()
      .mockImplementation(() => mockUserCompanyId);
  });
  describe('isThePersonGuest()', () => {
    it('should return result base on whether person company is in guest_user_company_ids', () => {
      const personA = { id: 10, company_id: 1 };
      const personB = { id: 10, company_id: 4 };
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId],
      } as Group);
      expect(gm.isThePersonGuest(personA.company_id)).toBeTruthy;
      expect(gm.isThePersonGuest(personB.company_id)).toBeFalsy;
    });
  });
  describe('canPost', () => {
    it('should return false when user is guest||user and user permission setting disabled TEAM_POST', () => {
      const gmGuest = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [mockUserCompanyId], // guest
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: 0,
          },
        },
      } as Group);
      expect(gmGuest.canPost).toBeFalsy();
      // normal user
      const gmUser = GroupModel.fromJS({
        id: 1,
        is_team: true,
        guest_user_company_ids: [],
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: 0,
          },
        },
      } as Group);
      expect(gmUser.canPost).toBeFalsy();
    });
    it('should return true when user is guest||user and user permission setting enabled TEAM_POST', () => {
      const gmGuest = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [mockUserCompanyId], // guest
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmGuest.canPost).toBeTruthy();
      // normal user
      const gmUser = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [],
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [2],
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmUser.canPost).toBeTruthy();
    });
    it('should return true when user is admin', () => {
      const gmAdmin = GroupModel.fromJS({
        id: 1,
        guest_user_company_ids: [],
        is_team: true,
        members: [mockUserId],
        permissions: {
          admin: {
            uids: [mockUserId], // admin
          },
          user: {
            level: PERMISSION_ENUM.TEAM_POST,
          },
        },
      } as Group);
      expect(gmAdmin.canPost).toBeTruthy();
    });
  });
  describe('isAdmin', () => {
    it('should return true when user is in admin.uids', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [mockUserId],
          },
        },
      } as Group);
      // gm.isAdmin;
      expect(gm.isAdmin).toBeTruthy();
    });
    it('should return false when user is not in admin.uids', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [333],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeFalsy();
    });
    it('should return false when admin.uids not exist and user is guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [mockUserCompanyId],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeFalsy();
    });
    it('should return true when admin.uids not exist and user is not guest', () => {
      const gm = GroupModel.fromJS({
        id: 1,
        members: [mockUserId],
        guest_user_company_ids: [],
        is_team: true,
        permissions: {
          admin: {
            uids: [],
          },
        },
      } as Group);
      expect(gm.isAdmin).toBeTruthy();
    });
  });
});
