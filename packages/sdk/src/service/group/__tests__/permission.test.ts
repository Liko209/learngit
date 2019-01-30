/// <reference path="../../../__tests__/types.d.ts" />

import { Group } from '../../../models';
import Permission from '../permission';
import { groupFactory } from '../../../__tests__/factories';

describe('Permission', () => {
  const groupBase: Group = groupFactory.build({
    id: 1,
    creator_id: 2,
    created_at: 3,
    is_team: true,
    most_recent_content_modified_at: 4,
    most_recent_post_created_at: 5,
    most_recent_post_id: 6,
  });

  const userId = 123456;
  const companyId = 345678;

  function createPermission(mock) {
    return new Permission(mock, userId, companyId);
  }

  it('isPublic(): should return true when privacy=protected', () => {
    const group = {
      privacy: 'protected',
    };
    const mock = { ...groupBase, ...group };
    const permission = createPermission(mock);
    expect(permission.isPublic()).toBe(true);
  });

  it('isGuest(): should return true when guest_user_company_ids contain userId', () => {
    const group = {
      guest_user_company_ids: [companyId],
    };
    const mock = { ...groupBase, ...group };
    const permission = createPermission(mock);
    expect(permission.isGuest()).toBe(true);
  });

  it('isSelfGroup(): should return true', () => {
    const group = {
      is_team: false,
      members: [userId],
      creator_id: userId,
    };
    const mock = { ...groupBase, ...group };
    const permission = createPermission(mock);
    expect(permission.isSelfGroup()).toBe(true);
  });

  it('isTeamGroup(): should return true when is_team=true', () => {
    const group = {
      is_team: true,
    };
    const mock = { ...groupBase, ...group };
    const permission = createPermission(mock);
    expect(permission.isTeamGroup()).toBe(true);
  });

  it('isCommonGroup(): should return true', () => {
    const group = {
      is_team: false,
      members: [1, 2],
    };
    const mock = { ...groupBase, ...group };
    const permission = createPermission(mock);
    expect(permission.isCommonGroup()).toBe(true);
  });

  describe('getTeamGroupLevel()', () => {
    const group = {
      is_team: true,
      permissions: {
        admin: {
          level: 15,
          uids: [userId],
        },
        user: {
          level: 15,
          uids: [],
        },
      },
    };

    it('should return permissions level', () => {
      const mock = { ...groupBase, ...group };
      const permission = createPermission(mock);
      expect(permission.getTeamGroupLevel()).toBe(15);
    });

    it('should return default level 31', () => {
      const group = {
        is_team: true,
      };
      const mock = { ...groupBase, ...group };
      const permission = createPermission(mock);
      expect(permission.getTeamGroupLevel()).toBe(31);
    });
  });

  it('levelToArray', () => {
    const level = 31;
    const permission = createPermission(groupBase);
    expect(permission.levelToArray(level)).toEqual([1, 2, 4, 8, 16]);
  });

  describe('getPermissions', () => {
    const permission = createPermission(groupBase);
    jest.spyOn(permission, 'levelToArray');
    jest.spyOn(permission, 'isGuest');
    jest.spyOn(permission, 'isSelfGroup');

    permission.levelToArray.mockReturnValue([1, 2, 4, 8]);
    permission.isGuest.mockReturnValue(true);
    permission.isSelfGroup.mockReturnValue(true);

    const res = permission.getPermissions();
    expect(res).toEqual([1, 4]);
  });

  describe('createPermissionsMask()', () => {
    it('should return correct mask value 1', () => {
      const permissionFlags = {
        TEAM_POST: true,
        TEAM_ADD_MEMBER: true,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: true,
        TEAM_ADMIN: true,
      };
      expect(Permission.createPermissionsMask(permissionFlags)).toBe(
        1 + 2 + 4 + 8 + 16,
      );
    });
    it('should return correct mask value 2', () => {
      const permissionFlags = {
        TEAM_POST: true,
        TEAM_ADD_MEMBER: false,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: false,
        TEAM_ADMIN: true,
      };
      expect(Permission.createPermissionsMask(permissionFlags)).toBe(
        1 + 4 + 16,
      );
    });
    it('should return correct mask value 3', () => {
      const permissionFlags = {
        TEAM_POST: false,
        TEAM_ADD_MEMBER: true,
        TEAM_ADD_INTEGRATIONS: true,
        TEAM_PIN_POST: true,
        TEAM_ADMIN: false,
      };
      expect(Permission.createPermissionsMask(permissionFlags)).toBe(2 + 4 + 8);
    });
  });
});
