import { BaseWebComponent } from '../../../BaseWebComponent';
import * as _ from 'lodash';
import * as assert from 'assert';
import { ClientFunction } from 'testcafe';
import { H } from '../../../../helpers';

class BaseConversationPage extends BaseWebComponent {
  get posts() {
    return this.self.find('[data-name="conversation-card"]');
  }

  get header() {
    return this.getSelectorByAutomationId('conversation-page-header');
  }

  get headerStatus() {
    return this.getSelectorByAutomationId("conversation-page-header-status", this.header);
  }
  get title() {
    return this.getSelectorByAutomationId('conversation-page-header-title');
  }

  get favIcon() {
    return this.getSelectorByAutomationId('favorite-icon');
  }

  get leftWrapper() {
    return this.header.find('.left-wrapper');
  }

  async clickFavIcon() {
    await this.t.click(this.favIcon);
  }

  nthPostItem(nth: number) {
    return this.getComponent(PostItem, this.posts.nth(nth));
  }

  postItemById(postId: string) {
    return this.getComponent(PostItem, this.posts.filter(`[data-id="${postId}"]`));
  }

  get streamWrapper() {
    return this.getSelectorByAutomationId('jui-stream-wrapper');
  }

  get stream() {
    return this.getSelectorByAutomationId('jui-stream');
  }

  get loadingCircle() {
    return this.self.find('circle');
  }

  async waitUntilPostsBeLoaded(timeout = 10e3) {
    await this.t.wait(1e3); // loading circle is invisible in first 1 second.
    return await this.t.expect(this.loadingCircle.visible).notOk({ timeout });
  }

  // todo: find a more reliable method
  async expectStreamScrollToBottom() {
    const scrollTop = await this.streamWrapper.scrollTop;
    const streamHeight = await this.stream.clientHeight;
    const streamWrapperHeight = await this.streamWrapper.clientHeight;
    await this.t.expect(scrollTop).eql(streamHeight - streamWrapperHeight, `${scrollTop}, ${streamHeight} - ${streamWrapperHeight}`);
  }

  async scrollToY(y: number) {
    await this.t.eval(() => {
      document.querySelector('[data-test-automation-id="jui-stream-wrapper"]').firstElementChild.scrollTop = y;
    }, {
        dependencies: { y }
      });
  }

  async scrollToMiddle() {
    const scrollHeight = await this.streamWrapper.clientHeight;
    await this.scrollToY(scrollHeight / 2);
  }

  async scrollToBottom() {
    await this.t.eval(() => {
      const scrollHeight = document.querySelector('[data-test-automation-id="jui-stream-wrapper"]').firstElementChild.scrollHeight;
      document.querySelector('[data-test-automation-id="jui-stream-wrapper"]').firstElementChild.scrollTop = scrollHeight;
    });
  }

  get newMessageDeadLine() {
    return this.stream.find('span').withText('New Messages');
  }

  async isVisible(el: Selector) {
    const wrapper = this.streamWrapper;
    const itemTop = await el.getBoundingClientRectProperty('top');
    const itemBottom = await el.getBoundingClientRectProperty('bottom');
    const wrapperTop = await wrapper.getBoundingClientRectProperty('top');
    const wrapperBottom = await wrapper.getBoundingClientRectProperty('bottom');
    return itemTop >= wrapperTop && itemBottom <= wrapperBottom;
  }

  async nthPostExpectVisible(n: number, isVisible: boolean = true) {
    await H.retryUntilPass(async () => {
      const result = await this.isVisible(this.posts.nth(n));
      assert.strictEqual(result, isVisible, `This post expect visible: ${isVisible}, but actual: ${result}`);
    }, 2)
  }

  async newMessageDeadLineExpectVisible(isVisible: boolean) {
    await H.retryUntilPass(async () => {
      const result = await this.isVisible(this.newMessageDeadLine);
      assert.strictEqual(result, isVisible, `This 'New Messages' deadline expect visible: ${isVisible}, but actual: ${result}`);
    }, 2);
  }
}

export class ConversationPage extends BaseConversationPage {
  get self() {
    return this.getSelector('.conversation-page');
  }

  get messageInputArea() {
    this.warnFlakySelector();
    return this.self.child().find('.ql-editor');
  }

  get currentGroupId() {
    return this.self.getAttribute('data-group-id');
  }

  get jumpToFirstUnreadButtonWrapper() {
    return this.getSelectorByAutomationId('jump-to-first-unread-button')
  }

  async sendMessage(message: string, options?) {
    await this.t
      .typeText(this.messageInputArea, message, options)
      .click(this.messageInputArea)
      .pressKey('enter');
  }

  get privateButton() {
    this.warnFlakySelector();
    return this.self.find('.privacy');
  }

  async clickPrivate() {
    await this.t.click(this.privateButton);
  }

  async favorite() {
    await this.t.click(this.leftWrapper.find('span').withText('star').nextSibling('input'));
  }

  async unFavorite() {
    await this.t.click(this.leftWrapper.find('span').withText('star_border').nextSibling('input'));
  }

  async groupIdShouldBe(id: string | number) {
    await this.t.expect(this.currentGroupId).eql(id.toString());
  }

  async clickJumpToFirstUnreadButton() {
    await this.t.click(this.jumpToFirstUnreadButtonWrapper)
  }
}

export class MentionPage extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('post-list-page').filter('[data-type="mentions"]');
  }
}
export class BookmarkPage extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('post-list-page').filter('[data-type="bookmarks"]');
  }
}

export class PostItem extends BaseWebComponent {
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

  get mentions() {
    return this.text.find('.at_mention_compose');
  }

  getMentionByName(name: string) {
    return this.mentions.filter((el) => el.textContent === name);
  }

  imgTitle(text) {
    return this.text.find("img").withAttribute("title", text);
  }

  get likeToggleOnActionBar() {
    return this.self.find(`[data-name="actionBarLike"]`);
  }

  get likeButtonOnFooter() {
    return this.self.find(`[data-name="footerLikeButton"]`).find(`[data-name="actionBarLike"]`);
  }

  get likeCount() {
    return this.likeButtonOnFooter.nextSibling('span');
  }

  get bookmarkToggle() {
    return this.self.find(`[data-name="actionBarBookmark"]`);
  }

  get moreMenu() {
    return this.self.find(`[data-name="actionBarMore"]`);
  }

  get prompt() {
    return this.getSelector('.tooltipPlacementBottom').textContent;
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
    if (!await this.likeCount.exists) {
      return 0;
    }
    const text = await this.likeCount.innerText;
    if (_.isEmpty(text)) {
      return 0;
    }
    return Number(text);
  }

  async clickBookmarkToggle() {
    await this.t.hover(this.self).click(this.bookmarkToggle);
  }

  // --- mention page only ---
  get conversationName() {
    return this.self.find('.conversation-name')
  }

  async jumpToConversationByClickName() {
    await this.t.click(this.conversationName, { offsetX: 3 });
  }

  get jumpToConversationButton() {
    return this.self.find(`span`).withText(/Jump To Conversation/i).parent('button');
  }

  async jumpToConversationByClickPost() {
    await this.t.click(this.self);
  }

  async clickConversationByButton() {
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
}
