import { BaseWebComponent } from '../../BaseWebComponent';

export class MemberInput extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="combobox"]');
  }

  get memberInputArea() {
    return this.self.find('#downshift-multiple-input');
  }

  async typeMember(text: string, options?) {
    await this.t.typeText(this.memberInputArea, text, options)
  }

  get selectedMembers() {
    this.warnFlakySelector();
    return this.self.find('*[role="button"]').withAttribute('uid');
  }

  async removeSelectedMember(n: number = -1) {
    await this.t.click(this.selectedMembers.nth(n).find('button'));
  }

  get lastSelectedMemberId() {
    return this.selectedMembers.nth(-1).getAttribute('uid');
  }

  get lastSelectedMemberName() {
    return this.selectedMembers.nth(-1).find('.label');
  }

  async lastSelectedMemberNameShouldBe(name: string) {
    await this.t.expect(this.lastSelectedMemberName.withText(name)).ok();
  }

  get contactSearchSuggestionsList() {
    return this.getSelectorByAutomationId("contactSearchSuggestionsList");
  }

  get contactSearchItems() {
    return this.contactSearchSuggestionsList.find('li');
  }

  async selectMemberByNth(n: number) {
    await this.t.click(this.contactSearchItems.nth(n));
  }

  async selectMemberByName(name: string) {
    await this.t.click(this.contactSearchItems.find('.primary').withText(name));
  }

  async selectMemberByEmail(email: string) {
    await this.t.click(this.contactSearchItems.find('.secondary').withText(email));
  }

  async addMember(name: string) {
    await this.typeMember(name, { paste: true });
    await this.t.wait(3e3);
    await this.selectMemberByNth(0);
  }
}