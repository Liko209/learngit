import { BaseWebComponent } from "../../BaseWebComponent";

export class Header extends BaseWebComponent {
  get self() {
    return this.getSelector('header');
  }

  getBackNForward(name: string) {
    return this.getComponent(
      BackNForward, 
      this.getSelectorByAutomationId(name, this.self)
    );
  }

  get backButton() {
    return this.getBackNForward('Back');
  }

  get forwardButton() {
    return this.getBackNForward('Forward');
  }
  
  get search() {
    this.warnFlakySelector();
    return this.getComponent(Search, this.getSelector('.search-bar', this.self));
  }
}

class BackNForward extends BaseWebComponent {
  async click() {
    await this.t.click(this.self);
  }

  get isDisable(): Promise<boolean> {
    return this.self.hasAttribute('disabled');
  }

  async shouldBeDisabled() {
    await this.t.expect(this.isDisable).ok();
  }

  async shouldBeEnabled() {
    await this.t.expect(this.isDisable).notOk();
  }
}

class Search extends BaseWebComponent {
  get icon() {
    return this.self.find('.material-icons').withText('search');
  }

  get inputArea() {
    this.warnFlakySelector();
    return this.self.find('input');
  }
  
  async typeText(text: string, options?: TypeActionOptions) {
    await this.t.typeText(this.inputArea, text, options)
  }
  
  get closeButton() {
    return this.self.find('.material-icons').withText('close');
  }

  async close() {
    await this.t.click(this.closeButton);
  }
  
}

class SearchResult extends BaseWebComponent {
  get items() {
    return this.self.find('li[.search-items]');
  }

  nthItem(n) {
    return this.items.nth(n);
  }
}

class SearchItem extends BaseWebComponent {
  avatar() {
    return this.self.find('div').hasAttribute('uid');
  }
  
  text() {
    return this.self.child('div').nth(1);
  }
}