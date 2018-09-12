/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-16 11:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const APP_ROOT = __dirname;
const CONFIGS_ROOT = path.join(APP_ROOT, 'configs');

import { ExecutionStrategiesHelper } from './libs/utils';

const RC_PLATFORM_APP_KEY = process.env.RC_PLATFORM_APP_KEY || '';
const RC_PLATFORM_APP_SECRET = process.env.RC_PLATFORM_APP_SECRET || '';

const SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const DEBUG = (process.env.DEBUG === 'true');
const QUARANTINEMODE = ((process.env.QUARANTINEMODE || 'true') === 'true');

const ENV = {
  'XMN-UP': {
    ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9997',
    ACCOUNT_POOL_FOR_DEBUG_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9998',
    ACCOUNT_POOL_ENV: 'xmn-up',
    RC_PLATFORM_BASE_URL: 'https://api-xmnup.lab.nordigy.ru',
    GLIP_SERVER_BASE_URL: 'https://xmnup.asialab.glip.net',
    AUTH_URL: 'https://login-xmnup.lab.nordigy.ru/api/login',
    JUPITER_APP_KEY: 'FVKGRbLRTxGxPempqg5f9g',
  },
}[SITE_ENV];

const SDK_ENV = {
  'XMN-UP': {
    rc: {
      server: 'https://api-xmnup.lab.nordigy.ru',
      apiPlatform: '/restapi',
      clientId: 'FVKGRbLRTxGxPempqg5f9g',
      clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
      redirectUri: 'glip://rclogin',
    },
    glip2: {
      server: 'https://api-xmnup.lab.nordigy.ru',
      apiPlatform: '/restapi',
      clientId: 'FVKGRbLRTxGxPempqg5f9g',
      clientSecret: 'bkUvnRtBQeCLi2n3EEwczQqv-HRcJmRbG4ec4pHI9wiQ',
      redirectUri: '${deployHost}/unified-login/',
      brandId: 1210,
    },
    glip: {
      server: 'https://xmnup.asialab.glip.net',
      apiPlatform: '/api',
    },
    glip_desktop: {
      server: 'https://xmnup.asialab.glip.net',
      apiPlatformVersion: 'v1.0',
      apiPlatform: '/desktop',
    },
    upload: {
      server: 'https://xmnup.asialab.glip.net:8443',
      apiPlatform: '',
    },
  },
}[SITE_ENV];

const EXECUTION_STRATEGIES_HELPER = new ExecutionStrategiesHelper(
  process.env.BRANCH || '',
  process.env.ACTION || '',
  CONFIGS_ROOT,
);
EXECUTION_STRATEGIES_HELPER.loadConfig();

export {
  APP_ROOT,
  CONFIGS_ROOT,
  RC_PLATFORM_APP_KEY,
  RC_PLATFORM_APP_SECRET,
  SITE_ENV,
  SITE_URL,
  ENV,
  SDK_ENV,
  EXECUTION_STRATEGIES_HELPER,
  DEBUG,
  QUARANTINEMODE,
};
