/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-12 15:18:29
 * Copyright © RingCentral. All rights reserved.
 */

import { RCRolePermission } from '../../../api/ringcentral';
import { PermissionId } from '../types';
import { RCInfoFetchController } from './RCInfoFetchController';

class RolePermissionController {
  constructor(private _rcInfoFetchController: RCInfoFetchController) {}

  async hasPermission(id: PermissionId) {
    const rolePermissions = await this._rcInfoFetchController.getRCRolePermissions();
    if (rolePermissions && rolePermissions.permissions) {
      const rcRolePermission = rolePermissions.permissions.find(
        (item: RCRolePermission) => {
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
