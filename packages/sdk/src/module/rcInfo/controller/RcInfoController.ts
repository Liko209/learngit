/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-02-18 15:04:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  RcInfoDao,
  RC_CLIENT_INFO,
  RC_ACCOUNT_INFO,
  RC_EXTENSION_INFO,
  RC_ROLE_PERMISSION,
} from '../dao';
import { daoManager, ConfigDao } from '../../../dao';
import {
  ACCOUNT_TYPE,
  ACCOUNT_TYPE_ENUM,
} from '../../../authenticator/constants';
import { RcInfoApi } from '../../../api/ringcentral/RcInfoApi';

class RcInfoController {
  private _rcInfoDao: RcInfoDao;
  constructor() {
    this._rcInfoDao = daoManager.getKVDao(RcInfoDao);
  }

  async requestRcInfo() {
    const configDao = daoManager.getKVDao(ConfigDao);
    const accountType = configDao.get(ACCOUNT_TYPE);
    if (accountType === ACCOUNT_TYPE_ENUM.RC) {
      this.requestRcClientInfo();
      this.requestRcAccountInfo();
      this.requestRcExtensionInfo();
      this.requestRcRolePermission();
    }
  }

  async requestRcClientInfo() {
    const result = await RcInfoApi.requestRcClientInfo();
    this._rcInfoDao.put(RC_CLIENT_INFO, result);
  }

  async requestRcAccountInfo() {
    const result = await RcInfoApi.requestRcAccountInfo();
    this._rcInfoDao.put(RC_ACCOUNT_INFO, result);
  }

  async requestRcExtensionInfo() {
    const result = await RcInfoApi.requestRcExtensionInfo();
    this._rcInfoDao.put(RC_EXTENSION_INFO, result);
  }

  async requestRcRolePermission() {
    const result = await RcInfoApi.requestRcRolePermission();
    this._rcInfoDao.put(RC_ROLE_PERMISSION, result);
  }
}

export { RcInfoController };
