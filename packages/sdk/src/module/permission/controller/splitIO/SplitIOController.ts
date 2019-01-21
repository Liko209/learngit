/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-21 13:27:24
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../../../service/account/UserConfig';
import { SplitIOClient } from './SplitIOClient';
import UserPermissionType from '../../types';
import { Api } from '../../../../api';
import SplitIODefaultPermissions from './SplitIODefaultPermissions';

class SplitIOController {
  private splitIOClient: SplitIOClient;
  private isClientReady: boolean = false;
  constructor(callback: () => void) {
    this._initClient(callback);
  }

  async hasPermission(type: UserPermissionType): Promise<boolean> {
    return this.isClientReady
      ? this.splitIOClient.hasPermission(type)
      : this._defaultPermission(type);
  }

  private _defaultPermission(type: UserPermissionType) {
    return !!SplitIODefaultPermissions[type];
  }

  private _initClient(callback: () => void) {
    const userId: number = UserConfig.getCurrentUserId();
    const companyId: number = UserConfig.getCurrentCompanyId();
    if (!userId && !companyId) {
      return;
    }
    const params = {
      userId: userId.toString(),
      attributes: {
        companyId,
      },
      authKey: Api.httpConfig.splitio.clientSecret,
      permissions: Object.keys(SplitIODefaultPermissions),
      splitIOReady: (isReady: boolean): void => {
        this.isClientReady = isReady;
        callback();
      },
      splitIOUpdate: (): void => {
        callback();
      },
    };
    this.splitIOClient = new SplitIOClient(params);
  }
}

export { SplitIOController };
