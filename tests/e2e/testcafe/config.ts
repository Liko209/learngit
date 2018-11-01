/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-16 11:29:42
 * Copyright © RingCentral. All rights reserved.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { getLogger } from 'log4js';

import { flattenGlobs, parseArgs, ConfigLoader } from './libs/utils';

const logger = getLogger(__filename);
logger.level = 'info';

dotenv.config();

const APP_ROOT = __dirname;
const CONFIGS_ROOT = path.join(APP_ROOT, 'configs');

const SITE_ENV = process.env.SITE_ENV || 'XMN-UP';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const DEBUG_MODE = !(process.env.DEBUG_MODE === 'false');
const QUARANTINE_MODE = (process.env.QUARANTINE_MODE === 'true');

const ENV_OPTS = {
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

ENV_OPTS.RC_PLATFORM_APP_KEY = process.env.RC_PLATFORM_APP_KEY || '';
ENV_OPTS.RC_PLATFORM_APP_SECRET = process.env.RC_PLATFORM_APP_SECRET || '';

const configLoader = new ConfigLoader(
  (process.env.BRANCH || '').toLocaleLowerCase(),
  (process.env.ACTION || '').toLocaleLowerCase(),
  CONFIGS_ROOT,
);

configLoader.load();

const REPORTER = process.env.REPORTER || 'allure-lazy';
const SCREENSHOTS_PATH = process.env.SCREENSHOTS_PATH || '/tmp';
const SCREENSHOT_ON_FAIL = !(process.env.SCREENSHOT_ON_FAIL === 'false');
const CONCURRENCY = Number(process.env.CONCURRENCY || '1');
const FIXTURES = flattenGlobs(process.env.FIXTURES ? parseArgs(process.env.FIXTURES) : configLoader.fixtures);
const BROWSERS = process.env.BROWSERS ? parseArgs(process.env.BROWSERS) : configLoader.browsers;
const INCLUDE_TAGS = process.env.INCLUDE_TAGS ? parseArgs(process.env.INCLUDE_TAGS) : configLoader.includeTags;
const EXCLUDE_TAGS = process.env.EXCLUDE_TAGS ? parseArgs(process.env.EXCLUDE_TAGS) : configLoader.excludeTags;

const RUNNER_OPTS = {
  REPORTER,
  SCREENSHOT_ON_FAIL,
  SCREENSHOTS_PATH,
  CONCURRENCY,
  FIXTURES,
  BROWSERS,
  INCLUDE_TAGS,
  EXCLUDE_TAGS,
  QUARANTINE_MODE,
}

// create electron configuration file
const electronRunConfig = {
  mainWindowUrl: process.env.MAIN_WINDOW_URL || SITE_URL,
  electronPath: process.env.ELECTRON_PATH || '/Applications/Jupiter.app/Contents/MacOS/Jupiter'
};
const testcafeElectronRcFilename = '.testcafe-electron-rc';
const testcafeElectronRcContent = JSON.stringify(electronRunConfig, null, 4);
writeFileSync(testcafeElectronRcFilename, testcafeElectronRcContent);
logger.info(`create ${testcafeElectronRcFilename} with content ${testcafeElectronRcContent}`);

// beat dashboard configuration
const DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY || "0abc8d1aa7f81eb3f501bc5147853161acbb860e";
const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://xia01-i01-xta05.lab.rcch.ringcentral.com:8000/api/v1";
const ENABLE_REMOTE_DASHBOARD = (process.env.ENABLE_REMOTE_DASHBOARD === 'true');
const RUN_NAME = process.env.RUN_NAME || uuid();
const RUN_ID = Number(process.env.RUN_ID);

export {
  APP_ROOT,
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
  RUN_ID,
};
