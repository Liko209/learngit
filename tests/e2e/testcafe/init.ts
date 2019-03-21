import 'testcafe';
import { RequestHook } from 'testcafe';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as assert from 'assert';
import * as Flatted from 'flatted';
import { v4 as uuid } from 'uuid';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { SITE_URL, ENV_OPTS, DEBUG_MODE, DASHBOARD_API_KEY, DASHBOARD_URL, ENABLE_REMOTE_DASHBOARD, RUN_NAME, RUNNER_OPTS, MOCK_SERVER_URL, ENABLE_MOCK_SERVER, SITE_ENV, MOCK_ENV, MOCK_AUTH_URL } from './config';
import { BeatsClient, Run } from 'bendapi-ts';
import { MiscUtils } from './v2/utils';
import { IConsoleLog } from './v2/models';
import { MockClient, BrowserInitDto } from 'mock-client';

import { getLogger } from 'log4js';

const logger = getLogger(__filename);
logger.level = 'info';

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
    'JENKINS_URL': 'Tests/Jenkins/URL',
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
    run.hostName = process.env.HOST_NAME;
    const res = await beatsClient.createRun(run).catch(() => null);
    _runId = res ? res.body.id : null;
    console.log(`a new Run Id is created: ${_runId}`);
  }
  return _runId;
}

// inject external service into test case
export function setupCase(accountType: string) {
  return async (t: TestController) => {

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

    await h(t).logHelper.setup();
    await t.resizeWindow(RUNNER_OPTS.MAX_RESOLUTION[0], RUNNER_OPTS.MAX_RESOLUTION[1]);
    await t.maximizeWindow();
  }
}

export function teardownCase() {
  return async (t: TestController) => {
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