/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-02-18 14:54:09
 * Copyright © RingCentral. All rights reserved.
 */
type Options = {
  clientId: string;
  user: LDUser;
  readyCallback: () => void;
  updateCallback: (settings: LDFlagSet) => void;
};
import { initialize, LDUser, LDFlagSet } from 'launchdarkly-js-client-sdk';
import UserPermissionType from '../../types';
import { mainLogger } from 'foundation';

class LaunchDarklyClient {
  private _ldclient: any;
  private _flags: LDFlagSet = {};
  constructor(options: Options) {
    this._initLDClient(options);
  }

  hasPermission(type: UserPermissionType) {
    return this._flags && !!this._flags[type];
  }

  hasFlags() {
    return this._flags && Object.keys(this._flags).length > 0;
  }

  shutdown() {
    this._ldclient && this._ldclient.off('change');
    this._ldclient && this._ldclient.off('ready');
    this._ldclient && this._ldclient.setStreaming(false);
  }

  private _initLDClient(options: Options) {
    this._ldclient = initialize(options.clientId, options.user, {
      streaming: true,
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
  }
}

export { LaunchDarklyClient };
