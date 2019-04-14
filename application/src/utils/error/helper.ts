/*
 * @Author: Paynter Chen
 * @Date: 2019-04-02 15:59:05
 * Copyright © RingCentral. All rights reserved.
 */
import { AccountUserConfig } from 'sdk/module/account/config';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import pkg from '../../../package.json';
import { UserContextInfo } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';

export async function getAppContextInfo(): Promise<UserContextInfo> {
  const config = require('@/config').default;
  const accountUserConfig = new AccountUserConfig();
  const currentUserId = accountUserConfig.getGlipUserId();
  const currentCompanyId = accountUserConfig.getCurrentCompanyId();
  return Promise.all([
    ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).getCurrentUserInfo(),
    fetchVersionInfo(),
  ]).then(([userInfo, { deployedVersion }]) => {
    const { display_name = '', email = '' } = userInfo || {};
    return {
      email,
      username: display_name,
      id: currentUserId,
      companyId: currentCompanyId,
      env: config.getEnv(),
      version: deployedVersion || pkg.version,
      url: location.href,
      environment: window.jupiterElectron ? 'Electron' : 'Browser',
    };
  });
}
