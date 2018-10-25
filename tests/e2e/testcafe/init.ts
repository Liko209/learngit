import 'testcafe';
import { initAccountPoolManager } from './libs/accounts';
import { h } from './v2/helpers';
import { ENV_OPTS, DEBUG_MODE } from './config';

export const accountPoolClient = initAccountPoolManager(ENV_OPTS, DEBUG_MODE);

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
  }
}
