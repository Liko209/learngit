/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:08:02
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import {
  MAX_PERMISSION_LEVEL,
  PERMISSION_ENUM,
  DEFAULT_ADMIN_PERMISSION_LEVEL,
  DEFAULT_USER_PERMISSION_LEVEL,
  DEFAULT_GUEST_PERMISSION_LEVEL,
} from '../constants';
import { TeamPermission, TeamPermissionParams } from '../entity';
import { PermissionFlags } from '../types';
import { UserConfig } from '../../../service/account/UserConfig';

const REGEXP_IS_NUMBER = /^\d+(\.{0,1}\d+){0,1}$/;

class TeamPermissionController {
  constructor() {}

  isCurrentUserGuest(teamPermissionParams: TeamPermissionParams): boolean {
    const companyId = UserConfig.getCurrentCompanyId();
    const guestUserCompanyIds = teamPermissionParams.guest_user_company_ids;
    return guestUserCompanyIds
      ? guestUserCompanyIds.includes(companyId)
      : false;
  }

  isSelfGroup(
    teamPermissionParams: TeamPermissionParams,
    userId: number,
  ): boolean {
    return (
      teamPermissionParams.members &&
      teamPermissionParams.members.length === 1 &&
      userId === teamPermissionParams.members[0]
    );
  }

  getCurrentUserPermissionLevel(
    teamPermissionParams: TeamPermissionParams,
  ): number {
    const userId = UserConfig.getCurrentUserId();

    if (!teamPermissionParams.is_team) {
      if (this.isSelfGroup(teamPermissionParams, userId)) {
        return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADD_MEMBER;
      }
      return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADMIN;
    }

    if (this.isCurrentUserGuest(teamPermissionParams)) {
      return DEFAULT_GUEST_PERMISSION_LEVEL;
    }

    const {
      permissions: {
        admin: {
          uids: adminUids = [],
          level: adminLevel = DEFAULT_ADMIN_PERMISSION_LEVEL,
        } = {},
        user: { level: userLevel = DEFAULT_USER_PERMISSION_LEVEL } = {},
      } = {},
    } = teamPermissionParams;

    if (adminUids.length === 0 || adminUids.includes(userId)) {
      return adminLevel;
    }
    return userLevel;
  }

  getCurrentUserPermissions(
    teamPermissionParams: TeamPermissionParams,
  ): PERMISSION_ENUM[] {
    const permissions = this._permissionLevelToArray(
      this.getCurrentUserPermissionLevel(teamPermissionParams),
    );
    return permissions;
  }

  isCurrentUserHasPermission(
    teamPermissionParams: TeamPermissionParams,
    type: PERMISSION_ENUM,
  ): boolean {
    const permissionList = this.getCurrentUserPermissions(teamPermissionParams);
    return permissionList.includes(type);
  }

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean {
    const { admin: { uids: adminUids = [] } = {} } = permission || {};
    return adminUids.includes(personId);
  }

  hasTeamAdminPermission(teamPermissionParams: TeamPermissionParams): boolean {
    return this.isCurrentUserHasPermission(
      teamPermissionParams,
      PERMISSION_ENUM.TEAM_ADMIN,
    );
  }

  getTeamUserLevel(permission: TeamPermission | undefined) {
    const { user: { level = DEFAULT_USER_PERMISSION_LEVEL } = {} } =
      permission || {};
    return level;
  }

  getTeamUserPermissionFlags(teamPermission: TeamPermission): PermissionFlags {
    const permissionFlags: PermissionFlags = {};
    const teamUserLevel = this.getTeamUserLevel(teamPermission);
    for (const key in PERMISSION_ENUM) {
      if (!REGEXP_IS_NUMBER.test(key)) {
        permissionFlags[key] = this._checkPermissionWithMask(
          teamUserLevel,
          (PERMISSION_ENUM[key] as any) as PERMISSION_ENUM,
        );
      }
    }
    return permissionFlags;
  }

  mergePermissionFlagsWithLevel(
    permissionFlags: PermissionFlags,
    level: number,
  ): number {
    let mergeLevel = level;
    for (const key in permissionFlags) {
      const mask: PERMISSION_ENUM = PERMISSION_ENUM[key];
      if (permissionFlags[key]) {
        mergeLevel = mergeLevel | mask;
      } else {
        // toggle to false
        mergeLevel = mergeLevel & ~mask;
      }
    }
    return mergeLevel;
  }

  private _permissionLevelToArray(level: number): PERMISSION_ENUM[] {
    const array: PERMISSION_ENUM[] = [];
    let permission;
    for (permission in PERMISSION_ENUM) {
      if ((permission = Number(permission))) {
        permission & level && array.push(permission);
      }
    }
    return array;
  }

  private _checkPermissionWithMask(
    level: number,
    mask: PERMISSION_ENUM,
  ): boolean {
    return (level & mask) === mask;
  }
}

export { TeamPermissionController };
