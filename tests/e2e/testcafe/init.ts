import 'testcafe';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { ENV_OPTS, DEBUG_MODE, DASHBOARD_API_KEY, DASHBOARD_URL, ENABLE_REMOTE_DASHBOARD, RUN_NAME, RUNNER_OPTS } from './config';
import { BeatsClient, Run } from 'bendapi-ts';
import { MiscUtils } from './v2/utils';
import { IConsoleLog } from './v2/models';

export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);

const beatsClient: BeatsClient = ENABLE_REMOTE_DASHBOARD ? new BeatsClient(DASHBOARD_URL, DASHBOARD_API_KEY) : null;
// _runId is a share state
let _runId = getRunIdFromFile();

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
    const metadata = {};
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
    // TODO: hostname, hostip, etc
    const res = await beatsClient.createRun(run).catch(() => null);
    _runId = res ? res.body.id : null;
    console.log(`a new Run Id is created: ${_runId}`);
  }
  return _runId;
}

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
      ENV_OPTS.AUTH_URL,
      ENV_OPTS.JUPITER_APP_KEY,
    )
    await h(t).logHelper.setup();
    await t.resizeWindow(1280, 720);
    await t.maximizeWindow();
  }
}

export function teardownCase() {
  return async (t: TestController) => {
    // release account
    await h(t).dataHelper.teardown();

    // convert screenshot to webp format
    const failScreenShotPath = t['testRun'].errs.length > 0 ? t['testRun'].errs[0].screenshotPath : null;
    if (failScreenShotPath) {
      t['testRun'].errs[0].screenshotPath = await MiscUtils.convertToWebp(failScreenShotPath);
    };

    // fetch console log from browser
    const consoleLog = await t.getBrowserConsoleMessages()
    const zip = new JSZip();
    zip.file('console-log.json', JSON.stringify(consoleLog, null, 2));
    const consoleLogPath = MiscUtils.createTmpFile(await zip.generateAsync({ type: "nodebuffer" }), 'console-log.zip');
    const warnConsoleLogPath = MiscUtils.createTmpFile(JSON.stringify(consoleLog['warn'], null, 2));
    const errorConsoleLogPath = MiscUtils.createTmpFile(JSON.stringify(consoleLog['error'], null, 2));
    const warnConsoleLogNumber = consoleLog['warn'].length;
    const errorConsoleLogNumber = consoleLog['error'].length;
    const consoleLogObj: IConsoleLog = {
      consoleLogPath,
      warnConsoleLogPath,
      errorConsoleLogPath,
      warnConsoleLogNumber,
      errorConsoleLogNumber
    };

    // create allure report
    h(t).allureHelper.writeReport(consoleLogObj, h(t).dataHelper.rcData.mainCompany.type);

    // create beats report when ENABLE_REMOTE_DASHBOARD=true
    if (beatsClient) {
      const runId = await getOrCreateRunId();
      if (runId) {
        await h(t).dashboardHelper.teardown(beatsClient, runId, consoleLogObj, h(t).dataHelper.rcData.mainCompany.type);
      }
    }
  }
}
