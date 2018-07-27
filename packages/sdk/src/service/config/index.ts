/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-05-23 10:19:27
 * Copyright © RingCentral. All rights reserved.
 */
import BaseService from '../BaseService';
import AuthService from '../auth';
import { daoManager, ConfigDao } from '../../dao';
import { SERVICE } from '../eventKey';
import { handleLogout } from './handleData';
import { LAST_INDEX_TIMESTAMP } from '../../dao/config/constants';

export default class ConfigService extends BaseService {
  static serviceName = 'ConfigService';
  private _authService: AuthService;
  constructor(authService: AuthService) {
    const subscriptions = {
      [SERVICE.LOGOUT]: handleLogout
    };
    super(ConfigDao, null, null, subscriptions);
    this._authService = authService;
  }

  getEnv() {
    const configDao = daoManager.getKVDao(ConfigDao);
    return configDao.getEnv();
  }

  getLastIndexTimestamp() {
    const configDao = daoManager.getKVDao(ConfigDao);
    return configDao.get(LAST_INDEX_TIMESTAMP);
  }

  async switchEnv(env: string): Promise<void> {
    const configDao = daoManager.getKVDao(ConfigDao);
    const oldEnv = configDao.getEnv();

    if (oldEnv === env) return;

    // if oldEnv existed, then logout to clear old data.
    if (oldEnv) {
      await this._authService.logout();
    }

    configDao.putEnv(env);
    sessionStorage.setItem('env', env);
  }
}
