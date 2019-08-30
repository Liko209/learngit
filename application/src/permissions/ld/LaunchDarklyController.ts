/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 14:01:55
 * Copyright © RingCentral. All rights reserved.
 */
import {
  IPermissionController,
  UserPermissionType,
  AbstractPermissionController
} from 'sdk/module/permission';
import { LaunchDarklyDefaultPermissions } from './LaunchDarklyFlagList';
import { LaunchDarklyClient } from './LaunchDarklyClient';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { Api } from 'sdk/api';
import { EnvConfig } from 'sdk/module/env/config';
import { mainLogger } from 'foundation/log';
import { PersonService } from 'sdk/module/person';

class LaunchDarklyController extends AbstractPermissionController
  implements IPermissionController {
  private launchDarklyClient: LaunchDarklyClient;
  private launchDarklyCallback: any = undefined;
  constructor() {
    super();
  }

  setCallback(callback: () => void) {
    this.launchDarklyCallback = callback;
  }

  async initClient() {
    if (this.isIniting) {
      return;
    }
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    const userId: number = userConfig.getGlipUserId();
    if (!userId) {
      return;
    }
    this.isIniting = true;

    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const person = await personService.getById(userId);
    const host: string = window.location.host;
    const { clientId } = Api.httpConfig.launchdarkly;
    const params = {
      clientId,
      user: {
        key: `${userId}`,
        name: (person && person['display_name']) || '',
        email: (person && person['email']) || '',
        custom: {
          host,
          companyId: (person && person['company_id']) || '',
        },
      },
      readyCallback: (): void => {
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyreadyCallback');
      },
      updateCallback: (): void => {
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyUpdateCallback');
      },
    };
    const isRunningE2E = EnvConfig.getIsRunningE2E();
    if (clientId && !isRunningE2E) {
      this.launchDarklyClient = new LaunchDarklyClient(params);
    }
  }
  shutdownClient(shouldClearCache: boolean) {
    this.launchDarklyClient &&
      this.launchDarklyClient.shutdown(shouldClearCache);
    this.isIniting = false;
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return this._isClientFlagsReady()
      ? this.launchDarklyClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  async getFeatureFlag(type: UserPermissionType): Promise<number | string> {
    if (this._isClientFlagsReady()) {
      return this.launchDarklyClient.getFeatureFlag(type);
    }
    return this._defaultFeatureFlag(type);
  }

  isFlagSupported(type: UserPermissionType): boolean {
    // eslint disallows calling some Object.prototype methods directly on object instances
    return Object.prototype.hasOwnProperty.call(
      LaunchDarklyDefaultPermissions,
      type,
    );
  }

  private _isClientFlagsReady() {
    return this.launchDarklyClient && this.launchDarklyClient.hasFlags();
  }

  private _defaultPermission(type: UserPermissionType) {
    // change to boolean value
    return !!LaunchDarklyDefaultPermissions[type];
  }

  private _defaultFeatureFlag(type: UserPermissionType) {
    return LaunchDarklyDefaultPermissions[type];
  }
}

export { LaunchDarklyController };
