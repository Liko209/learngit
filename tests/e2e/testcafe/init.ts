import 'testcafe';
import { v4 as uuid } from 'uuid';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { ENV_OPTS, DEBUG_MODE, DASHBOARD_API_KEY, DASHBOARD_URL, ENABLE_REMOTE_DASHBOARD, RUN_NAME, RUN_ID, RUNNER_OPTS } from './config';
import { BeatsClient, Run } from 'bendapi';

export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);

let beatsClient: BeatsClient;
let runId = RUN_ID;

if (ENABLE_REMOTE_DASHBOARD) {
  beatsClient = new BeatsClient(DASHBOARD_API_KEY, DASHBOARD_URL);
}

export async function getRunId(beatsClient: BeatsClient) {
  if (!runId) {
    const runName = RUN_NAME || uuid();
    const metadata = {};
    for (const key in RUNNER_OPTS) {
      if (['REPORTER', 'FIXTURES'].indexOf(key) > 0)
        continue
      metadata[key] = JSON.stringify(RUNNER_OPTS[key]);
    }
    const run = await beatsClient.createRun({
      name: runName,
      metadata,
    } as Run);
    runId = run.id;
    console.log(`a new Run Id is created: ${runId}`);
  }
  return runId;
}

export function setupCase(accountType: string) {
  return async (t: TestController) => {
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
    await t.maximizeWindow();
  }
}

export function teardownCase() {
  return async (t: TestController) => {
    await h(t).dataHelper.teardown();
    if (beatsClient) {
      await h(t).dashboardHelper.teardown(beatsClient, await getRunId(beatsClient));
    }
  }
}
