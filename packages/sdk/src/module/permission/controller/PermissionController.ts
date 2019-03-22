/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 14:01:40
 * Copyright © RingCentral. All rights reserved.
 */
// import { SplitIOController } from './splitIO/SplitIOController';
import { LaunchDarklyController } from './launchDarkly/LaunchDarklyController';
import UserPermissionType from '../types';
import { notificationCenter, ENTITY } from '../../../service';
import { AccountUserConfig } from '../../../service/account/config';
import { UserPermission } from '../entity';
import { mainLogger } from 'foundation';
class PermissionController {
  // private splitIOController: SplitIOController;
  private launchDarklyController: LaunchDarklyController;
  constructor() {
    this._initControllers();
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    /**
     * 1. get from beta
     * 2. get frm rc
     * 3. get from split IO
     * result = 1 & 2 & 3;
     */
    // TODO: beta / RC
    // const sp = wait this.splitIOController.hasPermission(type);
    const ld = this.launchDarklyController.hasPermission(type);
    mainLogger.log(`hasPermission of ${type} launchDarkly:${ld}`);
    return ld;
  }

  async getById(id: number): Promise<UserPermission> {
    const permissions = await this._getAllPermissions();
    return {
      id,
      permissions,
    };
  }

  // move to permissionController
  private _initControllers() {
    this._initSplitIOController();
  }
  private _initSplitIOController() {
    // this.splitIOController = new SplitIOController(
    //   this._refreshPermissions.bind(this),
    // );
    this.launchDarklyController = new LaunchDarklyController(
      this._refreshPermissions.bind(this),
    );
  }

  private async _refreshPermissions() {
    const permissions = await this._getAllPermissions();
    const userConfig = new AccountUserConfig();
    const id = userConfig.getGlipUserId();
    mainLogger.log(`user:${id}, refreshPermissions:${permissions}`);
    notificationCenter.emitEntityUpdate(ENTITY.USER_PERMISSION, [
      {
        id,
        permissions,
      },
    ]);
  }

  private async _getAllPermissions() {
    const keys = Object.keys(UserPermissionType);

    const permissions = {};
    await Promise.all(
      keys.map(async (key: UserPermissionType) => {
        const yes = await this.hasPermission(key);
        permissions[key] = yes;
      }),
    );
    return permissions;
  }
}

export { PermissionController };
