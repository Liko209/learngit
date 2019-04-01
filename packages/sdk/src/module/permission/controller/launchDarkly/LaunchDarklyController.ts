/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-18 14:53:34
 * Copyright © RingCentral. All rights reserved.
 */

import { LaunchDarklyClient } from './LaunchDarklyClient';
import { notificationCenter, SERVICE } from '../../../../service';
import { AccountUserConfig } from '../../../../service/account/config';
import { LaunchDarklyDefaultPermissions } from './LaunchDarklyDefaultPermissions';
import UserPermissionType from '../../types';
import { LDFlagSet } from 'ldclient-js';
import { mainLogger } from 'foundation';
import { Api } from '../../../../api';

class LaunchDarklyController {
  private isClientReady = false;
  private launchDarklyClient: LaunchDarklyClient;
  private launchDarklyCallback: () => void;
  constructor(updateCallback: () => void) {
    this.launchDarklyCallback = updateCallback;
    this._subscribeNotifications();
  }

  hasPermission(type: UserPermissionType): boolean {
    return this.isClientReady
      ? this.launchDarklyClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  private _defaultPermission(type: UserPermissionType) {
    return !!LaunchDarklyDefaultPermissions[type];
  }

  private _subscribeNotifications() {
    notificationCenter.on(SERVICE.LOGIN, () => {
      this._initClient();
    });
    notificationCenter.on(SERVICE.FETCH_INDEX_DATA_DONE, () => {
      this._initClient();
    });
    window.addEventListener('unload', () => {
      this._shutdownClient();
    });
    notificationCenter.on(SERVICE.LOGOUT, () => {
      this._shutdownClient();
    });
  }
  private _shutdownClient() {
    this.launchDarklyClient && this.launchDarklyClient.shutdown();
    this.isClientReady = false;
  }
  private _initClient() {
    if (this.isClientReady) {
      return;
    }
    const userConfig = new AccountUserConfig();
    const userId: number = userConfig.getGlipUserId();
    const companyId: number = userConfig.getCurrentCompanyId();
    if (!userId || !companyId) {
      return;
    }
    const params = {
      clientId: Api.httpConfig.launchdarkly.clientId,
      user: {
        key: `${userId}`,
        custom: {
          companyId,
        },
      },
      readyCallback: (): void => {
        this.isClientReady = true;
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyreadyCallback');
      },
      updateCallback: (settings: LDFlagSet): void => {
        this.launchDarklyCallback && this.launchDarklyCallback();
        mainLogger.log('incoming event launchDarklyUpdateCallback');
      },
    };
    this.launchDarklyClient = new LaunchDarklyClient(params);
  }
}

export { LaunchDarklyController };
