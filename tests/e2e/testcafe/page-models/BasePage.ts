/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:21
 * Copyright © RingCentral. All rights reserved.
 */
import { Selector } from 'testcafe';
import { ReactSelector } from 'testcafe-react-selectors';
import { Status, AllureStep } from '../libs/report';
import { TestHelper } from '../libs/helpers';

export abstract class BasePage {
  private _t: TestController;
  private _chain: Promise<any>;
  private _helper: TestHelper;
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

  protected onEnter() { }
  protected onExit() { }

  protected chain(cb: (t: TestController, value?: any) => Promise<any>) {
    this._chain = this._chain.then((value: any) => cb(this._t, value));
    this._forwardThen();
    return this;
  }

  protected click(el: Selector) {
    return this.chain(async t => await t.click(el));
  }

  protected wait(timeout: number) {
    return this.chain(async t => await t.wait(timeout));
  }

  protected waitFor(selector: Selector) {
    return this.chain(async (t) => {
      await selector;
    });
  }

  protected checkExist(selector: Selector) {
    return this.chain(t => t.expect(selector.exists).ok());
  }

  private _forwardThen() {
    this.then = function () {
      const promise = this._chain;
      this._chain = Promise.resolve();
      return promise.then.apply(promise, arguments);
    };
  }

  protected async log(
    message: string,
    status: Status = Status.PASSED,
    takeScreen: boolean = false,
    startTime?: number,
    endTime?: number,
    parent?: AllureStep) {
    return await this._helper.log(message, status, takeScreen, startTime, endTime, parent);
  }

  async execute() {
    const chain = this._chain;
    this._chain = Promise.resolve();
    return await chain;
  }

  shouldNavigateTo<T extends BasePage>(
    pageClass: { new(t: TestController, chain?: Promise<any>): T }): T {
    this.onExit();
    const page = new pageClass(this._t, this._chain);
    page.onEnter();
    return page;
  }
}
