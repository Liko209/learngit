/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 14:23:46
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IPermissionController,
  UserPermissionType,
  AbstractPermissionController,
} from 'sdk/module/permission';
import { SplitIODefaultPermissions } from './SplitIOFlagList';
import { SplitIOClient } from './SplitIOClient';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { Api } from 'sdk/api';
import { mainLogger } from 'foundation/log';
import { EnvConfig } from 'sdk/module/env/config';
import { AccountGlobalConfig } from 'sdk/module/account/config';

class SplitIOController extends AbstractPermissionController
  implements IPermissionController {
  private splitIOClient: SplitIOClient;
  private splitIOUpdateCallback: any = undefined;

  setCallback(callback: () => void) {
    this.splitIOUpdateCallback = callback;
  }

  shutdownClient(shouldClearCache: boolean) {
    this.isClientReady = false;
    this.splitIOClient && this.splitIOClient.shutdown(shouldClearCache);
  }
  initClient() {
    if (this.isIniting) {
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
    const isRunningE2E = EnvConfig.getIsRunningE2E();
    if (clientSecret && !isRunningE2E) {
      this.splitIOClient = new SplitIOClient(params);
    }
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return this.isClientReady
      ? this.splitIOClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  async getFeatureFlag(type: UserPermissionType): Promise<number | string> {
    if (this.isClientReady) {
      return this.splitIOClient.getFeatureFlag(type);
    }
    return this._defaultFeatureFlag(type);
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
