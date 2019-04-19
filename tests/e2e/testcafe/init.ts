import 'testcafe';
import { RequestHook } from 'testcafe';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as assert from 'assert';
import * as Flatted from 'flatted';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { SITE_URL, ENV_OPTS, DEBUG_MODE, DASHBOARD_API_KEY, DASHBOARD_URL, ENABLE_REMOTE_DASHBOARD, RUN_NAME, RUNNER_OPTS, MOCK_SERVER_URL, ENABLE_MOCK_SERVER, SITE_ENV, MOCK_ENV, MOCK_AUTH_URL } from './config';
import { BeatsClient, Run } from 'bendapi-ts';
import { MiscUtils } from './v2/utils';
import { IConsoleLog } from './v2/models';
import { MockClient, BrowserInitDto } from 'mock-client';

import { getLogger } from 'log4js';
import { formalNameWithTestMetaPrefix } from './libs/filter';

const logger = getLogger(__filename);
logger.level = 'info';

function updateCapabilitiesFile(capabilitiesFile: string, browsers: string[], lang: string) {
  const capabilities = fs.existsSync(capabilitiesFile) ? JSON.parse(fs.readFileSync(capabilitiesFile, { encoding: 'utf-8' })) : {};
  browsers.filter(b => b.startsWith('selenium:chrome')).map(b => b.replace('selenium:', '')).forEach(b => {
    capabilities[b] = capabilities[b] || {};
    _.mergeWith(capabilities[b], { chromeOptions: { args: [], prefs: { "intl.accept_languages": lang } } },
      (objValue, srcValue) => {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
  });
  fs.writeFileSync(capabilitiesFile, JSON.stringify(capabilities, null, 4));
}

// update capabilities file
updateCapabilitiesFile(RUNNER_OPTS.SELENIUM_CAPABILITIES, RUNNER_OPTS.BROWSERS, RUNNER_OPTS.LANGUAGE_CODE);

// create electron configuration file
const electronRunConfig = {
  mainWindowUrl: process.env.MAIN_WINDOW_URL || SITE_URL,
  electronPath: process.env.ELECTRON_PATH || '/Applications/Jupiter.app/Contents/MacOS/Jupiter'
};
const testcafeElectronRcFilename = '.testcafe-electron-rc';
const testcafeElectronRcContent = JSON.stringify(electronRunConfig, null, 4);
fs.writeFileSync(testcafeElectronRcFilename, testcafeElectronRcContent);
logger.info(`create ${testcafeElectronRcFilename} with content ${testcafeElectronRcContent}`);


// initialize mock client
export const mockClient = ENABLE_MOCK_SERVER ? new MockClient(MOCK_SERVER_URL) : null;

// initialize account pool client
export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);

// initialize beat dashboard
const beatsClient: BeatsClient = ENABLE_REMOTE_DASHBOARD ? new BeatsClient(DASHBOARD_URL, DASHBOARD_API_KEY) : null;

// _runId is a share state
let _runId = getRunIdFromFile();

function formalMetadata(env: any) {
  const mappingTable = {
    'JOB_NAME': 'Tests/Jenkins/Job',
    'JOB_URL': 'Tests/Jenkins/URL',
    'BUILD_ID': 'Tests/Jenkins/Build',
  }
  const metadata = {};
  for (const k in mappingTable) {
    const v = env[k];
    if (v) {
      metadata[mappingTable[k]] = v;
    }
  }
  return metadata;
}

function getRunIdFromFile(runIdFile: string = './runId') {
  if (fs.existsSync(runIdFile)) {
    const content = fs.readFileSync(runIdFile, 'utf8');
    return Number(content);
  }
  return null;
}

export async function getOrCreateRunId(runIdFile: string = './runId') {
  if (!_runId) {
    const runName = RUN_NAME;
    const metadata = formalMetadata(process.env);
    for (const key in ENV_OPTS) {
      metadata[key] = JSON.stringify(ENV_OPTS[key]);
    }
    for (const key in RUNNER_OPTS) {
      if ([
        'EXCLUDE_TAGS',
        'INCLUDE_TAGS'
      ].indexOf(key) > 0)
        metadata[key] = JSON.stringify(RUNNER_OPTS[key]);
    }
    for (const key in process.env) {
      if ([
        'SELENIUM_SERVER',
        'HOST_NAME',
        'BUILD_URL',
        'SITE_URL',
        'SITE_ENV',
      ].indexOf(key) > 0 || key.startsWith('gitlab'))
        metadata[key] = process.env[key];
    }
    const run = new Run();
    run.name = runName;
    run.metadata = metadata;
    run.startTime = new Date();
    run.hostName = process.env.HOST_NAME;
    const res = await beatsClient.createRun(run).catch(() => null);
    _runId = res ? res.body.id : null;
    console.log(`a new Run Id is created: ${_runId}`);
  }
  return _runId;
}

export async function finishRun() {
  let result = '';
  if (_runId) {
    const run = new Run();
    run.process = 1;
    run.endTime = new Date();
    result = await beatsClient.runApi.runPartialUpdate(_runId, run);
  }
  return result;
}

// inject external service into test case
export function setupCase(accountType: string) {
  return async (t: TestController) => {
    t.ctx.runnerOpts = RUNNER_OPTS;

    h(t).allureHelper.initReporter();
    await h(t).dataHelper.setup(
      accountPoolClient,
      accountType
    );

    await h(t).sdkHelper.setup(
      ENV_OPTS.RC_PLATFORM_APP_KEY,
      ENV_OPTS.RC_PLATFORM_APP_SECRET,
      ENV_OPTS.RC_PLATFORM_BASE_URL,
      ENV_OPTS.GLIP_SERVER_BASE_URL,
    );

    await h(t).jupiterHelper.setup(
      SITE_ENV,
      ENV_OPTS.AUTH_URL,
      ENV_OPTS.JUPITER_APP_KEY,
    );

    await h(t).logHelper.setup();

    if (mockClient) {
      h(t).mockClient = mockClient;
      const mockEnvConfig = BrowserInitDto.of()
        .env(SITE_ENV)
        .appKey(ENV_OPTS.RC_PLATFORM_APP_KEY)
        .appSecret(ENV_OPTS.RC_PLATFORM_APP_SECRET);
      h(t).mockRequestId = await mockClient.registerBrowser(mockEnvConfig);
      logger.info(`mock request id is: ${h(t).mockRequestId}`);
      const hook = new MockClientHook();
      hook.requestId = h(t).mockRequestId;
      await t.addRequestHooks([hook]);
      h(t).jupiterHelper.siteEnv = MOCK_ENV;
      h(t).jupiterHelper.authUrl = MOCK_AUTH_URL;
      h(t).jupiterHelper.mockRequestId = h(t).mockRequestId;
    }

    await t.resizeWindow(RUNNER_OPTS.MAX_RESOLUTION[0], RUNNER_OPTS.MAX_RESOLUTION[1]);
  }
}

export function teardownCase() {
  return async (t: TestController) => {
    const { test: { name, meta } } = t['testRun'];
    const testCaseName = formalNameWithTestMetaPrefix(name, meta);
    t['testRun']['test']['name'] = testCaseName;
    if (mockClient)
      await mockClient.releaseBrowser(h(t).mockRequestId);

    // release account
    await h(t).dataHelper.teardown();

    // convert screenshot to webp format
    const failScreenShotPath = t['testRun'].errs.length > 0 ? t['testRun'].errs[0].screenshotPath : null;
    if (failScreenShotPath) {
      t['testRun'].errs[0].screenshotPath = await MiscUtils.convertToWebp(failScreenShotPath);
    };

    // fetch console log from browser
    const consoleLog = await t.getBrowserConsoleMessages()
    const zipConsoleLog = new JSZip();
    zipConsoleLog.file('console-log.json', JSON.stringify(consoleLog, null, 2));
    const consoleLogPath = MiscUtils.createTmpFile(await zipConsoleLog.generateAsync({ type: "nodebuffer" }), `console-log-${uuid()}.zip`);
    const warnLog = Flatted.stringify(consoleLog.warn);
    const warnConsoleLogPath = MiscUtils.createTmpFile(warnLog);
    const errorLog = Flatted.stringify(consoleLog.error);
    const errorConsoleLogPath = MiscUtils.createTmpFile(errorLog);
    const warnConsoleLogNumber = consoleLog.warn.length;
    const errorConsoleLogNumber = consoleLog.error.length;
    const consoleLogObj: IConsoleLog = {
      consoleLogPath,
      warnConsoleLogPath,
      errorConsoleLogPath,
      warnConsoleLogNumber,
      errorConsoleLogNumber
    };

    // dump account pool data
    const zipRcData = new JSZip();
    zipRcData.file('rc-data.json', JSON.stringify(h(t).dataHelper.originData, null, 2));
    const rcDataPath = MiscUtils.createTmpFile(await zipRcData.generateAsync({ type: "nodebuffer" }), `rc-data-${uuid()}.zip`);

    // get account type
    const accountType = h(t).dataHelper.rcData.mainCompany.type;

    // create allure report
    h(t).allureHelper.writeReport(consoleLogObj, accountType, rcDataPath);

    // create beats report when ENABLE_REMOTE_DASHBOARD=true
    if (beatsClient) {
      const runId = await getOrCreateRunId();
      if (runId) {
        await h(t).dashboardHelper.teardown(beatsClient, runId, consoleLogObj, accountType, rcDataPath);
      }
    }
    assert(RUNNER_OPTS.SKIP_CONSOLE_ERROR || 0 === errorConsoleLogNumber, `console error is detected: ${errorLog}!`);
    assert(RUNNER_OPTS.SKIP_CONSOLE_WARN || 0 === warnConsoleLogNumber, `console warn is detected: ${warnLog}!`);
  }
}

class MockClientHook extends RequestHook {
  public requestId: string;

  async onRequest(event) {
    event.requestOptions.headers['x-mock-request-id'] = this.requestId;
  }

  async onResponse(event) {
  }
}
