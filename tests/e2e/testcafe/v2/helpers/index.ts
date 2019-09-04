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

import { IUser, IStep, IStepOptions, INotification } from '../models';
import { Step } from './log-helper'
import { AppRoot } from '../page-models/AppRoot';
import { SITE_URL, SITE_ENV } from '../../config';
import { WebphoneHelper } from './webphone-helper';
import { NetworkHelper } from './network-helper';
import { NotificationHelper } from './notification';
import { UpgradeHelper } from './upgrade';
import { WebphoneSession } from 'webphone-client';
import { BrowserConsoleHelper } from './voip-log-helper'

import * as _ from 'lodash';
import * as assert from 'assert';

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

  get webphoneHelper() {
    return new WebphoneHelper(this.t);
  }

  get networkHelper() {
    return new NetworkHelper(this.t);
  }

  get scenarioHelper() {
    return new ScenarioHelper(this.t, this.sdkHelper);
  }

  get notificationHelper(): NotificationHelper {
    if (!this.t.ctx.__notificationHelper) {
      this.t.ctx.__notificationHelper = new NotificationHelper(this.t);
    }
    return this.t.ctx.__notificationHelper;
  }

  get upgradeHelper(): UpgradeHelper {
    if (!this.t.ctx.__upgradeHelper) {
      this.t.ctx.__upgradeHelper = new UpgradeHelper(this.t);
    }
    return this.t.ctx.__upgradeHelper;
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
    options?: boolean | IStepOptions) {
    return await this.logHelper.log(step, options);
  }

  async withLog(step: IStep | string,
    cb: (step?: Step) => Promise<any>,
    options?: boolean | IStepOptions) {
    return await this.logHelper.withLog(step, cb, options);
  }

  async withNotification(
    before: () => Promise<void>,
    callback: (notification: Array<INotification>) => Promise<any>,
    timeout: number = 60e3): Promise<void> {
    await this.notificationHelper.withNotification(before, callback, timeout);
  }

  /**
   *
   * @param notification
   * @param action  'click', 'answer', 'close'.
   * @param timeout
   */
  async clickNotification(notification: INotification, action: string = 'click', timeout: number = 60e3): Promise<void> {
    return await this.notificationHelper.clickNotification(notification, action, timeout);
  }

  async supportNotification(): Promise<boolean> {
    return await this.notificationHelper.support();
  }

  async withPhoneSession(user: IUser, cb: (session: WebphoneSession) => Promise<any>) {
    return await this.webphoneHelper.withSession(user, cb);
  }

  async newWebphoneSession(user: IUser) {
    return await this.webphoneHelper.newWebphoneSession(user);
  }

  async newWebphoneSessionWithDid(did: string, password: string) {
    return await this.webphoneHelper.newWebphoneSessionWithDid(did, password);
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
    await ClientFunction((_isFocus) => {
      _isFocus ? window.dispatchEvent(new Event('focus')) : window.dispatchEvent(new Event('blur'));
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

  get browserConsoleHelper(): BrowserConsoleHelper {
    if (!this.t.ctx.__BrowserConsoleHelper) {
      this.t.ctx.__BrowserConsoleHelper = new BrowserConsoleHelper(this.t);
    }
    return this.t.ctx.__BrowserConsoleHelper;
  }

  get setLocalStorage(): (k: string, v: string) => Promise<any> {
    return ClientFunction((key, val) => localStorage.setItem(key, val));
  }

  async scrollBy(selector: Selector | any, x: number, y: number) {
    await ClientFunction((_x, _y) => {
      selector().scrollBy(_x, _y);
    },
      { dependencies: { selector } })(x, y);
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

  async withNetworkOff(cb: () => Promise<any>) {
    await this.networkHelper.withNetworkOff(cb);
  }

  turnOnNetwork(suppressError: boolean = true) {
    this.networkHelper.setNetwork(true, suppressError);
    this.networkHelper.waitUntilReachable();
  }

  turnOffNetwork(suppressError: boolean = true) {
    this.networkHelper.setNetwork(false, suppressError);
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