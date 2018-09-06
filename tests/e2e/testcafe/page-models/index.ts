
/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import { Selector } from 'testcafe';
import { ReactSelector } from 'testcafe-react-selectors';
import { Status } from '../libs/report';
import { TestHelper } from '../libs/helpers';
import { SITE_URL } from '../config';

export abstract class BaseUI {
  protected _t: TestController;
  protected _helper: TestHelper;

  protected _chain: Promise<any>;
  public then: any;

  constructor(
    t: TestController,
    chain?: Promise<any>,
  ) {
    this._t = t;
    this._helper = new TestHelper(t);
    this._chain = chain || Promise.resolve();
    if (chain !== undefined) {
      this._forwardThen();
    }
  }

  private _forwardThen() {
    this.then = function () {
      const promise = this._chain;
      this._chain = Promise.resolve();
      return promise.then.apply(promise, arguments);
    };
  }

  chain(cb: (t: TestController, h?: TestHelper, value?: any) => Promise<any>) {
    this._chain = this._chain.then(value => cb(this._t, this._helper, value));
    this._forwardThen();
    return this;
  }

  log(
    message: string,
    status: Status = Status.PASSED,
    takeScreen: boolean = false,
    startTime?: number,
    endTime?: number,
  ) {
    return this.chain(async t =>
      await this._helper.log(message, status, takeScreen, startTime, endTime, undefined),
    );
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

  shouldNavigateTo<T extends BaseUI>(
    uiClass: { new(t: TestController, chain?: Promise<any>): T }): T {
    const ui = new uiClass(this._t, this._chain);
    return ui;
  }
  reload() {
    return this.chain(async (t) => {
      await t.navigateTo(SITE_URL);
    });
  }
}

export abstract class BaseComponent extends BaseUI {
}

export abstract class BasePage extends BaseUI {

  navigateTo(url: string): this {
    return this.chain(async (t) => {
      await t.navigateTo(url);
    });
  }
}
