/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 15:18:29
 * Copyright © RingCentral. All rights reserved.
 */
import {
  RcRolePermissions,
  RcRolePermission,
} from '../../../api/ringcentral/types/RcRolePermissions';
import { PermissionId } from '../types';

class RolePermissionController {
  private _rolePermissions: RcRolePermissions;

  constructor() {}

  setRolePermissions(rolePermissions: RcRolePermissions): void {
    this._rolePermissions = rolePermissions;
  }

  hasPermission(id: PermissionId) {
    if (this._rolePermissions && this._rolePermissions.permissions) {
      const rcRolePermission = this._rolePermissions.permissions.find(
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
