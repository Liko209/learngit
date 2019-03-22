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
  private _rolePermissions: RcRolePermissions;

  constructor() {}

  private get rcInfoUserConfig(): RcInfoUserConfig {
    if (!this._rcInfoUserConfig) {
      this._rcInfoUserConfig = new RcInfoUserConfig();
    }
    return this._rcInfoUserConfig;
  }

  setRolePermissions(rolePermissions: RcRolePermissions): void {
    this._rolePermissions = rolePermissions;
  }

  getRolePermissions() {
    if (!this._rolePermissions) {
      this._rolePermissions = this.rcInfoUserConfig.getRolePermissions();
    }
    return this._rolePermissions;
  }

  hasPermission(id: PermissionId) {
    const rolePermissions = this.getRolePermissions();
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
