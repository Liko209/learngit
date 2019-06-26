import * as _ from 'lodash';
import * as assert from 'assert'
import { BaseWebComponent, Umi } from '../../../BaseWebComponent';
import { h, H } from '../../../../helpers';
import { ClientFunction } from 'testcafe';
import { MentionPage, BookmarkPage, ConversationPage, DuplicatePromptPage } from "./ConversationPage";
import { RightRail } from './RightRail';
import { LeftRail } from './LeftRail';
import { EmojiLibrary, EmojiMatchList } from './EmojiLib';

class Entry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
    await this.waitForAllSpinnersToDisappear();
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
    return await this.self.child().find('.arrow_up').exists;
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

  get markAsReadOrUnread() {
    return this.getToggler('readOrUnreadConversation');
  }

  get close() {
    return this.getComponent(MenuItem, this.self.find('*[data-test-automation-id="closeConversation"]'));
  }
}

class MenuItem extends Entry {

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

class ConversationEntry extends BaseWebComponent {
  get moreMenuEntry() {
    return this.getSelectorByAutomationId('conversationListItemMoreButton', this.self);
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
    await this.t.expect(this.exists).notOk();
  }

  get umi() {
    return this.getComponent(Umi, this.self.find(".umi"));
  }

  async shouldBeUmiStyle() {
    await H.retryUntilPass(async () => {
      const textStyle = await this.self.find('p').style;
      const textFontWeight = textStyle['font-weight'];
      assert.ok(/bold|700/.test(textFontWeight), `${textFontWeight} not eql specify: bold | 700`);
    });
  }

  async shouldBeNormalStyle() {
    await H.retryUntilPass(async () => {
      const textStyle = await this.self.find('p').style;
      const textFontWeight = textStyle['font-weight'];
      assert.ok(/normal|400/.test(textFontWeight), `${textFontWeight} not eql specify: normal | 400`);
    });
  }

  async ensureMoreButton() {
    const moreButton = this.moreMenuEntry;
    await this.t.expect(moreButton.exists).ok();
    const displayMoreButton = ClientFunction(
      () => { moreButton().style["display"] = "inline-flex"; },
      { dependencies: { moreButton } }
    );
    await displayMoreButton();
    return moreButton;
  }

  async openMoreMenu() {
    await this.ensureMoreButton();
    await this.t.click(this.moreMenuEntry);
  }

  async hoverMoreButton() {
    const moreButton = await this.ensureMoreButton();
    await this.t.hover(moreButton);
  }

  get hasDraftMessage() {
    return this.getSelectorByIcon('draft').exists;
  }

  async enter() {
    await this.t.hover(this.self).click(this.self);
    // whenever we enter
    await this.waitForAllSpinnersToDisappear();
  }
}

class ConversationSection extends BaseWebComponent {
  get header() {
    return this.getSelectorByAutomationId('conversation-list-section-header', this.self);
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
    return this.getSelectorByIcon('arrow_up', this.self).exists;
  }

  private async toggle(expand: boolean) {
    const isExpand = await this.isExpand;
    if (isExpand != expand) {
      await this.t.click(this.header);
    }
  }

  async expand() {
    await this.toggle(true);
  }

  async fold() {
    await this.toggle(false);
  }

  get headerUmi() {
    return this.getComponent(Umi, this.header.find(".umi"));
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

  get title() {
    return this.getSelectorByAutomationId('DialogTitle');
  }

  get dontAskAgainCheckbox() {
    this.warnFlakySelector();
    return this.self.find('label');
  }

  get cancelButton() {
    this.warnFlakySelector();
    return this.buttonOfText('Cancel');
  }

  get closeButton() {
    this.warnFlakySelector();
    return this.buttonOfText('Close');
  }

  async toggleDontAskAgain() {
    await this.t.click(this.dontAskAgainCheckbox);
  }

  async clickCancelButton() {
    await this.t.click(this.cancelButton);
  }

  async clickCloseButton() {
    await this.t.click(this.closeButton);
  }
}

export class MessageTab extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelectorByAutomationId('leftRail').parent(1);
  }

  private getSection(name: string) {
    return this.getComponent(
      ConversationSection,
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

  get deleteConfirmDialog() {
    return this.getSelectorByAutomationId('deleteConfirmDialog');
  }

  get deleteCancelButton() {
    return this.getSelectorByAutomationId('deleteCancelButton');
  }

  get deleteOkButton() {
    return this.getSelectorByAutomationId('deleteOkButton');
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


  get sections() {
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

  get leftRail() {
    return this.getComponent(LeftRail);
  }

  get rightRail() {
    return this.getComponent(RightRail);
  }

  get emojiLibrary() {
    return this.getComponent(EmojiLibrary);
  }

  get emojiMatchList() {
    return this.getComponent(EmojiMatchList);
  }

}
