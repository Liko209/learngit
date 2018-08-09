/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:16:21
 * Copyright © RingCentral. All rights reserved.
 */

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
    this._chain = this._chain.then(()=>cb(this._t));
    return this;
  }

  async execute() {
    let chain = this._chain;
    this._chain = Promise.resolve();
    await chain;
  }

  shouldNavigateTo<T extends BasePage>(
    pageClass: { new(t: TestController, chain?: Promise<any>): T }): T {
    this.onExit();
    const page = new pageClass(this._t, this._chain);
    page.onEnter();
    return page;
  }
}
