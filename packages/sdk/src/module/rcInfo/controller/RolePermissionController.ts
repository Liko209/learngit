/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 15:18:29
 * Copyright © RingCentral. All rights reserved.
 */
import { RcInfoUserConfig } from '../config';
import {
  RcRolePermissions,
  RcRolePermission,
} from '../../../api/ringcentral/types/RcRolePermissions';
import { PermissionId } from '../types';

class RolePermissionController {
  private _rcInfoUserConfig: RcInfoUserConfig;

  constructor() {
    this._rcInfoUserConfig = new RcInfoUserConfig();
  }

  hasPermission(id: PermissionId) {
    const rolePermissions: RcRolePermissions = this._rcInfoUserConfig.getRolePermission();
    if (rolePermissions && rolePermissions.permissions) {
      const rcRolePermission = rolePermissions.permissions.find(
        (item: RcRolePermission) => {
          return item.permission &&
            item.permission.id &&
            item.permission.id === id
            ? true
            : false;
        },
      );
      if (rcRolePermission) {
        return true;
      }
    }
    return false;
  }
}

export { RolePermissionController };
