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
import { daoManager } from '../../../dao';
import { RcInfoApi } from '../../../api/ringcentral/RcInfo';

class RcInfoController {
  private _rcInfoDao: RcInfoDao;
  constructor() {
    this._rcInfoDao = daoManager.getKVDao(RcInfoDao);
  }

  async requestRcInfo() {
    this.requestRcClientInfo();
    this.requestRcAccountInfo();
    this.requestRcExtensionInfo();
    this.requestRcRolePermission();
  }

  async requestRcClientInfo() {
    const result = await RcInfoApi.requestRcClientInfo();
    const data = result.expect('Failed to get rc client info.');
    this._rcInfoDao.put(RC_CLIENT_INFO, data);
  }

  async requestRcAccountInfo() {
    const result = await RcInfoApi.requestRcAccountInfo();
    const data = result.expect('Failed to get rc account info.');
    this._rcInfoDao.put(RC_ACCOUNT_INFO, data);
  }

  async requestRcExtensionInfo() {
    const result = await RcInfoApi.requestRcExtensionInfo();
    const data = result.expect('Failed to get rc extension info.');
    this._rcInfoDao.put(RC_EXTENSION_INFO, data);
  }

  async requestRcRolePermission() {
    const result = await RcInfoApi.requestRcRolePermission();
    const data = result.expect('Failed to get rc role permission info.');
    this._rcInfoDao.put(RC_ROLE_PERMISSION, data);
  }
}

export { RcInfoController };
