import { v4 as uuid } from 'uuid';
import { RcPlatformManager } from './glip';
import { Status, AllureStep } from '../libs/report';
import { accountPoolClient } from '../libs/accounts';
import { setupSDK } from '../utils/setupSDK';
import { ENV_OPTS } from '../config';

export function setUp(accountType: string) {
  return async (t: TestController) => {
    await t.maximizeWindow();
    const helper = TestHelper.from(t);
    helper.setupGlipApiManager();
    await helper.checkOutAccounts(accountType);
    try {
      await setupSDK(t);
    } catch (error) {
      await helper.checkInAccounts();
      throw new Error('Fail to initialize glip 1.0 sdk');
    }
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

  constructor(private t: TestController) {}

  async checkOutAccounts(accountType: string) {
    this.t.ctx.data = await accountPoolClient.checkOutAccounts(accountType);
  }

  async checkInAccounts(env: string = ENV_OPTS.ACCOUNT_POOL_ENV) {
    await accountPoolClient.checkInAccounts(this.t.ctx.data);
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
    key: string = ENV_OPTS.RC_PLATFORM_APP_KEY,
    secret: string = ENV_OPTS.RC_PLATFORM_APP_SECRET,
    server: string = ENV_OPTS.RC_PLATFORM_BASE_URL,
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
    parent?: AllureStep,
  ) {
    if (this.t.ctx.logs === undefined) {
      this.t.ctx.logs = [];
    }

    let screenPath;
    if (takeScreen) {
      screenPath = `${uuid()}.png`;
      await this.t.takeScreenshot(screenPath);
      screenPath = `${this.t['testRun'].opts.screenshotPath}/${screenPath}`;
    }

    const step = new AllureStep(
      message,
      status,
      startTime,
      endTime,
      screenPath,
      [],
    );
    if (parent === undefined) {
      this.t.ctx.logs.push(step);
    } else {
      parent.children.push(step);
    }
    console.log(step.toString());
    return step;
  }
}
