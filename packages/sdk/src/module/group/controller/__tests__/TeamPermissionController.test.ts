/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:30:55
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamPermissionController } from '../TeamPermissionController';
import { TeamPermission, TeamPermissionParams } from '../../entity';
import { groupFactory } from './factory';
import { daoManager } from '../../../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../../dao/account/constants';
import {
  PERMISSION_ENUM,
  DEFAULT_USER_PERMISSION_LEVEL,
} from '../../constants';

describe('TeamPermissionController', () => {
  let teamPermissionController: TeamPermissionController;
  beforeEach(() => {
    jest.clearAllMocks();
    teamPermissionController = new TeamPermissionController();
  });

  describe('isCurrentUserGuest()', () => {
    beforeAll(() => {
      const mockGetAccountInfo = jest.fn((key: string) => {
        const accountInfo = {
          [ACCOUNT_USER_ID]: 5683,
          [ACCOUNT_COMPANY_ID]: 55668833,
        };
        return accountInfo[key];
      });
      daoManager.getKVDao = jest.fn().mockReturnValue({
        get: mockGetAccountInfo,
      });
    });
    it('should return false when guestUserCompanyIds is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds is empty', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        guest_user_company_ids: [],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds does not include current user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        guest_user_company_ids: [123456],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds includes current user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        guest_user_company_ids: [55668833],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeTruthy();
    });
  });

  describe('isSelfGroup()', () => {
    it('should return false when members is empty', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
      };
      expect(
        teamPermissionController.isSelfGroup(teamPermissionParams, 5683),
      ).toBeFalsy();
    });
    it('should return false when members more user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [123, 555],
      };
      expect(
        teamPermissionController.isSelfGroup(teamPermissionParams, 5683),
      ).toBeFalsy();
    });
    it('should return false when member only contain one user and is not me', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [1234],
      };
      expect(
        teamPermissionController.isSelfGroup(teamPermissionParams, 5683),
      ).toBeFalsy();
    });
    it('should return true when member only contain myself', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [5683],
      };
      expect(
        teamPermissionController.isSelfGroup(teamPermissionParams, 5683),
      ).toBeTruthy();
    });
  });

  describe('getCurrentUserPermissionLevel()', () => {
    beforeAll(() => {
      const mockGetAccountInfo = jest.fn((key: string) => {
        const accountInfo = {
          [ACCOUNT_USER_ID]: 5683,
          [ACCOUNT_COMPANY_ID]: 55668833,
        };
        return accountInfo[key];
      });
      daoManager.getKVDao = jest.fn().mockReturnValue({
        get: mockGetAccountInfo,
      });
    });
    it('should return self group permission level', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: false,
        members: [5683],
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(29);
    });
    it('should return common group permission level', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: false,
        members: [540, 524],
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(15);
    });
    it('should return team permission level when permissions is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(31);
    });
    it('should return team permission level when admin permissions is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          user: { uids: [] },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(31);
    });
    it('should return team permission level when admin uids is empty and level is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [] },
          user: { uids: [] },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(31);
    });
    it('should return team permission level when admin uids is empty and level is defined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [], level: 63 },
          user: { uids: [] },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(63);
    });
    it('should return team permission level when admin uids includes current user and level is defined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [5683], level: 63 },
          user: { uids: [] },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(63);
    });
    it('should return team permission level for common user and user permissions is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(31);
    });
    it('should return team permission level for common user and user permissions level is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
          user: { uids: [] },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(DEFAULT_USER_PERMISSION_LEVEL);
    });
    it('should return team permission level for common user and user permissions level is defined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
          user: { uids: [], level: 15 },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(15);
    });
  });

  describe('permissionLevelToArray()', () => {
    it('return permission array', () => {
      const level: number =
        PERMISSION_ENUM.TEAM_POST +
        PERMISSION_ENUM.TEAM_ADD_MEMBER +
        PERMISSION_ENUM.TEAM_PIN_POST; // 1 + 2 + 8
      expect(
        teamPermissionController['_permissionLevelToArray'](level),
      ).toEqual([
        PERMISSION_ENUM.TEAM_POST,
        PERMISSION_ENUM.TEAM_ADD_MEMBER,
        PERMISSION_ENUM.TEAM_PIN_POST,
      ]);
    });
  });

  describe('getCurrentUserPermissions()', () => {
    it('return permissions when current user is guest', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
      };
      jest
        .spyOn(teamPermissionController, 'isCurrentUserGuest')
        .mockReturnValue(true);
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissionLevel')
        .mockReturnValue(11);
      expect(
        teamPermissionController.getCurrentUserPermissions(teamPermissionParams),
      ).toEqual([PERMISSION_ENUM.TEAM_POST]);
    });
    it('return permissions when current user is not guest', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
      };
      jest
        .spyOn(teamPermissionController, 'isCurrentUserGuest')
        .mockReturnValue(false);
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissionLevel')
        .mockReturnValue(11);
      expect(
        teamPermissionController.getCurrentUserPermissions(teamPermissionParams),
      ).toEqual([
        PERMISSION_ENUM.TEAM_POST,
        PERMISSION_ENUM.TEAM_ADD_MEMBER,
        PERMISSION_ENUM.TEAM_PIN_POST,
      ]);
    });
  });

  describe('isCurrentUserHasPermission()', () => {
    it('is current user has permission', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [],
      };
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissions')
        .mockReturnValue([
          PERMISSION_ENUM.TEAM_POST,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
        ]);
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          teamPermissionParams,
          PERMISSION_ENUM.TEAM_POST,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          teamPermissionParams,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          teamPermissionParams,
          PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          teamPermissionParams,
          PERMISSION_ENUM.TEAM_PIN_POST,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          teamPermissionParams,
          PERMISSION_ENUM.TEAM_ADMIN,
        ),
      ).toBeFalsy();
    });
  });

  describe('createPermissionsMask()', () => {
    it('should return correct mask value 31', () => {
      const permissionFlags = {
        TEAM_POST: true,
        TEAM_ADD_MEMBER: true,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: true,
        TEAM_ADMIN: true,
      };
      expect(
        teamPermissionController.createPermissionsMask(permissionFlags),
      ).toBe(1 + 2 + 4 + 8 + 16);
    });
    it('should return correct mask value 21', () => {
      const permissionFlags = {
        TEAM_POST: true,
        TEAM_ADD_MEMBER: false,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: false,
        TEAM_ADMIN: true,
      };
      expect(
        teamPermissionController.createPermissionsMask(permissionFlags),
      ).toBe(1 + 4 + 16);
    });
    it('should return correct mask value 14', () => {
      const permissionFlags = {
        TEAM_POST: false,
        TEAM_ADD_MEMBER: true,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: true,
        TEAM_ADMIN: false,
      };
      expect(
        teamPermissionController.createPermissionsMask(permissionFlags),
      ).toBe(2 + 4 + 8);
    });
  });

  describe('isTeamAdmin()', async () => {
    it('should return true if no team permission model', async () => {
      expect(teamPermissionController.isTeamAdmin(11, undefined)).toBeTruthy();
    });

    it('should return true if person is in admin id list', async () => {
      const permission: TeamPermission = {
        admin: {
          uids: [1, 2, 3],
          level: 31,
        },
        user: {
          uids: [1, 2, 3, 4],
          level: 15,
        },
      };
      expect(teamPermissionController.isTeamAdmin(1, permission)).toBeTruthy();
      expect(teamPermissionController.isTeamAdmin(2, permission)).toBeTruthy();
      expect(teamPermissionController.isTeamAdmin(3, permission)).toBeTruthy();
      expect(teamPermissionController.isTeamAdmin(4, permission)).toBeFalsy();
    });
  });
});
