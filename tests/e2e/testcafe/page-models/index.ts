abstract class BasePage {

    constructor(
        protected t: TestController
    ) {}

    abstract onEnter(): void;
    abstract onExit(): void;

    expectNavigateTo<T extends BasePage> (pageClass: { new(t: TestController): T }): T {
        const page = new pageClass(this.t);
        this.onExit();
        page.onEnter();
        return page;
    }
}


class BlankPage extends BasePage {
    onEnter() {}
    onExit() {}
}