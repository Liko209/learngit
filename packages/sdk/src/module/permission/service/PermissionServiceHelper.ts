/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-23 13:57:46
 * Copyright © RingCentral. All rights reserved.
 */

import { IPermissionController } from '../controller/IPermissionController';
import { UserPermission } from '../entity';
import UserPermissionType, { FeatureFlagType } from '../types';
import { mainLogger } from 'foundation/log';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { notificationCenter, ENTITY } from 'sdk/service';
import { AccountService } from 'sdk/module/account/service';

const DEFAULT_FEATURE_FLAG = -1;

class PermissionServiceHelper {
  private controllers: IPermissionController[] = [];
  constructor() {}
  injectControllers(controller: IPermissionController) {
    controller.setCallback(this._refreshPermissions.bind(this));
    this.controllers.push(controller);
  }

  async getById(id: number): Promise<UserPermission> {
    const permissions = await this._getAllPermissions();
    return {
      id,
      permissions,
    };
  }

  async getFeatureFlag(type: UserPermissionType): Promise<FeatureFlagType> {
    const controller = this._getController(type);
    if (controller) {
      return controller.getFeatureFlag(type);
    }
    return DEFAULT_FEATURE_FLAG;
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    const controller = this._getController(type);
    if (controller) {
      return controller.hasPermission(type);
    }
    return false;
  }

  private async _refreshPermissions() {
    const permissions = await this._getAllPermissions();
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const id = userConfig.getGlipUserId();
    mainLogger.log(
      `user:${id}, refreshPermissions:${JSON.stringify(permissions)}`,
    );
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

  private _getController(type: UserPermissionType) {
    return this.controllers.find(con => {
      return con.isFlagSupported(type);
    });
  }
}

export { PermissionServiceHelper };
