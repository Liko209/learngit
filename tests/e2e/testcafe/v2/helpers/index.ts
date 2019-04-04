import 'testcafe';
import { MockClient } from 'mock-client';

import { ClientFunction, Role } from 'testcafe';
import { getLogger } from 'log4js';

import { DataHelper } from './data-helper'
import { SdkHelper } from "./sdk-helper";
import { JupiterHelper } from "./jupiter-helper";
import { A11yHelper } from "./a11y-helper";
import { LogHelper } from './log-helper';
import { DashboardHelper } from './dashboard-helper';
import { AllureHelper } from './allure-helper';
import { ScenarioHelper } from './scenario-helper';
import { H } from './utils';

import { IUser, IStep, LogOptions } from '../models';
import { AppRoot } from '../page-models/AppRoot';
import { SITE_URL, SITE_ENV } from '../../config';

const logger = getLogger(__filename);
logger.level = 'info';

class Helper {

  get mockRequestId(): string {
    return this.t.ctx.__mockRequestId;
  }

  set mockRequestId(mockRequestId: string) {
    this.t.ctx.__mockRequestId = mockRequestId;
  }

  get mockClient(): MockClient {
    return this.t.ctx.__mockClient;
  }

  set mockClient(mockClient: MockClient) {
    this.t.ctx.__mockClient = mockClient;
  }

  constructor(private t: TestController) { };

  get a11yHelper() {
    return new A11yHelper(this.t);
  }

  get dataHelper() {
    return new DataHelper(this.t);
  }

  get sdkHelper() {
    return new SdkHelper(this.t);
  }

  get jupiterHelper() {
    return new JupiterHelper(this.t);
  }

  get logHelper() {
    return new LogHelper(this.t);
  }

  get dashboardHelper() {
    return new DashboardHelper(this.t);
  }

  get allureHelper() {
    return new AllureHelper(this.t);
  }

  get scenarioHelper() {
    return new ScenarioHelper(this.t, this.sdkHelper);
  }

  /* delegate following method */
  get rcData() {
    return this.dataHelper.rcData;
  }

  directLoginWithUser(url: string, user: IUser) {
    return this.jupiterHelper.directLoginWithUser(url, user);
  }

  async mapSelectorsAsync(selector: Selector, cb: (nth: Selector, i?: number) => Promise<any>) {
    const count = await selector.count;
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(cb(selector.nth(i), i));
    }
    return await Promise.all(promises);
  }

  async log(step: IStep | string,
    args?: { [key: string]: any } | boolean | LogOptions,
    options?: boolean | LogOptions) {
    return await this.logHelper.log(step, args, options);
  }

  async withLog(step: IStep | string,
    args: { [key: string]: any } | ((step?: IStep) => Promise<any>),
    cb?: boolean | LogOptions | ((step?: IStep) => Promise<any>),
    options?: boolean | LogOptions) {
    return await this.logHelper.withLog(step, args, cb, options);
  }

  async getGlip(user: IUser) {
    return await this.sdkHelper.sdkManager.getGlip(user);
  }

  async getPlatform(user: IUser) {
    return await this.sdkHelper.sdkManager.getPlatform(user);
  }

  async getSdk(user: IUser) {
    const glip = await this.getGlip(user);
    const platform = await this.getPlatform(user);
    return { glip, platform };
  }

  glip(user: IUser) {
    return this.sdkHelper.sdkManager.glip(user);
  }

  platform(user: IUser) {
    return this.sdkHelper.sdkManager.platform(user);
  }

  // testcafe extend
  get href() {
    return ClientFunction(() => document.location.href)();
  }

  async interceptHasFocus(isFocus: boolean) {
    // intercept return value of document.hasFocus to cheat SUT
    await ClientFunction(
      (_isFocus) => {
        Object.defineProperty(document, 'hasFocus', { value: () => _isFocus, configurable: true });
      })(isFocus);
  }

  async reload() {
    await this.t.eval(() => location.reload(true));
  }

  async waitUntilExist(selector: Selector, timeout: number = 5e3) {
    await this.t
      .expect(selector.exists)
      .ok(`fail to locate selector ${selector} within ${timeout} ms`, { timeout });
  }

  async waitUntilNotEmpty(selector: Selector, timeout: number = 5e3) {
    await this.t
      .expect(selector.count)
      .gt(0, `fail to locate selector ${selector} within ${timeout} ms`, { timeout });
  }

  async waitUntilVisible(selector: Selector, timeout: number = 5e3) {
    await this.t
      .expect(selector)
      .ok(`selector ${selector} is not visible within ${timeout} ms`, { timeout });
  }

  get setLocalStorage(): (k: string, v: string) => Promise<any> {
    return ClientFunction((key, val) => localStorage.setItem(key, val));
  }

  async userRole(user: IUser, cb?: (appRoot) => Promise<any>) {
    return await Role(SITE_URL, async (t) => {
      const app = new AppRoot(t);
      await h(t).jupiterHelper.selectEnvironment(SITE_URL, SITE_ENV);
      await app.loginPage.interactiveSignIn(user.company.number, user.extension, user.password);
      await app.homePage.ensureLoaded();
      if (undefined !== cb) {
        await cb(app);
      }
    }, { preserveUrl: true, });
  }

  // a temporary method:  need time to wait back-end and front-end sync umi data.
  async waitUmiDismiss(timeout: number = 3e3) {
    await this.t.wait(timeout);
  }

  // misc
  async resetGlipAccount(user: IUser) {
    const adminGlip = await this.sdkHelper.sdkManager.getGlip(user.company.admin);
    await adminGlip.deactivated(user.rcId);
    if (this.mockClient)
      await this.mockClient.resetAccount(user.company.number, user.extension, SITE_ENV);
    await this.sdkHelper.sdkManager.getGlip(user);
  }
}

function h(t: TestController): Helper {
  if (undefined == t.ctx.__helper) {
    t.ctx.__helper = new Helper(t);
  }
  return t.ctx.__helper;
}

export { Helper, h, H };
