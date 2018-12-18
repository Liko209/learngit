import 'testcafe';
import { ClientFunction, Role } from 'testcafe';
import { getLogger } from 'log4js';

import { DataHelper } from './data-helper'
import { SdkHelper } from "./sdk-helper";
import { JupiterHelper } from "./jupiter-helper";
import { A11yHelper } from "./a11y-helper";
import { LogHelper } from './log-helper';
import { DashboardHelper } from './dashboard-helper';
import { AllureHelper } from './allure-helper';
import { H } from './utils';

import { IUser, IStep } from '../models';
import { AppRoot } from '../page-models/AppRoot';
import { SITE_URL } from '../../config';

const logger = getLogger(__filename);
logger.level = 'info';

class Helper {

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

  async log(step: IStep | string, takeScreenShot: boolean = false) {
    return await this.logHelper.log(step, takeScreenShot);
  }

  async withLog(step: IStep | string, cb: () => Promise<any>, takeScreenShot: boolean = false) {
    return await this.logHelper.withLog(step, cb, takeScreenShot);
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

  // testcafe extend
  get href() {
    return ClientFunction(() => document.location.href)();
  }

  async refresh() {
    await this.t.navigateTo(await this.href);
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

  async userRole(user: IUser, cb?:(appRoot) => Promise<any>) {
    return await Role(SITE_URL, async (t) => {
      const newApp = new AppRoot(t);
      await h(t).directLoginWithUser(SITE_URL, user);
      await newApp.loginPage.interactiveSignIn(user.company.number, user.extension, user.password);
      await newApp.homePage.ensureLoaded(); 
      if (cb != undefined) {
        await cb(newApp);
      }
    }, {
      preserveUrl: true,
    })
  }

  // a temporary method:  need time to wait back-end and front-end sync umi data.
  async waitUmiDismiss(timeout: number = 1e3) {
    await this.t.wait(timeout);
  }

  // misc
  async resetGlipAccount(user: IUser) {
    const adminGlip = await this.sdkHelper.sdkManager.getGlip(user.company.admin);
    await adminGlip.deactivated(user.rcId);
    await this.sdkHelper.sdkManager.getGlip(user);
  }
}

function h(t: TestController) {
  return new Helper(t);
}

export { Helper, h, H };
