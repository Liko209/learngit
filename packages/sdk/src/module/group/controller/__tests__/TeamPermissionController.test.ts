/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:30:55
 * Copyright © RingCentral. All rights reserved.
 */
import { GlobalConfigService } from '../../../../module/config';

import {
  DEFAULT_USER_PERMISSION_LEVEL,
  PERMISSION_ENUM,
} from '../../constants';
import { TeamPermission, TeamPermissionParams } from '../../entity';
import { TeamPermissionController } from '../TeamPermissionController';
import { AccountUserConfig } from '../../../../module/account/config';

jest.mock('../../../../module/config/service/GlobalConfigService');
jest.mock('../../../../module/account/config');

const mockCurrentUserId = 5683;
const mockCurrentUserCompanyId = 55668833;

GlobalConfigService.getInstance = jest.fn();

describe('TeamPermissionController', () => {
  let teamPermissionController: TeamPermissionController;
  beforeEach(() => {
    jest.clearAllMocks();
    teamPermissionController = new TeamPermissionController();
  });

  describe('isCurrentUserGuest()', () => {
    beforeAll(() => {
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValue(mockCurrentUserId);

      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValue(mockCurrentUserCompanyId);
    });
    it('should return false when guestUserCompanyIds is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds is empty', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
        guest_user_company_ids: [],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds does not include current user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
        guest_user_company_ids: [123456],
      };
      expect(
        teamPermissionController.isCurrentUserGuest(teamPermissionParams),
      ).toBeFalsy();
    });
    it('should return false when guestUserCompanyIds includes current user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
        guest_user_company_ids: [mockCurrentUserCompanyId],
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
        teamPermissionController.isSelfGroup(
          teamPermissionParams,
          mockCurrentUserId,
        ),
      ).toBeFalsy();
    });
    it('should return false when members more user', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [123, 555, mockCurrentUserId],
      };
      expect(
        teamPermissionController.isSelfGroup(
          teamPermissionParams,
          mockCurrentUserId,
        ),
      ).toBeFalsy();
    });
    it('should return false when member only contain one user and is not me', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [1234],
      };
      expect(
        teamPermissionController.isSelfGroup(
          teamPermissionParams,
          mockCurrentUserId,
        ),
      ).toBeFalsy();
    });
    it('should return true when member only contain myself', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
      };
      expect(
        teamPermissionController.isSelfGroup(
          teamPermissionParams,
          mockCurrentUserId,
        ),
      ).toBeTruthy();
    });
  });

  describe('getCurrentUserPermissionLevel()', () => {
    it('should return self group permission level', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: false,
        members: [mockCurrentUserId],
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
        members: [540, 524, mockCurrentUserId],
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(15);
    });
    it('should return default team admin permission level when there is not permissions info', () => {
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
    it('should return team permission level when permissions is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
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
        members: [mockCurrentUserId],
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
        members: [mockCurrentUserId],
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
        members: [mockCurrentUserId],
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
        members: [mockCurrentUserId],
        is_team: true,
        permissions: {
          admin: { uids: [mockCurrentUserId], level: 63 },
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
        members: [mockCurrentUserId],
        is_team: true,
        permissions: {
          admin: { uids: [540], level: 63 },
        },
      };
      expect(
        teamPermissionController.getCurrentUserPermissionLevel(
          teamPermissionParams,
        ),
      ).toEqual(DEFAULT_USER_PERMISSION_LEVEL);
    });
    it('should return team permission level for common user and user permissions level is undefined', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
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
        members: [mockCurrentUserId],
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
    it('should return permission array', () => {
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
    it('should return permissions when current user is guest', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: true,
        guest_user_company_ids: [mockCurrentUserCompanyId],
        members: [mockCurrentUserId],
      };
      expect(
        teamPermissionController.getCurrentUserPermissions(
          teamPermissionParams,
        ),
      ).toEqual([
        PERMISSION_ENUM.TEAM_POST,
        PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
      ]);
    });
    it('return permissions when current user is not guest', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: true,
        members: [mockCurrentUserId],
      };
      expect(
        teamPermissionController.getCurrentUserPermissions(
          teamPermissionParams,
        ),
      ).toEqual([
        PERMISSION_ENUM.TEAM_POST,
        PERMISSION_ENUM.TEAM_ADD_MEMBER,
        PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
        PERMISSION_ENUM.TEAM_PIN_POST,
        PERMISSION_ENUM.TEAM_ADMIN,
      ]);
    });
  });

  describe('isCurrentUserHasPermission()', () => {
    it('is current user has permission', () => {
      const teamPermissionParams: TeamPermissionParams = {
        members: [mockCurrentUserId],
      };
      jest
        .spyOn(teamPermissionController, 'getCurrentUserPermissions')
        .mockReturnValue([
          PERMISSION_ENUM.TEAM_POST,
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
        ]);
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_POST,
          teamPermissionParams,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
          teamPermissionParams,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
          teamPermissionParams,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_PIN_POST,
          teamPermissionParams,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADMIN,
          teamPermissionParams,
        ),
      ).toBeFalsy();
    });

    it('should user not have TEAM_ADMIN permission when there is admin', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: true,
        members: [mockCurrentUserId],
        guest_user_company_ids: [],
        permissions: {
          admin: {
            uids: [123],
          },
        },
      };
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADMIN,
          teamPermissionParams,
        ),
      ).toBeFalsy();
    });

    it('should user have TEAM_ADMIN permission when there is not admin', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: true,
        members: [mockCurrentUserId],
        guest_user_company_ids: [],
        permissions: {
          admin: {
            uids: [],
          },
        },
      };
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADMIN,
          teamPermissionParams,
        ),
      ).toBeTruthy();
    });

    it('should guest not have TEAM_ADMIN permission when there is not admin', () => {
      const teamPermissionParams: TeamPermissionParams = {
        is_team: true,
        members: [mockCurrentUserId],
        guest_user_company_ids: [mockCurrentUserCompanyId],
        permissions: {
          admin: {
            uids: [],
          },
        },
      };
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADMIN,
          teamPermissionParams,
        ),
      ).toBeFalsy();
    });

    it('should has default permission when do not have info', () => {
      const teamPermissionParams: TeamPermissionParams = {};
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_POST,
          teamPermissionParams,
        ),
      ).toBeTruthy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADD_MEMBER,
          teamPermissionParams,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_PIN_POST,
          teamPermissionParams,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
          teamPermissionParams,
        ),
      ).toBeFalsy();
      expect(
        teamPermissionController.isCurrentUserHasPermission(
          PERMISSION_ENUM.TEAM_ADMIN,
          teamPermissionParams,
        ),
      ).toBeFalsy();
    });
  });

  describe('isTeamAdmin()', () => {
    it('should return true if no team permission model', async () => {
      expect(teamPermissionController.isTeamAdmin(11, undefined)).toBeFalsy();
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

    it('should return false if admin.uids is empty', async () => {
      const permission1: TeamPermission = {
        admin: {
          uids: [],
        },
      };
      const permission2: TeamPermission = {};
      const permission3: TeamPermission = null;
      expect(teamPermissionController.isTeamAdmin(4, permission1)).toBeFalsy();
      expect(teamPermissionController.isTeamAdmin(4, permission2)).toBeFalsy();
      expect(teamPermissionController.isTeamAdmin(4, permission3)).toBeFalsy();
    });
  });

  describe('getTeamUserPermissionFlags()', () => {
    describe('should return permissionFlags correctly.', () => {
      const ENUMS_DETAIL = [
        {
          key: 'TEAM_ADD_INTEGRATIONS',
          mask: PERMISSION_ENUM.TEAM_ADD_INTEGRATIONS,
        },
        {
          key: 'TEAM_ADD_MEMBER',
          mask: PERMISSION_ENUM.TEAM_ADD_MEMBER,
        },
        {
          key: 'TEAM_ADMIN',
          mask: PERMISSION_ENUM.TEAM_ADMIN,
        },
        {
          key: 'TEAM_PIN_POST',
          mask: PERMISSION_ENUM.TEAM_PIN_POST,
        },
        {
          key: 'TEAM_POST',
          mask: PERMISSION_ENUM.TEAM_POST,
        },
      ];
      const getTotalLevel = (indexs: number[]) => {
        let level = 0;
        indexs.forEach((index: number) => {
          level = level | ENUMS_DETAIL[index].mask;
        });
        return level;
      };

      const getKeys = (indexs: number[]) => {
        return indexs.map((index: number) => ENUMS_DETAIL[index].key);
      };
      it.each`
        level                          | trueFlagsKeys            | falseFlagsKeys
        ${getTotalLevel([0])}          | ${getKeys([0])}          | ${getKeys([1, 2, 3, 4])}
        ${getTotalLevel([1])}          | ${getKeys([1])}          | ${getKeys([0, 2, 3, 4])}
        ${getTotalLevel([2])}          | ${getKeys([2])}          | ${getKeys([0, 1, 3, 4])}
        ${getTotalLevel([3])}          | ${getKeys([3])}          | ${getKeys([0, 1, 2, 4])}
        ${getTotalLevel([4])}          | ${getKeys([4])}          | ${getKeys([0, 1, 2, 3])}
        ${getTotalLevel([0, 1])}       | ${getKeys([0, 1])}       | ${getKeys([2, 3, 4])}
        ${getTotalLevel([0, 2])}       | ${getKeys([0, 2])}       | ${getKeys([1, 3, 4])}
        ${getTotalLevel([0, 3])}       | ${getKeys([0, 3])}       | ${getKeys([1, 2, 4])}
        ${getTotalLevel([0, 4])}       | ${getKeys([0, 4])}       | ${getKeys([1, 2, 3])}
        ${getTotalLevel([1, 2])}       | ${getKeys([1, 2])}       | ${getKeys([0, 3, 4])}
        ${getTotalLevel([1, 3])}       | ${getKeys([1, 3])}       | ${getKeys([0, 2, 4])}
        ${getTotalLevel([1, 4])}       | ${getKeys([1, 4])}       | ${getKeys([0, 2, 3])}
        ${getTotalLevel([2, 3])}       | ${getKeys([2, 3])}       | ${getKeys([0, 1, 4])}
        ${getTotalLevel([2, 4])}       | ${getKeys([2, 4])}       | ${getKeys([0, 1, 3])}
        ${getTotalLevel([3, 4])}       | ${getKeys([3, 4])}       | ${getKeys([0, 1, 2])}
        ${getTotalLevel([0, 1, 2])}    | ${getKeys([0, 1, 2])}    | ${getKeys([3, 4])}
        ${getTotalLevel([0, 1, 3])}    | ${getKeys([0, 1, 3])}    | ${getKeys([2, 4])}
        ${getTotalLevel([0, 1, 4])}    | ${getKeys([0, 1, 4])}    | ${getKeys([2, 3])}
        ${getTotalLevel([0, 2, 3])}    | ${getKeys([0, 2, 3])}    | ${getKeys([1, 4])}
        ${getTotalLevel([0, 2, 4])}    | ${getKeys([0, 2, 4])}    | ${getKeys([1, 3])}
        ${getTotalLevel([0, 3, 4])}    | ${getKeys([0, 3, 4])}    | ${getKeys([1, 2])}
        ${getTotalLevel([1, 2, 3])}    | ${getKeys([1, 2, 3])}    | ${getKeys([0, 4])}
        ${getTotalLevel([1, 2, 4])}    | ${getKeys([1, 2, 4])}    | ${getKeys([0, 3])}
        ${getTotalLevel([1, 3, 4])}    | ${getKeys([1, 3, 4])}    | ${getKeys([0, 2])}
        ${getTotalLevel([2, 3, 4])}    | ${getKeys([2, 3, 4])}    | ${getKeys([0, 1])}
        ${getTotalLevel([0, 1, 2, 3])} | ${getKeys([0, 1, 2, 3])} | ${getKeys([4])}
        ${getTotalLevel([0, 1, 2, 4])} | ${getKeys([0, 1, 2, 4])} | ${getKeys([3])}
        ${getTotalLevel([0, 1, 3, 4])} | ${getKeys([0, 1, 3, 4])} | ${getKeys([2])}
        ${getTotalLevel([0, 2, 3, 4])} | ${getKeys([0, 2, 3, 4])} | ${getKeys([1])}
        ${getTotalLevel([1, 2, 3, 4])} | ${getKeys([1, 2, 3, 4])} | ${getKeys([0])}
      `(
        'level = $level, $trueFlagsKeys = true',
        async ({ level, trueFlagsKeys, falseFlagsKeys }) => {
          const permission = {
            user: {
              level,
              uids: [],
            },
          };
          const teamPermissionFlags = await teamPermissionController.getTeamUserPermissionFlags(
            permission,
          );
          const flags = {};
          trueFlagsKeys.forEach((k: string) => {
            flags[k] = true;
          });
          falseFlagsKeys.forEach((k: string) => {
            flags[k] = false;
          });
          expect(teamPermissionFlags).toEqual(flags);
        },
      );
    });
  });
});
