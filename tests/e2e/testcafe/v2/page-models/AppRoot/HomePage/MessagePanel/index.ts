import * as _ from 'lodash';
import { BaseWebComponent } from '../../../BaseWebComponent';

class MoreMenuEntry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
  }
}

class MoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="document"]');
  }

  private getEntry(name: string) {
    this.warnFlakySelector();
    return this.getComponent(
      MoreMenuEntry,
      this.self.find('li').withText(name),
    );
  }

  private getToggler(id: string){
    return this.getComponent(
      MoreMenuEntry,
      this.getSelectorByAutomationId(id),
    ); 
  }
  
  get favoriteToggler() {
    return this.getToggler('favToggler');
  }

  get close() {
    return this.getEntry('Close');
  }
}

class ConversationEntry extends BaseWebComponent {
  get moreMenuEntry() {
    this.warnFlakySelector();
    return this.self.child().withText('more_vert');
  }

  async getUmi() {
    const umi = this.self.find('.umi');
    const text = await umi.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    if (text == '99+') {
      return 100;
    }
    return Number(text);
  }

  async openMoreMenu() {
    await this.t.hover(this.moreMenuEntry).click(this.moreMenuEntry);
  }

  async waitUntilUmiExist(timeout=20) {
    const umiCount = this.getUmi(); 
    let tryTime = 0
    while (!await umiCount) {
      if (tryTime >= timeout){
        throw(`Wait until conversation with UMI: timeout: ${timeout}s`)
      }
      tryTime = tryTime + 1;
      await this.t.wait(1e3);
    } 
  }

  async waitUntilUmiNotExist(timeout=20){
    const umiCount = this.getUmi(); 
    let tryTime = 0
    while (await umiCount) {
      if (tryTime >= timeout){
        throw(`Wait until conversation without UMI: timeout: ${timeout}s`)
      }
      tryTime = tryTime + 1;
      await this.t.wait(1e3);
    } 
  }

  async enter() {
    await this.t.hover('html').click(this.self);
  }
}

class ConversationListSection extends BaseWebComponent {
  ensureLoaded() {
    return this.waitUntilExist(this.self);
  }

  get toggleButton() {
    return this.self.find('[role="button"]');
  }

  get header() {
    return this.self.find('.conversation-list-section-header');
  }

  get collapse() {
    return this.self.find('.conversation-list-section-collapse').parent(2);
  }

  get conversations() {
    return this.self.find('.conversation-list-item');
  }

  nthConversationEntry(n: number) {
    return this.getComponent(ConversationEntry, this.conversations.nth(n));
  }

  conversationByIdEntry(groupId: string) {
    return this.getComponent(ConversationEntry, this.conversations.filter(`[data-group-id="${groupId}"]`))
  }

  async isExpand() {
    this.warnFlakySelector();
    return await this.self.child().withText('keyboard_arrow_up').exists;
  }

  private async toggle(expand: boolean) {
    const isExpand = await this.isExpand();
    if ((!isExpand && expand) || (isExpand && !expand)) {
      await this.t.click(this.toggleButton);
    }
  }

  async expand() {
    await this.toggle(true);
  }

  async fold() {
    await this.toggle(false);
  }
}

class PostItem extends BaseWebComponent { }

class ConversationPage extends BaseWebComponent {
  get self() {
    return this.getSelector('.conversation-page');
  }

  get posts() {
    return this.self.find('[data-name="conversation-card"]');
  }

  get header() {
    return this.getSelectorByAutomationId('conversation-page-header');
  }

  get messageInputArea() {
    this.warnFlakySelector();
    return this.self.child().find('.ql-editor');
  }

  async sendMessage(message: string) {
    await this.t
      .typeText(this.messageInputArea, message)
      .click(this.messageInputArea)
      .pressKey('enter');
  }

  nthPostItem(nth: number) {
    return this.getComponent(PostItem, this.posts.nth(nth));
  }
}

class CloseConversationModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get dontAskAgainCheckbox() {
    this.warnFlakySelector();
    return this.self.find('input');
  }

  get confirmButton() {
    this.warnFlakySelector();
    return this.self.find('button');
  }

  async toggleDontAskAgain() {
    await this.t.click(this.dontAskAgainCheckbox);
  }

  async confirm() {
    await this.t.click(this.confirmButton);
  }
}

export class MessagePanel extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector(
      '[data-test-automation-id="leftPanel"]',
    ).nextSibling();
  }

  private getSection(name: string) {
    return this.getComponent(
      ConversationListSection,
      this.getSelector(`*[data-name="${name}"]`),
    );
  }

  get favoritesSection() {
    return this.getSection('Favorites');
  }

  get directMessagesSection() {
    return this.getSection('Direct Messages');
  }

  get teamsSection() {
    return this.getSection('Teams');
  }

  get conversationPage() {
    return this.getComponent(ConversationPage);
  }

  get moreMenu() {
    return this.getComponent(MoreMenu);
  }

  get closeConversationModal() {
    return this.getComponent(CloseConversationModal);
  }

  get conversationListSections() {
    return this.getSelector('.conversation-list-section');
  }
}
