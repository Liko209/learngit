import { BaseWebComponent } from '../../BaseWebComponent';

export class searchComoBox extends BaseWebComponent {
  get InputArea() {
    return this.self.find('#downshift-multiple-input');
  }

  async typeText(text: string, options?) {
    await this.t.typeText(this.InputArea, text, options)
  }

  get selectedItems() {
    return this.self.find('*[role="button"]');
  }

  async removeSelectedItem(n: number = -1) {
    await this.t.click(this.selectedItems.nth(n).find('button'));
  }

  get selectedMembers() {
    this.warnFlakySelector();
    return this.selectedItems.find('[uid]').parent('[role="button"]');
  }

  get selectedConversations() {
    this.warnFlakySelector();
    return this.selectedItems.filter('cid').parent('[role="button"]');

  }
  async removeSelectedMember(n: number = -1) {
    await this.t.click(this.selectedMembers.nth(n).find('button'));
  }

  get lastSelectedMemberId() {
    return this.selectedMembers.nth(-1).getAttribute('uid');
  }

  get lastSelectedConversationId() {
    return this.selectedConversations.nth(-1).getAttribute('cid');
  }

  get lastSelectedName() {
    return this.selectedMembers.nth(-1).find('.label');
  }

  async lastSelectedNameShouldBe(name: string) {
    await this.t.expect(this.lastSelectedName.withText(name)).ok();
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
    await this.t.click(this.contactSearchItems.find('.list-item-primary').withText(name));
  }

  async selectMemberByEmail(email: string) {
    await this.t.click(this.contactSearchItems.find('.list-item-secondary').withText(email));
  }

  async addMember(name: string) {
    await this.typeText(name, { paste: true });
    await this.t.wait(3e3);
    await this.selectMemberByNth(0);
  }

  get conversationSearchSuggestionList() {
    return this.getSelectorByAutomationId("GroupSearchGroupSuggestionsList");
  }

  get conversationSearchItems() {
    return this.conversationSearchSuggestionList.find('li');
  }
}