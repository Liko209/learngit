import 'testcafe';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { ENV_OPTS, DEBUG_MODE, DASHBOARD_API_KEY, DASHBOARD_URL, ENABLE_REMOTE_DASHBOARD, RUN_NAME, RUNNER_OPTS } from './config';
import { BeatsClient, Run } from 'bendapi';
import { MiscUtils } from './v2/utils';
import { IConsoleLog } from './v2/models';

export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);

let beatsClient: BeatsClient;
let runId = getRunIdFromFile();

if (ENABLE_REMOTE_DASHBOARD) {
  beatsClient = new BeatsClient(DASHBOARD_API_KEY, DASHBOARD_URL);
}

function getRunIdFromFile(runIdFile: string = './runId') {
  if (!ENABLE_REMOTE_DASHBOARD)
    return null;
  if (fs.existsSync(runIdFile)) {
    const content = fs.readFileSync(runIdFile, 'utf8');
    return Number(content);
  }
  return null;
}

export async function getOrCreateRunId() {
  if (!ENABLE_REMOTE_DASHBOARD)
    return null;
  if (!runId) {
    const runName = RUN_NAME || uuid();
    const metadata = {};
    for (const key in ENV_OPTS) {
      metadata[key] = JSON.stringify(ENV_OPTS[key]);
    }
    for (const key in RUNNER_OPTS) {
      if ([
        'EXCLUDE_TAGS',
        'INCLUDE_TAGS',
        'QUARANTINE_MODE'
      ].indexOf(key) > 0)
        metadata[key] = JSON.stringify(RUNNER_OPTS[key]);
    }
    for (const key in process.env) {
      if ([
        'SELENIUM_SERVER',
        'HOST_NAME',
        'BUILD_URL',
        'SITE_URL',
        'gitlabActionType',
        'gitlabBranch',
        'gitlabMergedByUser',
        'gitlabMergeRequestLastCommit',
        'gitlabMergeRequestTitle',
        'gitlabSourceBranch',
        'gitlabTargetBranch',
      ].indexOf(key) > 0)
        metadata[key] = process.env[key];
    }
    const run = await beatsClient.createRun({
      name: runName,
      metadata,
    } as Run);
    runId = run ? run.id : null;
    console.log(`a new Run Id is created: ${runId}`);
  }
  return runId;
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
    const failScreenShotPath = t['testRun'].errs.length > 0 ? t['testRun'].errs[0].screenshotPath : null;
    if (failScreenShotPath) {
      t['testRun'].errs[0].screenshotPath = await MiscUtils.convertToWebp(failScreenShotPath);
    };
    const consoleLog = await t.getBrowserConsoleMessages()
    const consoleLogPath = MiscUtils.createTmpFilePath("console_log.zip");
    let zip = new JSZip();
    zip.file('consoleLog.txt', JSON.stringify(consoleLog, null, 2));
    await zip.generateAsync({ type: "nodebuffer" }).then(
      function (content) {
        fs.writeFileSync(consoleLogPath, content);
      }
    )
    const warnConsoleLogPath = MiscUtils.createTmpFile(JSON.stringify(consoleLog['warn'], null, 2));
    const errorConsoleLogPath = MiscUtils.createTmpFile(JSON.stringify(consoleLog['error'], null, 2));
    const warnConsoleLogNumber = consoleLog['warn'].length;
    const errorConsoleLogNumber = consoleLog['error'].length;

    let consoleLogObj: IConsoleLog = {
      consoleLogPath,
      warnConsoleLogPath,
      errorConsoleLogPath,
      warnConsoleLogNumber,
      errorConsoleLogNumber
    }

    h(t).allureHelper.writeReport(consoleLogObj, h(t).dataHelper.rcData.mainCompany.type);
    if (ENABLE_REMOTE_DASHBOARD) {
      let runId = await getOrCreateRunId();
      if (runId) {
        await h(t).dashboardHelper.teardown(beatsClient, runId, consoleLogObj, h(t).dataHelper.rcData.mainCompany.type);
      } else {
        console.error("Couldn't create Run for the test, please check the dashboard connection!")
      }
    }
    await h(t).dataHelper.teardown();
  }
}
