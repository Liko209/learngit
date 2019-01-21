/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:08:02
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { TeamPermission, TeamPermissionParams } from '../entity';
import { MAX_PERMISSION_LEVEL, PERMISSION_ENUM } from '../constants';
import { daoManager, AccountDao } from '../../../dao';
import {
  ACCOUNT_USER_ID,
  ACCOUNT_COMPANY_ID,
} from '../../../dao/account/constants';

export type PermissionKeys = keyof typeof PERMISSION_ENUM;
export type PermissionFlags = { [KEY in PermissionKeys]: boolean };

class TeamPermissionController {
  constructor() {}

  isCurrentUserGuest(teamPermissionParams: TeamPermissionParams): boolean {
    const accountDao: AccountDao = daoManager.getKVDao(AccountDao);
    const companyId = accountDao.get(ACCOUNT_COMPANY_ID);
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
    const accountDao: AccountDao = daoManager.getKVDao(AccountDao);
    const userId = accountDao.get(ACCOUNT_USER_ID);

    if (!teamPermissionParams.is_team) {
      if (this.isSelfGroup(teamPermissionParams, userId)) {
        return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADD_MEMBER;
      }
      return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADMIN;
    }

    const permissions = teamPermissionParams.permissions;
    if (!permissions || !permissions.admin) {
      return MAX_PERMISSION_LEVEL;
    }
    if (
      permissions.admin.uids.length === 0 ||
      permissions.admin.uids.includes(userId)
    ) {
      return permissions.admin.level || MAX_PERMISSION_LEVEL;
    }

    if (!permissions.user) {
      return MAX_PERMISSION_LEVEL;
    }

    return permissions.user.level || MAX_PERMISSION_LEVEL;
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

  getCurrentUserPermissions(
    teamPermissionParams: TeamPermissionParams,
  ): PERMISSION_ENUM[] {
    let permissions = this._permissionLevelToArray(
      this.getCurrentUserPermissionLevel(teamPermissionParams),
    );
    if (this.isCurrentUserGuest(teamPermissionParams)) {
      permissions = permissions.filter(
        permission =>
          permission !== PERMISSION_ENUM.TEAM_ADD_MEMBER &&
          permission !== PERMISSION_ENUM.TEAM_PIN_POST,
      );
    }
    return permissions;
  }

  isCurrentUserHasPermission(
    teamPermissionParams: TeamPermissionParams,
    type: PERMISSION_ENUM,
  ): boolean {
    const permissionList = this.getCurrentUserPermissions(teamPermissionParams);
    return permissionList.includes(type);
  }

  createPermissionsMask(newPermissions: PermissionFlags) {
    const permissions_mask = _.reduce(
      newPermissions,
      (mask: number, value: boolean, key: string) => {
        if (value) {
          return mask + PERMISSION_ENUM[key];
        }
        return mask;
      },
      0,
    );
    return permissions_mask;
  }

  isTeamAdmin(personId: number, permission?: TeamPermission): boolean {
    if (permission) {
      // for some old team, thy don't have permission, so all member are admin
      const adminUserIds = this._getTeamAdmins(permission);
      return adminUserIds.includes(personId);
    }
    return true;
  }

  private _getTeamAdmins(permission?: TeamPermission): number[] {
    return permission && permission.admin ? permission.admin.uids : [];
  }
}

export { TeamPermissionController };
