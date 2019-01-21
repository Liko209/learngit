/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:19:37
 * Copyright © RingCentral. All rights reserved.
 */

import { IPermissionService } from './IPermissionService';
import { EntityBaseService } from '../../../framework';
import { PermissionController } from '../controller/PermissionController';
import UserPermissionType from '../types';

type UserPermission = {
  id: number;
  permissions: Object;
};

class PermissionService extends EntityBaseService<UserPermission>
  implements IPermissionService {
  static serviceName = 'PermissionService';
  private permissionController: PermissionController;

  constructor() {
    super(false);
    this.permissionController = new PermissionController();
  }

  async hasPermission(type: UserPermissionType) {
    return this.permissionController.hasPermission(type);
  }

  async getById(id: number): Promise<UserPermission> {
    return this.permissionController.getById(id);
  }
}

export { PermissionService };
