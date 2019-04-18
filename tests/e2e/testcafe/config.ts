/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-16 11:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

import { flattenGlobs, parseArgs, ConfigLoader } from './libs/utils';


dotenv.config();

const APP_ROOT = __dirname;
const CONFIGS_ROOT = path.join(APP_ROOT, 'configs');

const SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const DEBUG_MODE = !(process.env.DEBUG_MODE === 'false');
const QUARANTINE_MODE = (process.env.QUARANTINE_MODE === 'true');

const ENABLE_MOCK_SERVER = (process.env.ENABLE_MOCK_SERVER === 'true');
const MOCK_SERVER_URL = process.env.MOCK_SERVER_URL || "https://xmn02-i01-mck02.lab.nordigy.ru";
const MOCK_ENV = process.env.MOCK_ENV || 'XMN-MOCK';
const MOCK_AUTH_URL = process.env.MOCK_AUTH_URL || 'https://xmn02-i01-mck02.lab.nordigy.ru/jupiter/login/api/login';

const ENV_OPTS = {
  'XMN-UP': {
    ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9997',
    ACCOUNT_POOL_FOR_DEBUG_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9998',
    ACCOUNT_POOL_ENV: 'xmn-up',
    RC_PLATFORM_BASE_URL: 'https://api-xmnup.lab.nordigy.ru',
    GLIP_SERVER_BASE_URL: 'https://xmnup.asialab.glip.net',
    AUTH_URL: 'https://login-xmnup.lab.nordigy.ru/api/login',
    JUPITER_APP_KEY: 'YCWFuqW8T7-GtSTb6KBS6g',
    WEBPHONE_BASE_URL: 'http://webphone.lab.rcch.ringcentral.com',
    WEBPHONE_ENV: 'xmnup',
  },
  'GLP-CI1-XMN': {
    ACCOUNT_POOL_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9997',
    ACCOUNT_POOL_FOR_DEBUG_BASE_URL: 'http://xia01-i01-hbt02.lab.rcch.ringcentral.com:9998',
    ACCOUNT_POOL_ENV: 'glpci1xmn',
    RC_PLATFORM_BASE_URL: 'https://api-glpci1xmn.lab.nordigy.ru',
    GLIP_SERVER_BASE_URL: 'https://glpci1xmn.asialab.glip.net',
    AUTH_URL: 'https://login-glpci1xmn.lab.nordigy.ru/api/login',
    JUPITER_APP_KEY: 'YCWFuqW8T7-GtSTb6KBS6g',
    WEBPHONE_BASE_URL: 'http://webphone.lab.rcch.ringcentral.com',
    WEBPHONE_ENV: 'glpci1xmn',
  },
}[SITE_ENV];

ENV_OPTS.RC_PLATFORM_APP_KEY = process.env.RC_PLATFORM_APP_KEY || '';
ENV_OPTS.RC_PLATFORM_APP_SECRET = process.env.RC_PLATFORM_APP_SECRET || '';

const TMPFILE_PATH = process.env.TMPFILE_PATH || '/tmp';

const configLoader = new ConfigLoader(
  (process.env.BRANCH || ''),
  (process.env.ACTION || '').toLocaleLowerCase(),
  CONFIGS_ROOT,
);

configLoader.load();

const LANGUAGE_CODE = process.env.LANGUAGE_CODE || 'en' // ref: https://www.w3schools.com/tags/ref_language_codes.asp
const REPORTER = process.env.REPORTER || 'spec';
const SCREENSHOTS_PATH = path.join(process.env.SCREENSHOTS_PATH || '/tmp', LANGUAGE_CODE);
const SCREENSHOT_ON_FAIL = !(process.env.SCREENSHOT_ON_FAIL === 'false');
const SCREENSHOT_WEBP_QUALITY = Number(process.env.SCREENSHOT_WEBP_QUALITY || '50');
const CONCURRENCY = Number(process.env.CONCURRENCY || '1');
const SHUFFLE_FIXTURES = process.env.SHUFFLE_FIXTURES === 'true';
const FIXTURES = flattenGlobs(process.env.FIXTURES ? parseArgs(process.env.FIXTURES) : configLoader.fixtures, SHUFFLE_FIXTURES);
const BROWSERS = process.env.BROWSERS ? parseArgs(process.env.BROWSERS) : configLoader.browsers;
const INCLUDE_TAGS = process.env.INCLUDE_TAGS ? parseArgs(process.env.INCLUDE_TAGS) : configLoader.includeTags;
const EXCLUDE_TAGS = process.env.EXCLUDE_TAGS ? parseArgs(process.env.EXCLUDE_TAGS) : configLoader.excludeTags;
const STOP_ON_FIRST_FAIL = process.env.STOP_ON_FIRST_FAIL === 'true';
const MAX_RESOLUTION = (process.env.MAX_RESOLUTION || '1280x720').split('x').map(n => parseInt(n, 10));
const ASSERTION_TIMEOUT = Number(process.env.ASSERTION_TIMEOUT) || 8e3;
const SKIP_JS_ERROR = !(process.env.SKIP_JS_ERROR === 'false');
const SKIP_CONSOLE_ERROR = !(process.env.SKIP_CONSOLE_ERROR === 'false');
const SKIP_CONSOLE_WARN = !(process.env.SKIP_CONSOLE_WARN === 'false');
const ENABLE_SSL = process.env.ENABLE_SSL === 'true';
const SELENIUM_CAPABILITIES = process.env.SELENIUM_CAPABILITIES || 'capabilities.json' // ref: https://github.com/link89/testcafe-browser-provider-selenium/tree/customize-chrome-option


const RUNNER_OPTS = {
  REPORTER,
  SCREENSHOT_ON_FAIL,
  SCREENSHOTS_PATH,
  SCREENSHOT_WEBP_QUALITY,
  CONCURRENCY,
  FIXTURES,
  BROWSERS,
  INCLUDE_TAGS,
  EXCLUDE_TAGS,
  QUARANTINE_MODE,
  STOP_ON_FIRST_FAIL,
  MAX_RESOLUTION,
  ASSERTION_TIMEOUT,
  SKIP_JS_ERROR,
  SKIP_CONSOLE_ERROR,
  SKIP_CONSOLE_WARN,
  ENABLE_SSL,
  SELENIUM_CAPABILITIES,
  LANGUAGE_CODE,
}

// beat dashboard configuration
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || "0abc8d1aa7f81eb3f501bc5147853161acbb860e";
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://xia01-i01-dsb02.lab.rcch.ringcentral.com:8000/api/v1";
const ENABLE_REMOTE_DASHBOARD = (process.env.ENABLE_REMOTE_DASHBOARD === 'true');
const RUN_NAME = process.env.RUN_NAME || `[Jupiter][Debug][${new Date().toLocaleString()}]`;

enum BrandTire {
  "RCOFFICE" = "kamino(Fiji,Jupiter,1210,4488)",
  "RC_PROFESSIONAL_TIER" = "kamino(Fiji,Jupiter,1210,4442)",
  "RC_FIJI_GUEST" = "kamino(Fiji-with-guest,Jupiter,1210,4488)",
  "RC_USERS_20" = "kamino(FIJI-Users-20,Jupiter,1210,4488)"
};

const WebphoneConfig = {
  TTL: 1800000,
  reserve: false,
}

export {
  APP_ROOT,
  TMPFILE_PATH,
  CONFIGS_ROOT,
  DEBUG_MODE,
  SITE_ENV,
  SITE_URL,
  ENV_OPTS,
  RUNNER_OPTS,
  DASHBOARD_API_KEY,
  ENABLE_REMOTE_DASHBOARD,
  DASHBOARD_URL,
  RUN_NAME,
  BrandTire,
  WebphoneConfig,
  ENABLE_MOCK_SERVER,
  MOCK_SERVER_URL,
  MOCK_ENV,
  MOCK_AUTH_URL,
};
