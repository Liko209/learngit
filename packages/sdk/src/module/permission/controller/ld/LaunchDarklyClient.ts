/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-18 14:54:09
 * Copyright © RingCentral. All rights reserved.
 */
import {
  initialize,
  LDUser,
  LDFlagSet,
  LDClient,
} from 'launchdarkly-js-client-sdk';
import { UserPermissionType } from 'sdk/module/permission';
import { mainLogger } from 'foundation/log';

type Options = {
  clientId: string;
  user: LDUser;
  readyCallback: () => void;
  updateCallback: (settings: LDFlagSet) => void;
};

class LaunchDarklyClient {
  private _ldclient: LDClient;
  private _flags: LDFlagSet = {};
  constructor(options: Options) {
    this._initLDClient(options);
  }

  hasPermission(type: UserPermissionType) {
    return this._flags && !!this._flags[type];
  }

  getFeatureFlag(type: UserPermissionType) {
    return this._flags && this._flags[type];
  }

  hasFlags() {
    return this._flags && Object.keys(this._flags).length > 0;
  }

  shutdown(shouldClearCache: boolean) {
    if (this._ldclient) {
      this._flags = {};
      this._ldclient.off('change', () => {});
      this._ldclient.off('ready', () => {});
      this._ldclient.setStreaming(false);
      shouldClearCache && this._deleteLocalCache();
    }
  }
  private _deleteLocalCache() {
    const ldReg = /^ld:[a-zA-Z0-9]+:[a-zA-Z0-9]+/;
    Object.keys(localStorage).map(key => {
      if (ldReg.test(key)) {
        localStorage.removeItem(key);
        mainLogger.log('delete launchDarkly cache data', key);
      }
    });
  }

  private _initLDClient(options: Options) {
    this._ldclient = initialize(options.clientId, options.user, {
      streaming: true,
      bootstrap: 'localStorage',
    });
    this._ldclient.on('change', (settings: LDFlagSet) => {
      this._flags = this._ldclient.allFlags();
      mainLogger.log('launchDarkly change event flags', this._flags);
      options.updateCallback(settings);
    });
    this._ldclient.on('ready', () => {
      this._flags = this._ldclient.allFlags();
      mainLogger.log('launchDarkly ready event flags', this._flags);
      options.readyCallback();
    });
    this._ldclient.on('failed', () => {
      mainLogger.log('launchDarkly init failed');
    });
    this._ldclient.on('error', () => {
      mainLogger.log('launchDarkly init error');
    });
  }
}

export { LaunchDarklyClient };
