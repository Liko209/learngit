export abstract class BasePage {

  private _t: TestController;
  private _chain: TestControllerPromise | undefined;

  constructor(
    t: TestController,
    chain?: TestControllerPromise
  ) {
    this._t = t;
    this._chain = chain;
  }

  protected onEnter() { };
  protected onExit() { };

  protected chain(cb: (t: TestController | TestControllerPromise) => TestControllerPromise) {
    const t = (this._chain === undefined) ? this._t : this._chain;
    this._chain = cb(t);
    return this;
  }

  then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => PromiseLike<never>): Promise<any> {
    const chain = this._chain;
    this._chain = undefined;
    if (chain !== undefined) {
      return chain.then(onFulfilled, onRejected);
    }
    return Promise.resolve();
  }


  shouldNavigateTo<T extends BasePage>(pageClass: { new(t: TestController, chain?: TestControllerPromise): T }): T {
    this.onExit();
    const page = new pageClass(this._t, this._chain);
    page.onEnter();
    return page;
  }
}
