/*
 * @Author: Paynter Chen
 * @Date: 2019-04-02 15:59:05
 * Copyright © RingCentral. All rights reserved.
 */
import { AccountService } from 'sdk/module/account';
import { AccountUserConfig } from 'sdk/module/account/config';
import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import pkg from '../../../package.json';
import { UserContextInfo } from './types';

export async function getAppContextInfo(): Promise<UserContextInfo> {
  const config = require('@/config').default;
  const accountUserConfig = new AccountUserConfig();
  const currentUserId = accountUserConfig.getGlipUserId();
  const currentCompanyId = accountUserConfig.getCurrentCompanyId();
  return Promise.all([
    AccountService.getInstance().getCurrentUserInfo(),
    fetchVersionInfo(),
  ]).then(([userInfo, { deployedVersion }]) => {
    return {
      id: currentUserId,
      username: userInfo['display_name'],
      email: userInfo['email'],
      companyId: currentCompanyId,
      env: config.getEnv(),
      version: deployedVersion || pkg.version,
      url: location.href,
      environment: window.jupiterElectron ? 'Electron' : 'Browser',
    };
  });
}
