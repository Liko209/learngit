import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h } from '../../../../helpers';
import { ClientFunction } from 'testcafe';
import { MentionPage, BookmarkPage, ConversationPage, DuplicatePromptPage} from "./ConversationPage";


class Entry extends BaseWebComponent {
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
    return this.getComponent(Entry, this.self.find('li').withText(name));
  }

  private getToggler(id: string) {
    return this.getComponent(Entry, this.getSelectorByAutomationId(id));
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
    return this.self.find('span').withText('more_vert');
  }

  async getUmi() {
    const umi = this.self.find('.umi');
    if (await umi.exists == false) {
      return 0;
    }
    const text = await umi.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    if (text == '99+') {
      return 100;
    }
    return Number(text);
  }

  async expectUmi(n: number, waitTime: number = 10) {
    let i = 0;
    while (true) {
      await this.t.wait(1e3);
      try {
        await this.t.expect(await this.getUmi()).eql(n);
        return;
      } catch (err) {
        if (i >= waitTime) {
          throw err;
        }
        i = i + 1;
      }
    }
  }

  async openMoreMenu() {
    const moreButton = this.moreMenuEntry;
    await this.t.expect(moreButton.exists).ok();
    const displayMoreButton = ClientFunction(
      () => { moreButton().style["display"] = "inline-block"; },
      { dependencies: { moreButton } }
    );
    await displayMoreButton();
    await this.t.click(this.moreMenuEntry);
  }

  get hasDraftMessage() {
    return this.self.find('.material-icons').withText('border_color').exists;
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

  async getHeaderUmi() {
    const umi = this.header.find('.umi');
    if (!await umi.exists) {
      return 0;
    }
    const text = await umi.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    if (text == '99+') {
      return 100;
    }
    return Number(text);
  }

  async expectHeaderUmi(n: number, waitTime: number = 10) {
    let i = 0;
    while (true) {
      await this.t.wait(1e3);
      try {
        await this.t.expect(await this.getHeaderUmi()).eql(n);
        return;
      } catch (err) {
        if (i >= waitTime) {
          throw err;
        }
        i = i + 1;
      }
    }
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

  conversationEntryById(groupId: string) {
    return this.getComponent(ConversationEntry, this.conversations.filter(`[data-group-id="${groupId}"]`));
  }

  conversationEntryByName(name: string) {
    this.warnFlakySelector();
    return this.getComponent(ConversationEntry, this.conversations.find('p').withText(name).parent(0));
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

export class MessageTab extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelectorByAutomationId('leftRail').parent(1);
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
  get mentionsEntry() {
    return this.getComponent(Entry, this.getSelectorByAutomationId('entry-mentions'));
  }
  get conversationPage() {
    return this.getComponent(ConversationPage);
  }

  get mentionPage() {
    return this.getComponent(MentionPage);
  }

  get duplicatePromptPage(){
    return this.getComponent(DuplicatePromptPage);
  }

  get postListPage() {
    return this.getSelectorByAutomationId('post-list-page');
  }

  get bookmarksEntry() {
    return this.getComponent(Entry, this.getSelectorByAutomationId('entry-bookmarks'));
    }

    get bookmarkPage() {
    return this.getComponent(BookmarkPage);
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
