/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 14:23:46
 * Copyright © RingCentral. All rights reserved.
 */

import { AbstractPermissionController } from '../AbstractPermissionController';
import {
  IPermissionController,
  UserPermissionType,
} from 'sdk/module/permission';
import { SplitIODefaultPermissions } from './SplitIOFlagList';
import { SplitIOClient } from './SplitIOClient';
import { ServiceLoader, ServiceConfig } from 'sdk/src/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { Api } from 'sdk/api';
import { mainLogger } from 'sdk';
import { EnvConfig } from 'sdk/src/module/env/config';
import { AccountGlobalConfig } from 'sdk/src/module/account/config';

class SplitIOController extends AbstractPermissionController
  implements IPermissionController {
  private splitIOClient: SplitIOClient;
  private splitIOUpdateCallback: any = undefined;

  setCallback(callback: () => void) {
    this.splitIOUpdateCallback = callback;
  }

  shutdownClient() {
    this.splitIOClient && this.splitIOClient.shutdown();
  }
  initClient() {
    if (this.isIniting || this.isClientReady) {
      return;
    }
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const userId: number = userConfig.getGlipUserId();
    const prefix = AccountGlobalConfig.getUserDictionary();
    if (!userId) {
      return;
    }
    this.isIniting = true;

    const params = {
      prefix,
      userId: userId.toString(),
      attributes: {},
      authKey: Api.httpConfig.splitio.clientSecret,
      permissions: Object.keys(SplitIODefaultPermissions),
      splitIOReady: (): void => {
        this.isClientReady = true;
        this.splitIOUpdateCallback && this.splitIOUpdateCallback();
        mainLogger.log('incoming event splitIOReady');
      },
      splitIOUpdate: (): void => {
        this.splitIOUpdateCallback && this.splitIOUpdateCallback();
        mainLogger.log('incoming event splitIOUpdate');
      },
    };
    const { clientSecret } = Api.httpConfig.splitio;
    const disableLD = EnvConfig.getDisableLD();
    if (clientSecret && !disableLD) {
      this.splitIOClient = new SplitIOClient(params);
    }
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return this.isClientReady
      ? this.splitIOClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  async getFeatureFlag(type: UserPermissionType): Promise<number | string> {
    return (
      (this.isClientReady && this.splitIOClient.getFeatureFlag(type)) ||
      this._defaultFeatureFlag(type)
    );
  }

  isFlagSupported(type: UserPermissionType): boolean {
    return Object.prototype.hasOwnProperty.call(
      SplitIODefaultPermissions,
      type,
    );
  }

  private _defaultPermission(type: UserPermissionType) {
    return !!SplitIODefaultPermissions[type];
  }

  private _defaultFeatureFlag(type: UserPermissionType) {
    return SplitIODefaultPermissions[type];
  }
}

export { SplitIOController };
