/*
 * @Author: Paynter Chen
 * @Date: 2019-04-02 15:59:05
 * Copyright © RingCentral. All rights reserved.
 */

import { fetchVersionInfo } from '@/containers/VersionInfo/helper';
import pkg from '../../../package.json';
import { UserContextInfo } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import { UAParser } from 'ua-parser-js';
const uaParser = new UAParser(navigator.userAgent);

export async function getAppContextInfo(): Promise<UserContextInfo> {
  const config = require('@/config').default;
  const accountService = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  );
  const accountUserConfig = accountService.userConfig;
  const currentUserId = accountUserConfig.getGlipUserId();
  const currentCompanyId = accountUserConfig.getCurrentCompanyId();
  return Promise.all([
    accountService.getCurrentUserInfo(),
    fetchVersionInfo(),
  ]).then(([userInfo, { deployedVersion }]) => {
    const { display_name = '', email = '' } = userInfo || {};
    const {
      name: browserName,
      version: browserVersion,
    } = uaParser.getBrowser();
    const { name: osName, version: osVersion } = uaParser.getOS();
    return {
      email,
      username: display_name,
      id: currentUserId,
      companyId: currentCompanyId,
      env: config.getEnv(),
      version: deployedVersion || pkg.version,
      url: location.href,
      platform: window.jupiterElectron ? 'Desktop' : 'Web',
      browser: `${browserName} - ${browserVersion}`,
      os: `${osName} - ${osVersion}`,
    };
  });
}
