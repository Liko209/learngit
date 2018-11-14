import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h } from '../../../../helpers';

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

  private getToggler(id: string) {
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

  async waitUntilUmiExist(exist: boolean, timeout = 20) {
    let tryTime = 0;
    let count = await this.getUmi();
    if (exist == !!count) {
      return
    }
    while (true) {
      if (tryTime >= timeout) {
        throw (`Wait until conversation without UMI: timeout: ${timeout}s`)
      }
      tryTime = tryTime + 1;
      await this.t.wait(1e3);
      count = await this.getUmi();
      if (exist == !!(count)) {
        break
      }
    }
  }

  async enter() {
    await this.t.hover(this.self).click(this.self);
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
    return this.getComponent(ConversationEntry, this.conversations.filter(`[data-group-id="${groupId}"]`));
  }

  conversationByNameEntry(name: string) {
    return this.getComponent(ConversationEntry, this.conversations.find('p').withText(name));
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

class PostItem extends BaseWebComponent {
  get avatar() {
    return this.self.find(`[data-name="avatar"]`);
  }

  get name() {
    return this.self.find(`[data-name="name"]`);
  }

  get userStatus() {
    this.warnFlakySelector();
    return this.name.nextSibling('div')
  }

  get time() {
    return this.self.find(`[data-name="time"]`);
  }

  get body() {
    return this.self.find(`[data-name="body"]`);
  }

  get text() {
    return this.self.find(`[data-name="text"]`);
  }
}

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

  postItemById(postId: string) {
    return this.getComponent(PostItem, this.posts.filter(`[data-id="${postId}"]`));
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
      '[data-test-automation-id="messagePanel"]',
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

  async getCurrentGroupIdFromURL(): Promise<number> {
    await this.isValidUrl();
    return Number(/messages\/(\d+)/.exec(await h(this.t).href)[1]);
  }

  async isValidUrl() {
    const url = await h(this.t).href;
    const result = /messages\/(\d+)/.test(url);
    assert(result, `invalid url: ${url}`);
  }
}
