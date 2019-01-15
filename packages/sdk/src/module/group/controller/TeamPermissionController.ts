/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-01-14 14:08:02
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { Group, TeamPermission } from '../entity';
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

  isCurrentUserGuest(group: Group): boolean {
    const accountDao: AccountDao = daoManager.getKVDao(AccountDao);
    const companyId = accountDao.get(ACCOUNT_COMPANY_ID);
    const guestUserCompanyIds = group.guest_user_company_ids;
    return guestUserCompanyIds
      ? guestUserCompanyIds.includes(companyId)
      : false;
  }

  getCurrentUserPermissionLevel(group: Group): number {
    if (!group.is_team) {
      if (
        group.members &&
        group.members.length === 1 &&
        group.creator_id === group.members[0]
      ) {
        return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADD_MEMBER;
      }
      return MAX_PERMISSION_LEVEL - PERMISSION_ENUM.TEAM_ADMIN;
    }

    const permissions = group.permissions;
    if (!permissions || !permissions.admin) {
      return MAX_PERMISSION_LEVEL;
    }

    const accountDao: AccountDao = daoManager.getKVDao(AccountDao);
    const userId = accountDao.get(ACCOUNT_USER_ID);
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

  getCurrentUserPermissions(group: Group): PERMISSION_ENUM[] {
    let permissions = this._permissionLevelToArray(
      this.getCurrentUserPermissionLevel(group),
    );
    if (this.isCurrentUserGuest(group)) {
      permissions = permissions.filter(
        permission =>
          permission !== PERMISSION_ENUM.TEAM_ADD_MEMBER &&
          permission !== PERMISSION_ENUM.TEAM_PIN_POST,
      );
    }
    return permissions;
  }

  isCurrentUserHasPermission(group: Group, type: PERMISSION_ENUM): boolean {
    const permissionList = this.getCurrentUserPermissions(group);
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
