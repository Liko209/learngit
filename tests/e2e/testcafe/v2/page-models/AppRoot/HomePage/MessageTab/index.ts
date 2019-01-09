import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';
import { ClientFunction } from 'testcafe';
import { MentionPage, BookmarkPage, ConversationPage, DuplicatePromptPage } from "./ConversationPage";


class Entry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
  }
}

class UnReadToggler extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('unreadOnlyToggler');
  }

  get title() {
    return this.self.find('.title')
  }

  get toggleButton() {
    return this.self.find('.toggle-button');
  }

  get isChecked() {
    return this.self.find('input[type="checkbox"]').checked;
  }

  async shouldBeOn() {
    await this.t.expect(this.isChecked).ok();
  }

  async shouldBeOff() {
    await this.t.expect(this.isChecked).notOk();
  }

  async isExpand() {
    this.warnFlakySelector();
    return await this.self.child().withText('arrow_up').exists;
  }

  private async turn(on: boolean) {
    const isOn = await this.isChecked;
    if (isOn != on) {
      await this.t.click(this.toggleButton);
    }
  }

  async turnOn() {
    await this.turn(true);
  }

  async turnOff() {
    await this.turn(false);
  }
}

class MoreMenu extends Entry {
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

  get profile() {
    return this.getEntry('Profile');
  }

  get close() {
    return this.getComponent(MenuItem, this.self.find('li').withText('Close'));
  }
}

class MenuItem extends Entry {
  async click() {
    await this.t.click(this.self);
  }

  get disabled(): Promise<string> {
    return this.self.getAttribute("data-disabled");
  }

  async shouldBeDisabled() {
    await this.t.expect(this.disabled).eql('true');
  }

  async shouldBeEnabled() {
    await this.t.expect(this.disabled).eql('false');
  }
}

class ActionBarMoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="document"]');
  }

  private getEntry(name: string) {
    this.warnFlakySelector();
    return this.getComponent(Entry, this.self.find('li').withText(name));
  }

  get quoteItem() {
    return this.getEntry('feedback');
  }

  get deletePost() {
    return this.self.find('span').withText('delete').parent();
  }

  get eidtPost() {
    return this.self.find('span').withText('edit').parent();
  }


}

class ConversationEntry extends BaseWebComponent {
  get moreMenuEntry() {
    this.warnFlakySelector();
    return this.self.find('span').withText('more_vert');
  }

  get name() {
    return this.self.find("p").textContent;
  }

  get groupId() {
    return this.self.getAttribute("data-group-id");
  }

  get isVisible(): Promise<boolean> {
    return this.self.visible;
  }

  async nameShouldBe(name: string) {
    await this.t.expect(this.name).eql(name);
  }

  async groupIdShouldBe(id: string | number) {
    await this.t.expect(this.groupId).eql(id.toString());
  }

  async shouldBeVisible() {
    await this.t.expect(this.isVisible).ok();
  }

  async shouldBeInvisible() {
    await this.t.expect(this.isVisible).notOk();
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

  async expectUmi(n: number, maxRetry = 5, interval = 5e3) {
    await H.retryUntilPass(async () => {
      const umi = await this.getUmi();
      assert.strictEqual(n, umi, `UMI Number error: expect ${n}, but actual ${umi}`);
    }, maxRetry, interval);
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
    return this.getSelectorByIcon('draft').exists;
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

  async getUmi() {
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

  async expectHeaderUmi(n: number, maxRetry = 5, interval = 5e3) {
    await H.retryUntilPass(async () => {
      const umi = await this.getUmi();
      assert.strictEqual(n, umi, `UMI Number error: expect ${n}, but actual ${umi}`);
    }, maxRetry, interval);
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

  get isExpand() {
    this.warnFlakySelector();
    return this.self.child().withText('arrow_up').exists;
  }

  private async toggle(expand: boolean) {
    const isExpand = await this.isExpand;
    if (isExpand != expand) {
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

class ActionBarDeletePostModal extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get deleteButton() {
    this.warnFlakySelector();
    return this.self.find('button').withText('Delete');
  }
  get cancelButton() {
    this.warnFlakySelector();
    return this.self.find('button').withText('Cancel');
  }

  async delete() {
    await this.t.click(this.deleteButton);
  }

  async cancel() {
    await this.t.click(this.cancelButton);
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

  get unReadToggler() {
    return this.getComponent(UnReadToggler);
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

  get duplicatePromptPage() {
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

  get deletePostModal() {
    return this.getComponent(ActionBarDeletePostModal);
  }

  // get profileModal() {
  //   return this.getComponent(ProfileModal);
  // }

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
