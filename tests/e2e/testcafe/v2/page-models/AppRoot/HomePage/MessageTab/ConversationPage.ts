/*
 * @Author: Mia.Cai
 * @Date: 2018-12-25 10:47:23
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseWebComponent } from '../../../BaseWebComponent';
import * as _ from 'lodash';
import * as assert from 'assert';
import { ClientFunction } from 'testcafe';
import { H } from '../../../../helpers';

import { getLogger } from 'log4js';

const logger = getLogger(__filename);
logger.level = 'info';

class Entry extends BaseWebComponent {
  async enter() {
    await this.t.click(this.self);
  }
}
class ActionBarMoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="menuitem"]');
  }

  private getEntry(icon: string) {
    return this.getComponent(Entry, this.getSelectorByIcon(icon, this.self).parent('li'));
  }

  get quoteItem() {
    return this.getEntry('quote');
  }

  get deletePost() {
    return this.getEntry('delete');
  }

  get editPost() {
    return this.getEntry('edit');
  }
}

class HeaderMoreMenu extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="menu"]');
  }

  private getEntry(menuName: string) {
    return this.getComponent(Entry, this.self.find('li').withExactText(menuName));
  }

  get convertToTeam() {
    return this.getEntry('Convert to team');
  }
}

export class BaseConversationPage extends BaseWebComponent {
  private _self: Selector = this.getSelectorByAutomationId('messagePanel');

  get self() {
    return this._self;
  }

  set self(root: Selector) {
    this._self = root;
  }

  get posts() {
    return this.self.find('[data-name="conversation-card"]');
  }

  get postSenders() {
    return this.self.find('[data-name="name"]');
  }

  get postTimes() {
    return this.self.find('[data-name="time"]');
  }

  get header() {
    return this.getSelectorByAutomationId('conversation-page-header');
  }

  get leftWrapper() {
    return this.header.find('.left-wrapper');
  }

  get title() {
    return this.getSelectorByAutomationId('conversation-page-header-title');
  }

  async timeOfPostsShouldOrderByAsc() {
    const count = await this.postTimes.count;
    let lastTime: number;
    for (const i of _.range(count)) {
      const currentTime = H.convertPostTimeToTimestamp(await this.postTimes.nth(i).textContent);
      if (lastTime) {
        assert.ok(lastTime <= currentTime, 'the posts not order By ASC');
      }
      lastTime = currentTime;
    }
  }

  async timeOfPostsShouldOrderByDesc() {
    const count = await this.postTimes.count;
    let lastTime: number;
    for (const i of _.range(count)) {
      const currentTime = H.convertPostTimeToTimestamp(await this.postTimes.nth(i).textContent);
      if (lastTime) {
        assert.ok(lastTime >= currentTime, 'the posts not order by Desc');
      }
      lastTime = currentTime;
    }
  }

  nthPostItem(nth: number) {
    return this.getComponent(PostItem, this.posts.nth(nth));
  }

  get lastPostItem() {
    return this.nthPostItem(-1);
  }

  async historyPostsDisplayedInOrder(posts: string[]) {
    for (const i of _.range(posts.length)) {
      await this.t.expect(this.nthPostItem(-1 - i).body.withText(posts[posts.length - 1 - i]).exists).ok();
    }
  }

  postItemById(postId: string) {
    return this.getComponent(PostItem, this.posts.filter(`[data-id="${postId}"]`));
  }

  get streamWrapper() {
    return this.getSelectorByAutomationId('jui-stream-wrapper', this.self);
  }

  get stream() {
    return this.getSelectorByAutomationId('jui-stream', this.self);
  }

  get loadingCircle() {
    return this.getSelectorByAutomationId('loading', this.self);
  }

  async waitUntilPostsBeLoaded(timeout = 20e3) {
    await this.t.wait(1e3); // loading circle is invisible in first 1 second.
    return await this.t.expect(this.loadingCircle.exists).notOk({ timeout });
  }

  /* scroll */
  get scrollDiv() {
    return this.getSelectorByAutomationId('virtualized-list', this.stream);
  }

  async expectStreamScrollToY(y: number) {
    await this.t.expect(this.scrollDiv.scrollTop).eql(y);
  }

  async expectStreamScrollToBottom() {
    await H.retryUntilPass(async () => {
      const scrollTop = await this.scrollDiv.scrollTop;
      const scrollHeight = await this.scrollDiv.scrollHeight;
      const clientHeight = await this.scrollDiv.clientHeight;
      assert.deepStrictEqual(scrollTop, scrollHeight - clientHeight, `${scrollTop} != ${scrollHeight} - ${clientHeight}`)
    });
  }

  async scrollToY(y: number) {
    const scrollDivElement = this.scrollDiv;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }

  async scrollToMiddle() {
    const scrollHeight = await this.scrollDiv.scrollHeight;
    const clientHeight = await this.scrollDiv.clientHeight;
    const middleHeight = (scrollHeight - clientHeight) / 2;
    await this.scrollToY(middleHeight);
  }

  async scrollToBottom(retryTime = 3) {
    // retry until scroll bar at the end
    let initHeight = 0;
    for (const i of _.range(retryTime)) {
      const scrollHeight = await this.scrollDiv.scrollHeight;
      if (initHeight == scrollHeight) {
        break
      }
      initHeight = scrollHeight;
      const clientHeight = await this.scrollDiv.clientHeight;
      await this.scrollToY(scrollHeight - clientHeight);
    }
  }

  async scrollToCurrentFirstPost() {
    const scrollTop = await this.posts.nth(0).scrollTop;
    await this.scrollToY(scrollTop);
  }

  async scrollToCurrentLastPost() {
    const scrollTop = await this.posts.nth(-1).scrollTop;
    await this.scrollToY(scrollTop);
  }

  async isPossibleToScrollBottom() {
    const scrollHeight = await this.scrollDiv.scrollHeight;
    await this.scrollToBottom();
    return scrollHeight !== await this.scrollDiv.scrollHeight
  }

  async isPossibleToScrollUp() {
    const scrollHeight = await this.scrollDiv.scrollHeight;
    await this.scrollToTop();
    return scrollHeight !== await this.scrollDiv.scrollHeight;
  }

  async scrollToTop() {
    await this.scrollToY(0);
  }

  async getScrollHeight() {
    return await this.scrollDiv.scrollHeight;
  }

  async scrollUpToViewPostById(postId: string) {
    const postItem = this.postItemById(postId)
    for (const i of _.range(10)) {
      if (await postItem.exists) {
        await postItem.scrollIntoView()
        break
      } else {
        await this.scrollToCurrentFirstPost();
        await this.t.wait(1e3);
      }
    }
    assert(await postItem.visible, "this post does not exist");
  }

  async scrollDownToViewPostById(postId: string) {
    const postItem = this.postItemById(postId)
    for (const i of _.range(10)) {
      if (await postItem.exists) {
        await postItem.scrollIntoView()
        break
      } else {
        await this.scrollToCurrentLastPost();
        await this.t.wait(1e3);
      }
    }
    assert(await postItem.visible, "this post does not exist");
  }

  get newMessageDeadLine() {
    this.warnFlakySelector();
    return this.stream.find('span').withText('New Messages').parent(1); // todo: automation Id;
  }

  async isVisible(el: Selector) {
    await this.t.expect(el.exists).ok();
    const wrapper = this.streamWrapper;
    const itemTop = await el.getBoundingClientRectProperty('top');
    const itemBottom = await el.getBoundingClientRectProperty('bottom');
    const wrapperTop = await wrapper.getBoundingClientRectProperty('top');
    const wrapperBottom = await wrapper.getBoundingClientRectProperty('bottom');
    return itemTop >= wrapperTop && itemBottom <= wrapperBottom;
  }

  async postByIdExpectVisible(postId: string, visible: boolean) {
    await H.retryUntilPass(async () => {
      const postCard = this.posts.filter(`[data-id="${postId}"]`)
      const result = await this.isVisible(postCard);
      assert.strictEqual(result, visible, `This post expect visible: ${visible}, but actual: ${result}`);
    });
  }

  async nthPostExpectVisible(n: number, isVisible: boolean = true) {
    await H.retryUntilPass(async () => {
      const result = await this.isVisible(this.posts.nth(n));
      assert.strictEqual(result, isVisible, `This post expect visible: ${isVisible}, but actual: ${result}`);
    });
  }

  async newMessageDeadLineExpectVisible(visible: boolean) {
    await H.retryUntilPass(async () => {
      const result = await this.isVisible(this.newMessageDeadLine);
      assert.strictEqual(result, visible, `This 'New Messages' deadline expect visible: ${visible}, but actual: ${result}`);
    });
  }

  get moreButtonOnHeader() {
    return this.getSelectorByIcon('more_vert', this.header);
  }

  async openMoreButtonOnHeader() {
    return this.t.click(this.moreButtonOnHeader);
  }

  get headerMoreMenu() {
    return this.getComponent(HeaderMoreMenu);
  }
}

export class ConversationPage extends BaseConversationPage {
  get jumpToFirstUnreadButtonWrapper() {
    return this.getSelectorByAutomationId('jump-to-first-unread-button')
  }

  async countOnUnreadButtonShouldBe(n: string | number) {
    const reg = new RegExp(`^\\D*${n}\\D+$`)
    await this.t.expect(this.jumpToFirstUnreadButtonWrapper.find('span').textContent).match(reg);
  }

  async clickJumpToFirstUnreadButton() {
    await this.t.click(this.jumpToFirstUnreadButtonWrapper);
  }
  get headerStatus() {
    return this.getSelectorByAutomationId("conversation-page-header-status", this.header);
  }

  get favoriteButton() {
    return this.getSelectorByAutomationId('favorite-icon', this.leftWrapper);
  }

  get favoriteStatusIcon() {
    return this.getSelectorByIcon('star', this.favoriteButton);
  }

  get unFavoriteStatusIcon() {
    return this.getSelectorByIcon('star_border', this.favoriteButton);
  }

  async favorite() {
    await this.t.click(this.leftWrapper.find('.icon.star').nextSibling('input'));
  }

  async unFavorite() {
    await this.t.click(this.leftWrapper.find('.icon.star_border').nextSibling('input'));
  }

  async clickFavoriteButton() {
    await this.t.click(this.favoriteButton);
  }

  get memberCountIcon() {
    return this.getSelectorByIcon('member_count', this.header);
  }

  async clickMemberCountIcon() {
    await this.t.click(this.memberCountIcon);
  }

  get messageInputArea() {
    this.warnFlakySelector();
    return this.self.child().find('.ql-editor');
  }

  get currentGroupId() {
    return this.self.getAttribute('data-group-id');
  }

  async elementShouldBeOnTheTop(sel: Selector) {
    await H.retryUntilPass(async () => {
      const containerTop = await this.self.getBoundingClientRectProperty('top');
      const headerHeight = await this.header.getBoundingClientRectProperty('height');
      const targetTop = await sel.getBoundingClientRectProperty('top');
      assert.strictEqual(containerTop + headerHeight, targetTop, 'this post card is not on the top of conversation page')
    });
  }

  async postCardByIdShouldBeOnTheTop(postId: string) {
    const postCard = this.posts.filter(`[data-id="${postId}"]`);
    await this.elementShouldBeOnTheTop(postCard);
  }

  async newMessageDeadLineShouldBeOnTheTop() {
    await this.elementShouldBeOnTheTop(this.newMessageDeadLine);
  }

  async shouldFocusOnMessageInputArea() {
    await this.t.expect(this.messageInputArea.focused).ok({ timeout: 5e3 });
  }

  async sendMessage(message: string, options?: TypeActionOptions) {
    await this.t
      .click(this.messageInputArea)
      .typeText(this.messageInputArea, message, options)
      .pressKey('enter');
  }

  async typeAtSymbol() {
    await this.t.click(this.messageInputArea).typeText(this.messageInputArea, '@');
  }

  async typeAtMentionUserNameAndPressEnter(userName: string) {
    await this.typeAtSymbol();
    await this.t.typeText(this.messageInputArea, userName, { paste: true })
    await this.mentionUser.ensureLoaded();
    await this.t.pressKey('enter');
  }

  async addMentionUser(userName: string) {
    await this.t.typeText(this.messageInputArea, `@${userName}`);
    await this.mentionUser.ensureLoaded();
    await this.mentionUser.selectMemberByName(userName);
  }

  get mentionUser() {
    return this.getComponent(MentionUsers);
  }

  async pressEnterWhenFocusOnMessageInputArea() {
    await this.shouldFocusOnMessageInputArea();
    await this.t.pressKey('enter');
  }

  get privacyToggle() {
    this.warnFlakySelector();
    return this.self.find('.privacy');
  }

  async clickPrivate() {
    await this.t.click(this.privacyToggle);
  }

  get privateTeamIcon() {
    return this.getSelectorByIcon('lock', this.privacyToggle);
  }

  get publicTeamIcon() {
    return this.getSelectorByIcon('lock_open', this.privacyToggle);
  }

  async groupIdShouldBe(id: string | number) {
    await this.t.expect(this.currentGroupId).eql(id.toString());
  }

  async titleShouldBe(title: string) {
    await this.t.expect(this.title.textContent).eql(title);
  }

  get messageFilesArea() {
    return this.getSelectorByAutomationId('attachment-list');
  }

  get uploadFileInput() {
    return this.getSelectorByAutomationId('upload-file-input');
  }

  get removeFileButtons() {
    return this.getSelectorByAutomationId('attachment-action-button');
  }

  get fileNamesOnMessageArea() {
    return this.getSelectorByAutomationId('file-name', this.messageFilesArea);
  }

  get fileNamesOnPost() {
    return this.getSelectorByAutomationId('file-name');
  }

  get previewFilesSize() {
    return this.getSelectorByAutomationId('file-no-preview-size');
  }

  get fileNotification() {
    return this.getSelectorByAutomationId('conversation-card-activity');
  }

  async uploadFilesToMessageAttachment(filesPath: Array<string> | string) {
    await this.t.setFilesToUpload(this.uploadFileInput, filesPath);
  }

  async removeFileOnMessageArea(n = 0) {
    await this.t.click(this.removeFileButtons.nth(n));
  }

  get readOnlyDiv() {
    return this.getSelectorByAutomationId("disabled-message-input", this.self);
  }

  async shouldBeReadOnly() {
    await this.t.expect(this.messageInputArea.exists).notOk();
    await this.t.expect(this.readOnlyDiv.exists).ok();
  }

  /* 1:1 */
  get telephonyButton() {
    return this.telephonyIcon.parent('button'); //TODO: add automationId
  }

  get telephonyIcon() {
    return this.getSelectorByIcon('phone', this.self);
  }

  async clickTelephonyButton() {
    await this.t.click(this.telephonyButton);
  }
}


export class DuplicatePromptPage extends BaseWebComponent {
  get self() {
    this.warnFlakySelector();
    return this.getSelector('*[role="dialog"]');
  }

  get duplicateModal() {
    return this.getSelectorByAutomationId('messageinput-duplicate-footer');
  }

  get duplicateContent() {
    return this.getSelectorByAutomationId('messageinput-duplicate-modal-title');
  }

  get duplicateCreateButton() {
    return this.getSelectorByAutomationId('messageinput-duplicate-create-button');
  }

  get duplicateCancelButton() {
    return this.getSelectorByAutomationId('messageinput-duplicate-cancel-button');
  }

  get duplicateUpdateButton() {
    return this.getSelectorByAutomationId('messageinput-duplicate-update-button');
  }

  async clickCancelButton() {
    await this.t.click(this.duplicateCancelButton);
  }

  async clickUpdateButton() {
    await this.t.click(this.duplicateUpdateButton);
  }

  async clickCreateButton() {
    await this.t.click(this.duplicateCreateButton);
  }
}

export class MentionPage extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('post-list-page').filter('[data-type="mentions"]');
  }

  get scrollDiv() {
    return this.stream.parent('div');
  }

  async waitUntilPostsBeLoaded(timeout = 20e3) {
    await this.t.wait(1e3); // loading circle is invisible in first 1 second.
    await this.t.expect(this.loadingCircle.exists).notOk({ timeout });
    await this.t.expect(this.title.withText("@Mentions").exists).ok();
  }
}
export class BookmarkPage extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('post-list-page').filter('[data-type="bookmarks"]');
  }

  get scrollDiv() {
    return this.stream.parent('div');
  }

  async waitUntilPostsBeLoaded(timeout = 20e3) {
    await this.t.wait(1e3); // loading circle is invisible in first 1 second.
    await this.t.expect(this.loadingCircle.exists).notOk({ timeout });
    await this.t.expect(this.title.withText("Bookmarks").exists).ok();
  }
}

export class PostItem extends BaseWebComponent {
  get postId() {
    return this.self.getAttribute('data-id');
  }

  get actionBarMoreMenu() {
    return this.getComponent(ActionBarMoreMenu);
  }

  get avatar() {
    return this.self.find(`[data-name="avatar"]`);
  }

  get name() {
    return this.self.find(`[data-name="name"]`);
  }

  get userStatus() {
    return this.self.find(`[data-name="cardHeaderUserStatus"]`);
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

  get img() {
    this.warnFlakySelector(); // todo: all specify item...
    return this.body.find('img');
  }

  get editTextArea() {
    return this.self.find('[data-placeholder="Type new message"]');
  }

  async editMessage(message: string, options?: TypeActionOptions) {
    await this.t
      .wait(1e3) // need time to wait edit text area loaded
      .typeText(this.editTextArea, message, options)
      .pressKey('enter');
  }

  get mentions() {
    return this.text.find('.at_mention_compose');
  }

  async clickNthMentions(n = 0) {
    return this.t.click(this.mentions.nth(n));
  }

  getMentionByName(name: string) {
    return this.mentions.filter((el) => el.textContent === name);
  }

  emojiTitle(text) {
    return this.text.find("img").withAttribute("title", text);
  }

  get likeToggleOnActionBar() {
    return this.self.find(`[data-name="actionBarLike"]`);
  }

  get likeIconOnActionBar() {
    return this.getSelectorByIcon('thumbup_border', this.likeToggleOnActionBar);
  }

  get unlikeIconOnActionBar() {
    return this.getSelectorByIcon('thumbup', this.likeToggleOnActionBar);
  }

  get likeButtonOnFooter() {
    return this.self.find(`[data-name="footerLikeButton"]`).find(`[data-name="actionBarLike"]`);
  }

  get likeIconOnFooter() {
    return this.getSelectorByIcon('thumbup_border', this.likeButtonOnFooter);
  }

  get unlikeIconOnFooter() {
    return this.getSelectorByIcon('thumbup', this.likeButtonOnFooter);
  }


  get likeCount() {
    return this.likeButtonOnFooter.nextSibling('span');
  }

  get bookmarkToggle() {
    return this.self.find(`[data-name="actionBarBookmark"]`);
  }

  get bookmarkIcon() {
    return this.getSelectorByIcon('bookmark', this.self);
  }

  get unBookmarkIcon() {

    return this.getSelectorByIcon('bookmark_border', this.self);
  }

  get pinToggle() {
    return this.self.find('button').withAttribute('data-name', 'actionBarPin');
  }

  get pinButton() {
    return this.pinToggle.withAttribute('aria-label', 'Pin');
  }

  get unpinButton() {
    return this.pinToggle.withAttribute('aria-label', 'Unpin');
  }

  async clickPinToggle() {
    await this.t.click(this.pinToggle);
  }

  get isPinned() {
    return this.unpinButton.exists;
  }

  async pinPost() {
    if (!await this.isPinned) {
      await this.t.hover(this.self);
      await this.clickPinToggle();
    };
  }

  async unpinPost() {
    if (await this.isPinned) {
      await this.t.hover(this.self);
      await this.clickPinToggle();
    };
  }

  get moreMenu() {
    return this.self.find(`[data-name="actionBarMore"]`);
  }

  async clickMoreItemOnActionBar() {
    await this.t.hover(this.self).click(this.moreMenu);
  }

  async clickAvatar() {
    await this.t.click(this.avatar);
  }

  async clickLikeOnActionBar() {
    await this.t.hover(this.self).click(this.likeToggleOnActionBar);
  }

  async clickLikeButtonOnFooter() {
    await this.t.hover(this.self).click(this.likeButtonOnFooter);
  }

  async getLikeCount() {
    return await this.getNumber(this.likeCount);
  }

  async likeShouldBe(n: number, maxRetry = 5, interval = 5e3) {
    await H.retryUntilPass(async () => {
      const likes = await this.getLikeCount();
      assert.strictEqual(n, likes, `Like Number error: expect ${n}, but actual ${likes}`);
    }, maxRetry, interval);
  }

  async clickBookmarkToggle() {
    await this.t.hover(this.self).click(this.bookmarkToggle);
  }

  get headerNotification() {
    return this.self.find('[data-Name="cardHeaderNotification"]');
  }

  get fileNotification() {
    return this.getSelectorByAutomationId('conversation-card-activity', this.headerNotification);
  }

  get progressBar() {
    return this.self.find('[role="progressbar"]')
  }

  async waitForPostToSend(timeout = 5e3) {
    try {
      await H.retryUntilPass(async () => assert(await this.progressBar.exists), 5);
    } catch (e) {
      // it's ok if spinner doesn't appear
    } finally {
      await this.t.expect(this.progressBar.exists).notOk({ timeout });
    }
    // wait extra 1 sec for writing indexedDB
    await this.t.wait(1e3);
  }

  async waitImageVisible(timeout = 10e3) {
    await this.t.expect(this.self.find('img').clientHeight).gt(0, { timeout });
    await this.t.expect(this.self.find('img').clientWidth).gt(0, { timeout });
  }

  get fileNames() {
    return this.getSelectorByAutomationId('file-name', this.self);
  }

  get fileSizes() {
    return this.getSelectorByAutomationId('file-no-preview-size', this.self);
  }

  async nthFileNameShouldBe(n: number, name: string) {
    await this.t.expect(this.fileNames.nth(n).withText(name).exists).ok();
  }

  async nthFileSizeShouldBe(n: number, size: string) {
    await this.t.expect(this.fileSizes.nth(n).withText(size).exists).ok();
  }

  // --- mention and bookmark page only ---
  get conversationName() {
    return this.self.find('.conversation-name')
  }

  get conversationSource() {
    return this.self.find(`[data-name="cardHeaderFrom"]`);
  }

  get conversationSourceId() {
    return this.conversationSource.getAttribute('id');
  }

  async jumpToConversationByClickName() {
    await this.t.click(this.conversationName, { offsetX: 3 });
  }

  get jumpToConversationButton() {
    return this.getSelectorByAutomationId('jumpToConversation', this.self);
  }

  async hoverPostAndClickJumpToConversationButton() {
    const buttonElement = this.jumpToConversationButton;
    const displayJumpButton = ClientFunction(() => {
      buttonElement().style["opacity"] = "1";
    }, {
        dependencies: { buttonElement }
      }
    );
    await this.t.hover(this.self)
    await displayJumpButton();
    await this.t.click(this.jumpToConversationButton);
  }

  // audio conference
  get AudioConferenceHeaderNotification() {
    // FIXME: should take i18n into account
    this.warnFlakySelector();
    return this.headerNotification.withText('started an audio conference');
  }

  get audioConference() {
    return this.getComponent(AudioConference, this.self);
  }

  async scrollIntoView() {
    await ClientFunction((_self) => {
      const ele: any = _self()
      ele.scrollIntoView()
    })(this.self)
  }

  get isHighLight() {
    return this.self.hasClass('highlight')
  }

  async shouldBeHighLight() {
    await this.t.expect(this.isHighLight).ok();
  }

}

class AudioConference extends BaseWebComponent {
  get container() {
    return this.self.find('.conversation-item-cards');
  }

  get icon() {
    return this.getSelectorByIcon('conference');
  }

  get title() {
    this.warnFlakySelector();
    return this.icon.parent('div').find('span').withText('Audio Conference');
  }

  get dialInNumber() {
    return this.self.find('div').withText('Dial-in Number');
  }

  get phoneNumber() {
    return this.getSelectorByAutomationId('conferencePhoneNumber', this.self.find('a'));
  }

  get globalNumber() {
    return this.getSelectorByAutomationId('conferenceGlobalNumber', this.self.find('a'));
  }

  // only host can see
  get hostAccess() {
    return this.self.find('div').withText('Host Access');
  }

  // only host can see
  get hostCode() {
    return this.getSelectorByAutomationId('conferenceHostCode', this.self);
  }

  get participantAccess() {
    return this.self.find('div').withText('Participant Access');
  }

  get participantCode() {
    return this.getSelectorByAutomationId('conferenceParticipantCode', this.self);
  }
}

class MentionUsers extends BaseWebComponent {
  get self() {
    return this.getSelector('*[role="rowgroup"]');
  }

  get members() {
    this.warnFlakySelector();
    return this.self.find('div').withAttribute('uid');
  }

  async selectMemberByNth(n: number) {
    await this.t.click(this.members.nth(n));
  }

  async selectMemberByName(name: string) {
    await this.t.click(this.members.withExactText(name));
  }
}
