/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:30:55
 * Copyright © RingCentral. All rights reserved.
 */

import { TeamPermissionController } from '../TeamPermissionController';
import { TeamPermission } from '../../entity/Group';
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
      const group = groupFactory.build();
      expect(teamPermissionController.isCurrentUserGuest(group)).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds is empty', () => {
      const group = groupFactory.build({
        guest_user_company_ids: [],
      });
      expect(teamPermissionController.isCurrentUserGuest(group)).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds does not include current user', () => {
      const group = groupFactory.build({
        guest_user_company_ids: [123456],
      });
      expect(teamPermissionController.isCurrentUserGuest(group)).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds includes current user', () => {
      const group = groupFactory.build({
        guest_user_company_ids: [55668833],
      });
      expect(teamPermissionController.isCurrentUserGuest(group)).toBeTruthy();
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
    it('return self group permission level', () => {
      const group = groupFactory.build({
        is_team: false,
        members: [540],
        creator_id: 540,
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(29);
    });
    it('return common group permission level', () => {
      const group = groupFactory.build({
        is_team: false,
        members: [540, 524],
        creator_id: 540,
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(15);
    });
    it('return team permission level when permissions is undefined', () => {
      const group = groupFactory.build({
        is_team: true,
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(31);
    });
    it('return team permission level when admin permissions is undefined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          user: { uids: [] },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(31);
    });
    it('return team permission level when admin uids is empty and level is undefined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [] },
          user: { uids: [] },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(31);
    });
    it('return team permission level when admin uids is empty and level is defined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [], level: 63 },
          user: { uids: [] },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(63);
    });
    it('return team permission level when admin uids includes current user and level is defined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [5683], level: 63 },
          user: { uids: [] },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(63);
    });
    it('return team permission level for common user and user permissions is undefined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(31);
    });
    it('return team permission level for common user and user permissions level is undefined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
          user: { uids: [] },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
      ).toEqual(DEFAULT_USER_PERMISSION_LEVEL);
    });
    it('return team permission level for common user and user permissions level is defined', () => {
      const group = groupFactory.build({
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
          user: { uids: [], level: 15 },
        },
      });
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(group),
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
      const group = groupFactory.build();
      jest
        .spyOn(teamPermissionController, 'isCurrentUserGuest')
        .mockReturnValue(true);
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissionLevel')
        .mockReturnValue(11);
      expect(teamPermissionController.getCurrentUserPermissions(group)).toEqual(
        [PERMISSION_ENUM.TEAM_POST],
      );
    });
    it('return permissions when current user is not guest', () => {
      const group = groupFactory.build();
      jest
        .spyOn(teamPermissionController, 'isCurrentUserGuest')
        .mockReturnValue(false);
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissionLevel')
        .mockReturnValue(11);
      expect(teamPermissionController.getCurrentUserPermissions(group)).toEqual(
        [
          PERMISSION_ENUM.TEAM_POST,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
          PERMISSION_ENUM.TEAM_PIN_POST,
        ],
      );
    });
  });

  describe('isCurrentUserHasPermission()', () => {
    it('is current user has permission', () => {
      const group = groupFactory.build();
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissions')
        .mockReturnValue([
          PERMISSION_ENUM.TEAM_POST,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
        ]);
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          group,
          PERMISSION_ENUM.TEAM_POST,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          group,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          group,
          PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          group,
          PERMISSION_ENUM.TEAM_PIN_POST,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          group,
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
