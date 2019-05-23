/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-29 00:12:19
 * Copyright © RingCentral. All rights reserved.
 */

import { RCInfoFetchController } from './RCInfoFetchController';
import { RCPermissionController } from './RCPermissionController';
import { RolePermissionController } from './RolePermissionController';
import { RCCallerIdController } from './RCCallerIdController';
import { RegionInfoController } from './RegionInfoController';
import { RCAccountInfoController } from './RCAccountInfoController';
import { AccountServiceInfoController } from './AccountServiceInfoController';

import { RCWebSettingInfoController } from './RCWebSettingInfoController';
class RCInfoController {
  private _rcInfoFetchController: RCInfoFetchController;
  private _rcPermissionController: RCPermissionController;
  private _rolePermissionController: RolePermissionController;
  private _rcCallerIdController: RCCallerIdController;
  private _regionInfoController: RegionInfoController;
  private _rcAccountInfoController: RCAccountInfoController;
  private _accountServiceInfoController: AccountServiceInfoController;
  private _webSettingInfoController: RCWebSettingInfoController;

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

  getRCCallerIdController(): RCCallerIdController {
    if (!this._rcCallerIdController) {
      this._rcCallerIdController = new RCCallerIdController(
        this.getRCInfoFetchController(),
      );
    }
    return this._rcCallerIdController;
  }
  getRCAccountInfoController(): RCAccountInfoController {
    if (!this._rcAccountInfoController) {
      this._rcAccountInfoController = new RCAccountInfoController(
        this.getRCInfoFetchController(),
      );
    }
    return this._rcAccountInfoController;
  }

  getAccountServiceInfoController(): AccountServiceInfoController {
    if (!this._accountServiceInfoController) {
      this._accountServiceInfoController = new AccountServiceInfoController(
        this.getRCInfoFetchController(),
      );
    }
    return this._accountServiceInfoController;
  }

  getRegionInfoController(): RegionInfoController {
    if (!this._regionInfoController) {
      this._regionInfoController = new RegionInfoController(
        this.getRCInfoFetchController(),
        this.getRCAccountInfoController(),
        this.getAccountServiceInfoController(),
        this.getRCCallerIdController(),
      );
      this._regionInfoController.init();
    }
    return this._regionInfoController;
  }

  getRcWebSettingInfoController(): RCWebSettingInfoController {
    if (!this._webSettingInfoController) {
      this._webSettingInfoController = new RCWebSettingInfoController(
        this.getRCInfoFetchController(),
      );
    }
    return this._webSettingInfoController;
  }

  dispose() {
    if (this._regionInfoController) {
      this._regionInfoController.dispose();
      delete this._regionInfoController;
    }
  }
}

export { RCInfoController };
