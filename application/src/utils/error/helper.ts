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
import { mainLogger } from 'foundation/log';
import { getClientId } from 'sdk/module/log/utils';

const uaParser = new UAParser(navigator.userAgent);
const TAG = '[AppContextInfo]';


export async function getApplicationInfo() {
  const config = await import('@/config');
  const { deployedVersion } = await fetchVersionInfo();
  const {
    name: browserName,
    version: browserVersion,
  } = uaParser.getBrowser();
  const { name: osName, version: osVersion } = uaParser.getOS();
  return {
    env: config.default.getEnv(),
    version: deployedVersion || pkg.version,
    url: window.location.href,
    platform: window.jupiterElectron ? 'Desktop' : 'Web',
    browser: `${browserName} - ${browserVersion}`,
    os: `${osName} - ${osVersion}`,
    clientId: getClientId(),
  }
}

export async function getAppContextInfo(): Promise<UserContextInfo> {
  // const config = await import('@/config');
  const accountService = ServiceLoader.getInstance<AccountService>(
    ServiceConfig.ACCOUNT_SERVICE,
  );
  const accountUserConfig = accountService.userConfig;
  let currentUserId: number;
  let currentCompanyId: number;
  try {
    currentUserId = accountUserConfig.getGlipUserId();
    currentCompanyId = accountUserConfig.getCurrentCompanyId();
  } catch {
    mainLogger.tags(TAG).info('get user info FAILED');
  }

  return Promise.all([
    accountService.getCurrentUserInfo(),
    getApplicationInfo(),
  ]).then(([userInfo, applicationInfo]) => {
    const { display_name = '', email = '' } = userInfo || {};
    return {
      ...applicationInfo,
      email,
      username: display_name,
      id: currentUserId,
      companyId: currentCompanyId,
    };
  });
}
