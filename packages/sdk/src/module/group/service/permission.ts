/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-06-06 15:55:39
 * @Last Modified by: Paynter Chen
 * @Last Modified time: 2019-01-31 15:39:00
 */
import _ from 'lodash';
import { Group } from '../../group/entity';
import { PERMISSION_ENUM } from '../constants';

export type PermissionKeys = keyof typeof PERMISSION_ENUM;
export type PermissionFlags = { [KEY in PermissionKeys]: boolean };

const MAX_LEVEL = 31;
export default class Permission {
  group: Group;
  userId: number;
  companyId: number;

  constructor(params: Group, userId: number, companyId: number) {
    this.group = params;
    this.userId = userId;
    this.companyId = companyId;
  }

  static createPermissionsMask(newPermissions: PermissionFlags) {
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

  isPublic() {
    return this.group.privacy === 'protected';
  }

  isGuest() {
    const { guest_user_company_ids } = this.group;
    return (
      guest_user_company_ids && guest_user_company_ids.includes(this.companyId)
    );
  }

  isSelfGroup() {
    const { is_team, members, creator_id } = this.group;
    return (
      !is_team && members && members.length === 1 && creator_id === members[0]
    );
  }

  isTeamGroup() {
    return this.group.is_team;
  }

  isCommonGroup() {
    return !this.isTeamGroup() && !this.isSelfGroup();
  }

  get level() {
    let level: number = 0;
    this.isSelfGroup() && (level = MAX_LEVEL - PERMISSION_ENUM.TEAM_ADD_MEMBER);
    this.isCommonGroup() && (level = MAX_LEVEL - PERMISSION_ENUM.TEAM_ADMIN);
    this.isTeamGroup() && (level = this.getTeamGroupLevel() || 0);
    return level;
  }

  getTeamGroupLevel() {
    if (!this.group.permissions) {
      return MAX_LEVEL;
    }

    const {
      permissions: { admin, user },
    } = this.group;

    if (admin && admin.uids.includes(this.userId)) {
      return admin.level || MAX_LEVEL;
    }

    if (user) {
      return user.level;
    }

    return 0;
  }

  levelToArray(level: number): PERMISSION_ENUM[] {
    const res: PERMISSION_ENUM[] = [];
    let permission;
    for (permission in PERMISSION_ENUM) {
      if ((permission = Number(permission))) {
        permission & level && res.push(permission);
      }
    }
    return res;
  }

  getPermissions() {
    const permissions = this.levelToArray(this.level);
    return permissions.filter(this.hasPermission.bind(this));
  }

  hasPermission(permission: PERMISSION_ENUM) {
    const permissionMap = {
      [PERMISSION_ENUM.TEAM_ADD_MEMBER]: !this.isGuest() && !this.isSelfGroup(),
      [PERMISSION_ENUM.TEAM_PIN_POST]: !this.isGuest(),
    };
    return permissionMap[permission] !== false;
  }
}
