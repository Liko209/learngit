import { v4 as uuid } from 'uuid';
import { setupSDK } from '../utils/setupSDK';
import { Status, AllureStep } from '../libs/report';
import { RC_PLATFORM_APP_KEY, RC_PLATFORM_APP_SECRET, ENV } from '../config';
import accountPoolHelper from './accounts';
import { RcPlatformManager } from './glip';

export function setUp(accountType: string) {
  return async (t: TestController) => {
    const helper = TestHelper.from(t);
    await helper.checkOutAccounts(accountType);
    helper.setupGlipApiManager();
    await setupSDK(t);
  };
}

export function tearDown() {
  return async (t: TestController) => {
    const helper = TestHelper.from(t);
    await helper.checkInAccounts();
  };
}

export class TestHelper {
  static from(t: TestController): TestHelper {
    return new TestHelper(t);
  }

  constructor(private t: TestController) {
  }

  async checkOutAccounts(accountType: string, env: string = ENV.ACCOUNT_POOL_ENV) {
    try {
      this.t.ctx.data = await accountPoolHelper.checkOutAccounts(env, accountType);
    } catch (e) {
      throw new Error('failed to check out accounts');
    }
  }

  async checkInAccounts(env: string = ENV.ACCOUNT_POOL_ENV) {
    await accountPoolHelper.checkInAccounts(
      env, this.t.ctx.data.accountType, this.t.ctx.data.companyEmailDomain,
    );
  }

  get data() {
    return this.t.ctx.data;
  }

  get users() {
    return this.data.users;
  }

  get teams() {
    return this.data.teams;
  }

  get companyNumber() {
    return String(this.data.mainCompanyNumber);
  }

  setupGlipApiManager(
    key: string = RC_PLATFORM_APP_KEY,
    secret: string = RC_PLATFORM_APP_SECRET,
    server: string = ENV.RC_PLATFORM_BASE_URL,
  ) {
    this.t.ctx.rcPlatformManager = new RcPlatformManager(key, secret, server);
  }

  get glipApiManager(): RcPlatformManager {
    return this.t.ctx.rcPlatformManager;
  }

  async log(
    message: string,
    status: Status = Status.PASSED,
    takeScreen: boolean = false,
    startTime: number = Date.now(),
    endTime: number = Date.now(),
    parent?: AllureStep) {

    if (this.t.ctx.logs === undefined) {
      this.t.ctx.logs = [];
    }

    let screenPath;
    if (takeScreen) {
      screenPath = uuid() + '.png';
      await this.t.takeScreenshot(screenPath);
      screenPath = this.t['testRun'].opts.screenshotPath + '/' + screenPath;
    }

    const step = new AllureStep(message, status, startTime, endTime, screenPath, []);
    if (parent === undefined) {
      this.t.ctx.logs.push(step);
    } else {
      parent.children.push(step);
    }
    console.log(step.toString());
    return step;
  }
}
