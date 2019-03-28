/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-11-15 13:06:31
 * Copyright © RingCentral. All rights reserved.
 */

import BaseService from '../BaseService';
import AuthService from '../auth';
import { SERVICE } from '../eventKey';
import { handleLogout } from './handleData';
import { NewGlobalConfig } from './NewGlobalConfig';

export default class ConfigService extends BaseService {
  static serviceName = 'ConfigService';
  private _authService: AuthService;
  constructor(authService: AuthService) {
    const subscriptions = {
      [SERVICE.LOGOUT]: handleLogout,
    };
    super(null, null, null, subscriptions);
    this._authService = authService;
  }

  getEnv() {
    return NewGlobalConfig.getEnv();
  }

  getStaticHttpServer() {
    return NewGlobalConfig.getStaticHttpServer();
  }

  async switchEnv(env: string): Promise<boolean> {
    const oldEnv = NewGlobalConfig.getEnv();

    if (oldEnv === env) return false;

    // if oldEnv existed, then logout to clear old data.
    if (oldEnv) {
      await this._authService.logout();
    }

    NewGlobalConfig.setEnv(env);
    sessionStorage.setItem('env', env);

    return true;
  }
}

export { ConfigService };
