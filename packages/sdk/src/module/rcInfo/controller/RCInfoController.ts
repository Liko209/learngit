/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-29 00:12:19
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoFetchController } from './RCInfoFetchController';
import { RCPermissionController } from './RCPermissionController';
import { RolePermissionController } from './RolePermissionController';

class RCInfoController {
  private _rcInfoFetchController: RCInfoFetchController;
  private _rcPermissionController: RCPermissionController;
  private _rolePermissionController: RolePermissionController;

  constructor() {}

  getRCInfoFetchController(): RCInfoFetchController {
    if (!this._rcInfoFetchController) {
      this._rcInfoFetchController = new RCInfoFetchController();
    }
    return this._rcInfoFetchController;
  }

  getRCPermissionController(): RCPermissionController {
    if (!this._rcPermissionController) {
      this._rcPermissionController = new RCPermissionController(
        this.getRCInfoFetchController(),
        this.getRolePermissionController(),
      );
    }
    return this._rcPermissionController;
  }

  getRolePermissionController(): RolePermissionController {
    if (!this._rolePermissionController) {
      this._rolePermissionController = new RolePermissionController(
        this.getRCInfoFetchController(),
      );
    }
    return this._rolePermissionController;
  }
}

export { RCInfoController };
