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
import { RCInfoUserConfig } from '../config';
import { BlockNumberController } from './BlockNumberController';
import { RCPresenceController } from './RCPresenceController';
import { RCDeviceController } from './RCDeviceController';

class RCInfoController {
  private _rcInfoFetchController: RCInfoFetchController;
  private _rcPermissionController: RCPermissionController;
  private _rolePermissionController: RolePermissionController;
  private _rcCallerIdController: RCCallerIdController;
  private _regionInfoController: RegionInfoController;
  private _rcAccountInfoController: RCAccountInfoController;
  private _accountServiceInfoController: AccountServiceInfoController;
  private _webSettingInfoController: RCWebSettingInfoController;
  private _blockNumberController: BlockNumberController;
  private _rcPresenceController: RCPresenceController;
  private _rcDeviceController: RCDeviceController;

  constructor(private _DBConfig: RCInfoUserConfig) {}

  getRCInfoFetchController(): RCInfoFetchController {
    if (!this._rcInfoFetchController) {
      this._rcInfoFetchController = new RCInfoFetchController();
    }
    return this._rcInfoFetchController;
  }

  getRCDeviceController(): RCDeviceController {
    if (!this._rcDeviceController) {
      this._rcDeviceController = new RCDeviceController();
    }
    return this._rcDeviceController;
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

  get blockNumberController(): BlockNumberController {
    if (!this._blockNumberController) {
      this._blockNumberController = new BlockNumberController(this._DBConfig);
    }
    return this._blockNumberController;
  }

  get rcPresenceController() {
    if (!this._rcPresenceController) {
      this._rcPresenceController = new RCPresenceController();
    }
    return this._rcPresenceController;
  }

  dispose() {
    if (this._regionInfoController) {
      this._regionInfoController.dispose();
      delete this._regionInfoController;
    }
    if (this._rcPresenceController) {
      this._rcPresenceController.dispose();
      delete this._rcPresenceController;
    }
  }
}

export { RCInfoController };
