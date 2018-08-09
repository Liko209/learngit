/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:21
 * Copyright © RingCentral. All rights reserved.
 */

import { Status, AllureStep } from '../libs/report';
import { Step } from '../node_modules/@types/allure-js-commons';
export abstract class BasePage {

  private _t: TestController;
  private _chain: Promise<any>;

  constructor(
    t: TestController,
    chain?: Promise<any>,
  ) {
    this._t = t;
    this._chain = chain || Promise.resolve();
  }

  protected onEnter() { }
  protected onExit() { }

  protected chain(cb: (t: TestController) => Promise<any>) {
    this._chain = this._chain.then(() => cb(this._t));
    return this;
  }

  protected log(
    message: string,
    status: Status = Status.PASSED,
    startTime?: number,
    endTime?: number,
    screenPath?: string | undefined,
    parent?: AllureStep): AllureStep {

    if (this._t.ctx.logs == undefined) {
      this._t.ctx.logs = [];
    }
    if (startTime == undefined) {
      startTime = Date.now();
    }
    if (endTime == undefined) {
      endTime = startTime;
    }
    const step = new AllureStep(message, status, startTime, endTime, screenPath, [],);
    if (parent == undefined) {
      this._t.ctx.logs.push(step);
    } else {
      parent.children.push(step);
    }
    console.log(step.toString());
    return step;
  }

  async execute() {
    let chain = this._chain;
    this._chain = Promise.resolve();
    await chain;
    return this;
  }

  shouldNavigateTo<T extends BasePage>(
    pageClass: { new(t: TestController, chain?: Promise<any>): T }): T {
    this.onExit();
    const page = new pageClass(this._t, this._chain);
    page.onEnter();
    return page;
  }
}
