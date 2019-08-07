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
    return this.getBackNForward('back');
  }

  get backButtonByClass() {
    return this.getSelector('.chevron_left');
  }

  async clickBackButton() {
    await this.t.click(this.backButtonByClass)
  }

  async hoverBackButton() {
    await this.t.hover(this.backButtonByClass)
  }


  get forwardButton() {
    return this.getBackNForward('forward');
  }

  get forwardButtonByClass() {
    return this.getSelector('.chevron_right');
  }

  async clickForwardButton() {
    await this.t.click(this.forwardButtonByClass)
  }

  async hoverForwardButton() {
    await this.t.hover(this.forwardButtonByClass)
  }

  get searchBar() {
    this.warnFlakySelector();
    return this.getComponent(SearchBar, this.getSelectorByAutomationId('topBar-search-bar'));
  }

  get searchBarSmall(){
    this.warnFlakySelector();
    return this.getComponent(SearchBar, this.getSelectorByIcon('search', this.self).parent('button'));
  }
}

class BackNForward extends BaseWebComponent {

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

class SearchBar extends BaseWebComponent {
  get searchIcon() {
    return this.getSelectorByIcon('search', this.getSelector('header'));
  }

  get inputArea() {
    return this.self.find('input');
  }

  async clickInputArea() {
    await this.t.click(this.inputArea);
  }

  get searchText() {
    return this.inputArea.value;
  }

  async searchTextShouldBeEmpty() {
    await this.t.expect(this.searchText).eql('');
  }

  async searchTextShouldBe(text: string) {
    await this.t.expect(this.searchText).eql(text);
  }

  get closeIcon() {
    return this.getSelectorByIcon('close', this.self);
  }

  async clickCloseIcon() {
    await this.t.click(this.closeIcon);
  }
}

export class TopBarAvatar extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('topBarAvatar');
  }

  async hoverTopBarAvatar() {
    await this.t.hover(this.self);
  }
  
}
