/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:27:24
 * Copyright © RingCentral. All rights reserved.
 */

import { SplitIOClient } from './SplitIOClient';
import UserPermissionType from '../../types';
import { Api } from '../../../../api';
import SplitIODefaultPermissions from './SplitIODefaultPermissions';
import { notificationCenter, SERVICE } from '../../../../service';
import { mainLogger } from 'foundation';
import { AccountService } from '../../../account/service';
import { PersonService } from '../../../person';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { EnvConfig } from 'sdk/module/env/config';

class SplitIOController {
  private splitIOClient: SplitIOClient;
  private isClientReady: boolean = false;
  private isIniting = false;
  private splitIOUpdateCallback: () => void;
  constructor(callback: () => void) {
    this.splitIOUpdateCallback = callback;
    this._subscribeNotifications();
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

  private _subscribeNotifications() {
    notificationCenter.on(SERVICE.GLIP_LOGIN, async () => {
      await this._initClient();
    });
    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, async () => {
      await this._initClient();
    });
    window.addEventListener('unload', () => {
      this._shutdownClient();
    });
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this._shutdownClient();
    });
  }

  private _shutdownClient() {
    this.splitIOClient && this.splitIOClient.shutdown();
    this.isClientReady = false;
    this.isIniting = false;
  }

  private _defaultPermission(type: UserPermissionType) {
    return !!SplitIODefaultPermissions[type];
  }

  private _defaultFeatureFlag(type: UserPermissionType) {
    return SplitIODefaultPermissions[type];
  }

  private async _initClient() {
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
      userId: userId.toString(),
      attributes: {
        companyId: (person && person['company_id']) || '',
        name: (person && person['display_name']) || '',
        email: (person && person['email']) || '',
      },
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
}

export { SplitIOController };
