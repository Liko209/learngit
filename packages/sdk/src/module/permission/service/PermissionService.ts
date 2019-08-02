/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:19:37
 * Copyright © RingCentral. All rights reserved.
 */

import { IPermissionService } from './IPermissionService';
import { EntityBaseService } from '../../../framework';
import UserPermissionType from '../types';
import { AccountService } from '../../account/service';
import { ServiceLoader, ServiceConfig } from '../../serviceLoader';
import { IPermissionController } from '../controller/IPermissionController';

import { PermissionServiceHelper } from './PermissionServiceHelper';

type UserPermission = {
  id: number;
  permissions: Object;
};

class PermissionService extends EntityBaseService<UserPermission>
  implements IPermissionService {
  private permissionServiceHelper: PermissionServiceHelper;

  constructor() {
    super({ isSupportedCache: false });
    this.permissionServiceHelper = new PermissionServiceHelper();
  }

  injectControllers(controller: IPermissionController) {
    this.permissionServiceHelper.injectControllers(controller);
  }

  async getUserPermission() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const id = userConfig.getGlipUserId();
    return this.getById(id);
  }

  async hasPermission(type: UserPermissionType) {
    return this.permissionServiceHelper.hasPermission(type);
  }

  async getFeatureFlag(type: UserPermissionType) {
    return this.permissionServiceHelper.getFeatureFlag(type);
  }

  async getById(id: number): Promise<UserPermission> {
    return this.permissionServiceHelper.getById(id);
  }
}

export { PermissionService };
