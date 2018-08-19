import accountPoolHelper from './accounts';
import { RcPlatformManager } from './glip';
import { RC_PLATFORM_APP_KEY, RC_PLATFORM_APP_SECRET, ENV } from '../config';

export function setUp(accountType: string) {
  return async (t: TestController) => {
    const helper = TestHelper.from(t);
    await helper.checkOutAccounts(accountType);
    helper.setupGlipApiManager();
  }
}

export function tearDown() {
  return async (t: TestController) => {
    const helper = TestHelper.from(t);
    await helper.checkInAccounts();
  }
}
export class TestHelper {
  static from(t: TestController): TestHelper {
    return new TestHelper(t);
  }

  constructor(private t: TestController) {
  }

  async checkOutAccounts(accountType: string, env: string = ENV.ACCOUNT_POOL_ENV) {
    this.t.ctx.data = await accountPoolHelper.checkOutAccounts(env, accountType);
  }

  async checkInAccounts(env: string = ENV.ACCOUNT_POOL_ENV) {
    await accountPoolHelper.checkInAccounts(env, this.t.ctx.data.accountType, this.t.ctx.data.companyEmailDomain);
  }

  get testData() {
    return this.t.ctx.data;
  }

  setupGlipApiManager(
    key: string = RC_PLATFORM_APP_KEY,
    secret: string = RC_PLATFORM_APP_SECRET,
    server: string = ENV.RC_PLATFORM_BASE_URL) {
    this.t.ctx.rcPlatformManager = new RcPlatformManager(key, secret, server);
  }

  get glipApiManager(): RcPlatformManager {
    return this.t.ctx.rcPlatformManager;
  }
}
