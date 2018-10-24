import * as _ from 'lodash';
import { BaseWebComponent } from '../../../BaseWebComponent';

class MoreMenuEntry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.root);
  }
}

class MoreMenu extends BaseWebComponent {
  get root() {
    return this.getSelector('*[role="document"]');
  }

  private getEntry(name: string) {
    this.warnFlakySelector();
    return this.getComponent(
      MoreMenuEntry,
      this.root.find('li').withText(name),
    );
  }

  get favorite() {
    return this.getEntry('Favorite');
  }

  get close() {
    return this.getEntry('Close');
  }
}

class ConversationEntry extends BaseWebComponent {
  get moreMenuEntry() {
    this.warnFlakySelector();
    return this.root.child().withText('more_vert');
  }

  async getUmi() {
    const umi = this.root.find('.umi');
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

  async enter() {
    await this.t.hover('html').click(this.root);
  }
}

class ConversationListSection extends BaseWebComponent {
  ensureLoaded() {
    return this.waitUntilExist(this.root);
  }

  get toggleButton() {
    return this.root.find('*[role="button"]');
  }

  get conversations() {
    return this.root.find('*[role="menuitem"]');
  }

  nthConversationEntry(n: number) {
    return this.getComponent(ConversationEntry, this.conversations.nth(n));
  }

  async isExpand() {
    this.warnFlakySelector();
    return await this.root.child().withText('keyboard_arrow_up').exists;
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

class PostItem extends BaseWebComponent {}

class ConversationSection extends BaseWebComponent {
  get root() {
    return this.getSelector('.conversation-page');
  }

  get posts() {
    return this.root.find('*[data-name="conversation-card"]');
  }

  nthPostItem(nth: number) {
    return this.getComponent(PostItem, this.posts.nth(nth));
  }
}

class CloseConversationModal extends BaseWebComponent {
  get root() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get dontAskAgainCheckbox() {
    this.warnFlakySelector();
    return this.root.find('input');
  }

  get confirmButton() {
    this.warnFlakySelector();
    return this.root.find('button');
  }

  async toggleDontAskAgain() {
    await this.t.click(this.dontAskAgainCheckbox);
  }

  async confirm() {
    await this.t.click(this.confirmButton);
  }
}

export class MessagePanel extends BaseWebComponent {
  get root() {
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

  get conversationSection() {
    return this.getComponent(ConversationSection);
  }

  get moreMenu() {
    return this.getComponent(MoreMenu);
  }

  get closeConversationModal() {
    return this.getComponent(CloseConversationModal);
  }

  get conversationPage() {
    return this.getSelector('.conversation-page');
  }
}
