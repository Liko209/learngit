/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-22 14:01:55
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractPermissionController } from '../AbstractPermissionController';
import {
  IPermissionController,
  UserPermissionType,
} from 'sdk/module/permission';
import { LaunchDarklyDefaultPermissions } from './LaunchDarklyFlagList';
import { LaunchDarklyClient } from './LaunchDarklyClient';
import { ServiceLoader, ServiceConfig } from 'sdk/src/module/serviceLoader';
import { AccountService } from 'sdk/src/module/account';
import { Api } from 'sdk/src/api';
import { EnvConfig } from 'sdk/src/module/env/config';
import { mainLogger } from 'sdk/src';
import { PersonService } from 'sdk/src/module/person';

class LaunchDarklyController extends AbstractPermissionController
  implements IPermissionController {
  private launchDarklyClient: LaunchDarklyClient;
  private launchDarklyCallback: any = undefined;
  constructor() {
    super();
  }

  async initClient() {
    if (this.isIniting || this.isClientReady) {
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

    const params = {
      clientId: Api.httpConfig.launchdarkly.clientId,
      user: {
        key: `${userId}`,
        name: (person && person['display_name']) || '',
        email: (person && person['email']) || '',
        custom: {
          companyId: (person && person['company_id']) || '',
        },
      },
      readyCallback: (): void => {
        this.isClientReady = true;
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyreadyCallback');
      },
      updateCallback: (): void => {
        this.isClientReady = true;
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyUpdateCallback');
      },
    };
    const { clientId } = Api.httpConfig.launchdarkly;
    const disableLD = EnvConfig.getDisableLD();
    if (clientId && !disableLD) {
      this.launchDarklyClient = new LaunchDarklyClient(params);
    }
  }
  shutdownClient() {
    this.launchDarklyClient && this.launchDarklyClient.shutdown();
    this.isClientReady = false;
    this.isIniting = false;
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return this.isClientReady
      ? this.launchDarklyClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  async getFeatureFlag(type: UserPermissionType): Promise<number | string> {
    return (
      (this.isClientReady && this.launchDarklyClient.getFeatureFlag(type)) ||
      this._defaultFeatureFlag(type)
    );
  }

  isFlagSupported(type: UserPermissionType): boolean {
    // eslint disallows calling some Object.prototype methods directly on object instances
    return Object.prototype.hasOwnProperty.call(
      LaunchDarklyDefaultPermissions,
      type,
    );
  }

  private _defaultPermission(type: UserPermissionType) {
    return LaunchDarklyDefaultPermissions[type];
  }

  private _defaultFeatureFlag(type: UserPermissionType) {
    return LaunchDarklyDefaultPermissions[type];
  }
}

export { LaunchDarklyController };
