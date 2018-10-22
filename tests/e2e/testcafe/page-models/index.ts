/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import { getLogger } from "log4js";
import { Selector } from 'testcafe';
import { ReactSelector, waitForReact } from 'testcafe-react-selectors';

import { Status } from '../libs/report';
import { TestHelper } from '../libs/helpers';
import { SITE_URL } from '../config';

const logger = getLogger(__filename);

export interface UICreator<T> {
  new (t: TestController): T;
}

export abstract class BaseUI {

  protected _helper: TestHelper;
  public then: any;

  constructor(public t: TestController) {
    this._helper = new TestHelper(t);
    this._delegateThen();
  }

  get _chain(): Promise<any> {
    return this.t.ctx.__chain || Promise.resolve();
  }

  set _chain(promise: Promise<any>) {
    this.t.ctx.__chain = promise;
  }

  private _delegateThen() {
    this.then = function () {
      const promise = this._chain;
      this._chain = undefined;
      return promise.then.apply(promise, arguments);
    };
  }

  chain(cb: (t: TestController, h?: TestHelper, value?: any) => Promise<any>) {
    this._chain = this._chain.then(value => cb(this.t, this._helper, value));
    this._delegateThen();
    return this;
  }

  log(
    message: string,
    status: Status = Status.PASSED,
    takeScreen: boolean = false,
    startTime?: number,
    endTime?: number,
  ) {
    return this.chain(
      async t =>
        await this._helper.log(
          message,
          status,
          takeScreen,
          startTime,
          endTime,
          undefined,
        ),
    );
  }
  debug(){
    return this.chain(
      async t =>
        await t.debug()
    )
  }
  selectComponent(str: string) {
    return ReactSelector(str);
  }

  clickComponent(str: string) {
    return this.clickElement(this.selectComponent(str));
  }

  select(str: string) {
    return Selector(`*[data-anchor="${str}"]`);
  }

  click(str: string) {
    return this.clickElement(this.select(str));
  }

  clickElement(el: Selector) {
    return this.chain(async t => await t.click(el));
  }

  shouldNavigateTo<T>(
    uiCreator: UICreator<T>): T {
    return new uiCreator(this.t);
  }

  checkExisted(selector: Selector) {
    return this.chain(async t => {
      await t.expect(selector.exists).ok();
    });
  }

  validateSelectors() {
    const re = /get (.+)\(/g;
    const str = this.constructor.toString();
    const selectorNames: string[] = [];
    let match;
    while ((match = re.exec(str))) {
      selectorNames.push(match[1]);
    }

    return this.chain(async t => {
      for (const selectorName of selectorNames) {
        const selector = this[selectorName];
        await selector;
        await t
          .expect(selector.exists)
          .ok(`Selector "${selectorName}" can not match any component`);
      }
    });
  }

  useRole(role) {
    return this.chain(async t => {
      await t.useRole(role);
    });
  }

  reload() {
    return this.chain(async t => {
      await t.navigateTo(SITE_URL);
    });
  }
}

export abstract class BaseComponent extends BaseUI {
  waitForReact() {
    return this.chain(async t => {
      await waitForReact();
    });
  }
}

export abstract class BasePage extends BaseUI {

  navigateTo(url: string) {
    return this.chain(async t => {
      await t.navigateTo(url);
      await waitForReact();
    }).ensurePageLoaded();
  }

  ensurePageLoaded() {
    logger.warn('You should overwrite ensurePageLoaded in your page model!');
    return this;
  }

}
