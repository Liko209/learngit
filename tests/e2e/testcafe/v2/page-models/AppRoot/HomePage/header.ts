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
    return this.getSelectorByAutomationId('search-icon');
  }

  get inputArea() {
    return this.getSelectorByAutomationId('search-input');
  }

  async typeText(text: string, options?: TypeActionOptions) {
    await this.t.typeText(this.inputArea, text, options)
  }

  get closeButton() {
    return this.getSelectorByIcon('close');
  }

  async close() {
    await this.t.click(this.closeButton);
  }

  get allResultItems() {
    return this.getSelector('.search-items');
  }

  get peoples() {
    return this.getSelectorByAutomationId('search-People-item');
  }

  get groups() {
    return this.getSelectorByAutomationId('search-Groups-item');
  }

  get teams() {
    return this.getSelectorByAutomationId('search-Teams-item');
  }

  nthPeople(n: number) {
    return this.getComponent(SearchItem, this.peoples.nth(n));
  }

  nthGroup(n: number) {
    return this.getComponent(SearchItem, this.groups.nth(n));
  }

  nthTeam(n: number) {
    return this.getComponent(SearchItem, this.teams.nth(n));
  }
}

class SearchItem extends BaseWebComponent {
  get avatar() {
    return this.getSelectorByAutomationId('search-item-avatar', this.self);
  }

  get name() {
    return this.getSelectorByAutomationId('search-item-text', this.self);
  }

  // people
  get uid() {
    return this.avatar.find("div").withAttribute('uid').getAttribute('uid');
  }

  // group or team
  get cid() {
    return this.avatar.find("div").withAttribute('cid').getAttribute('cid');
  }

  async getId() {
    if (await this.avatar.find('div').withAttribute('uid').exists) {
      return await this.uid;
    }
    return await this.cid;
  }

  async enter() {
    await this.t.click(this.self);
  }

  async clickAvatar() {
    await this.t.click(this.avatar);
  }

  async clickName() {
    await this.t.click(this.name);
  }
}
