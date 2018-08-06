export abstract class BasePage {

  constructor(
    protected t: TestController
  ) { }

  abstract onEnter(): void;
  abstract onExit(): void;

  shouldNavigateTo<T extends BasePage>(pageClass: { new(t: TestController): T }): T {
    this.onExit();
    const page = new pageClass(this.t);
    page.onEnter();
    return page;
  }
}
