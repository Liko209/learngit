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
    GLIP_SERVER_BASE_URL: 'https://api-xmnup.asialab.glip.net',
    AUTH_URL: 'https://login-xmnup.lab.nordigy.ru/api/login',
    JUPITER_APP_KEY: 'YCWFuqW8T7-GtSTb6KBS6g',
    WEBPHONE_BASE_URL: 'https://jupiter-webphone.lab.rcch.ringcentral.com',
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
    WEBPHONE_BASE_URL: 'https://jupiter-webphone.lab.rcch.ringcentral.com',
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

const TESTCAFE_HOST = process.env.TESTCAFE_HOST;
const LANGUAGE_CODE = process.env.LANGUAGE_CODE || 'en' // ref: https://www.w3schools.com/tags/ref_language_codes.asp
const REPORTER = process.env.REPORTER || 'spec';
const SCREENSHOTS_PATH = path.join(process.env.SCREENSHOTS_PATH || '/tmp', LANGUAGE_CODE);
const SCREENSHOT_ON_FAIL = !(process.env.SCREENSHOT_ON_FAIL === 'false');
const SCREENSHOT_WEBP_QUALITY = Number(process.env.SCREENSHOT_WEBP_QUALITY);
const SCREENSHOT_WEBP_SCALE = Number(process.env.SCREENSHOT_WEBP_SCALE) <= 1 ? Number(process.env.SCREENSHOT_WEBP_SCALE) : 0.5;
const CONCURRENCY = Number(process.env.CONCURRENCY || '1');
const SHUFFLE_FIXTURES = process.env.SHUFFLE_FIXTURES === 'true';
const FIXTURES = flattenGlobs(process.env.FIXTURES ? parseArgs(process.env.FIXTURES) : configLoader.fixtures, SHUFFLE_FIXTURES);
const BROWSERS = process.env.BROWSERS ? parseArgs(process.env.BROWSERS) : configLoader.browsers;
const INCLUDE_TAGS = process.env.INCLUDE_TAGS ? parseArgs(process.env.INCLUDE_TAGS) : configLoader.includeTags;
const EXCLUDE_TAGS = process.env.EXCLUDE_TAGS ? parseArgs(process.env.EXCLUDE_TAGS) : configLoader.excludeTags;
const CASE_FILTER = process.env.CASE_FILTER || configLoader.caseFilter;
const STOP_ON_FIRST_FAIL = process.env.STOP_ON_FIRST_FAIL === 'true';
const INIT_RESOLUTION = (process.env.INIT_RESOLUTION || process.env.MAX_RESOLUTION || '0x0').split('x').map(n => parseInt(n, 10));
const ASSERTION_TIMEOUT = Number(process.env.ASSERTION_TIMEOUT) || 8e3;
const SKIP_JS_ERROR = !(process.env.SKIP_JS_ERROR === 'false');
const SKIP_CONSOLE_ERROR = !(process.env.SKIP_CONSOLE_ERROR === 'false');
const SKIP_CONSOLE_WARN = !(process.env.SKIP_CONSOLE_WARN === 'false');
const ENABLE_SSL = process.env.ENABLE_SSL === 'true';
const SELENIUM_CAPABILITIES = process.env.SELENIUM_CAPABILITIES || 'capabilities.json' // ref: https://github.com/link89/testcafe-browser-provider-selenium/tree/customize-chrome-option
const DISABLE_SCREENSHOT = process.env.DISABLE_SCREENSHOT === 'true';
const ENABLE_NOTIFICATION = process.env.ENABLE_NOTIFICATION === 'true';
const TESTS_LOG = process.env.TESTS_LOG || `tests-${new Date().toISOString().replace(/[:]/gm, '-')}.log`;
const DEBUG_ON_FAIL = process.env.DEBUG_ON_FAIL === 'true';

const GIT_SOURCE_BRANCH = process.env.BRANCH;
const GIT_TARGET_BRANCH = process.env.TARGET_BRANCH;
const NEW_VERSION_SITE = process.env.NEW_VERSION_SITE;

const RUNNER_OPTS = {
  TESTCAFE_HOST,
  REPORTER,
  SCREENSHOT_ON_FAIL,
  SCREENSHOTS_PATH,
  SCREENSHOT_WEBP_QUALITY,
  SCREENSHOT_WEBP_SCALE,
  CONCURRENCY,
  FIXTURES,
  BROWSERS,
  INCLUDE_TAGS,
  EXCLUDE_TAGS,
  QUARANTINE_MODE,
  STOP_ON_FIRST_FAIL,
  INIT_RESOLUTION,
  ASSERTION_TIMEOUT,
  SKIP_JS_ERROR,
  SKIP_CONSOLE_ERROR,
  SKIP_CONSOLE_WARN,
  ENABLE_SSL,
  SELENIUM_CAPABILITIES,
  LANGUAGE_CODE,
  DISABLE_SCREENSHOT,
  TESTS_LOG,
  DEBUG_ON_FAIL,
  CASE_FILTER,
};

// beat dashboard configuration
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || "0abc8d1aa7f81eb3f501bc5147853161acbb860e";
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://xia01-i01-dsb02.lab.rcch.ringcentral.com:8000/api/v1";
const ENABLE_REMOTE_DASHBOARD = (process.env.ENABLE_REMOTE_DASHBOARD === 'true');
const RUN_NAME = process.env.RUN_NAME || `[Jupiter][Debug][${new Date().toLocaleString()}]`;

// see detail: https://wiki.ringcentral.com/display/XTO/Jupiter+account+type+detail
enum BrandTire {
  "RCOFFICE" = "kamino(Fiji,Jupiter,1210,4488)",
  "RC_PROFESSIONAL_TIER" = "kamino(Fiji,Jupiter,1210,4442)",
  "RC_FIJI_GUEST" = "kamino(Fiji-with-guest,Jupiter,1210,4488)",
  "RC_USERS_20" = "kamino(FIJI-Users-20,Jupiter,1210,4488)",
  "RC_WITH_DID" = "kamino(FIJI-With-2-DirectNumber,Jupiter,1210,4488)",
  "RC_VOIP_DISABLE" = "kamino(RC_VOIP_DISABLE,Jupiter,1210,4488)",
  "RC_WITH_GUESS_DID" = "kamino(RC_WITH_GUESS_DID,Jupiter,1210,4488)",
  "SORTED_LAST_NAME" = "kamino(Sorted_Last_Name,Jupiter,1210,4488)",
  "RC_WITH_PHONE" = "kamino(1C4EWithPhoneAndNumber,Jupiter,1210,4488)",
  "CALL_LOG_READ_ONLY" = "kamino(Call-Log-Read-Only,Jupiter,1210,4488)",
  "CALL_LOG_USER0_WITH_OTHERS" = "kamino(Call_Log_User0_With_Others,Jupiter,1210,4488)",
  "RC_EMPTY_ONE_TIME" = "kamino(One-Time-Empty-Account,Jupiter,1210,4488)",
  "RC_WITH_PHONE_DL" = "kamino(RC_WITH_PHONE_DL,Jupiter,1210,4488)",
  "DID_WITH_MULTI_REGIONS" = "kamino(DID_Phone_With_Multi_Regions,Jupiter,1210,4488)",
  "MAIN_50_WITH_GUEST_20" = "kamino(Main_50_With_Guest_20,Jupiter,1210,4488)",
  "GLIP_FREE" = "kamino(Glip-Free,Jupiter)",
};

const WebphoneConfig = {
  TTL: 600000,
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
  ENABLE_NOTIFICATION,
  GIT_SOURCE_BRANCH,
  GIT_TARGET_BRANCH,
  NEW_VERSION_SITE
};
