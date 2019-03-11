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
import LDClient, { LDUser, LDFlagSet } from 'ldclient-js';
import UserPermissionType from '../../types';
class LaunchDarklyClient {
  private _ldclient: any;
  private _flags: LDFlagSet;
  constructor(options: Options) {
    this._initLDClient(options);
  }

  hasPermission(type: UserPermissionType) {
    return this._flags && !!this._flags[type];
  }

  private _initLDClient(options: Options) {
    this._ldclient = LDClient.initialize(options.clientId, options.user);
    this._ldclient.on('change', (settings: LDFlagSet) => {
      this._flags = this._ldclient.allFlags();
      options.updateCallback(settings);
    });
    this._ldclient.on('ready', () => {
      this._flags = this._ldclient.allFlags();
      options.readyCallback();
    });
  }
}

export { LaunchDarklyClient };
