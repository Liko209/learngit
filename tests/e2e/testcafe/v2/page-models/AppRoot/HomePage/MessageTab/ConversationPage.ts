import { BaseWebComponent } from '../../../BaseWebComponent';
import * as _ from 'lodash';
import { ClientFunction } from 'testcafe';

class BaseConversationPage extends BaseWebComponent {
  get posts() {
    return this.self.find('[data-name="conversation-card"]');
  }

  get header() {
    return this.getSelectorByAutomationId('conversation-page-header');
  }

  get title() {
    return this.getSelectorByAutomationId('conversation-page-header-title');
  }

  get leftWrapper() {
    return this.header.find('.left-wrapper');
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

  // FIXME: find a more reliable method
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
    this.scrollToY(scrollHeight/2);
  }

  async scrollToBottom() {
    await this.t.eval(() => {
      const scrollHeight = document.querySelector('[data-test-automation-id="jui-stream-wrapper"]').firstElementChild.scrollHeight;
      document.querySelector('[data-test-automation-id="jui-stream-wrapper"]').firstElementChild.scrollTop = scrollHeight;
    });
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

  async sendMessage(message: string) {
    await this.t
      .typeText(this.messageInputArea, message)
      .click(this.messageInputArea)
      .pressKey('enter');
  }

  async favorite() {
    await this.t.click(this.leftWrapper.find('span').withText('star').nextSibling('input'));
  }

  async unFavorite() {
    await this.t.click(this.leftWrapper.find('span').withText('star_border').nextSibling('input'));
  }

  get currentGroupId() {
    return this.self.getAttribute('data-group-id');
  }
}

export class MentionPage extends BaseConversationPage {
  get self() {
    return this.getSelectorByAutomationId('post-list-page');
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

  get likeToggleOnActionBar() {
    return this.self.find('.material-icons').withText('thumb_up').parent('button');
  }

  get likeToggleWithCount() {
    return this.body.nextSibling().find('.material-icons').withText('thumb_up').parent('button');
  }
  
  get likeCount() {
    return this.likeToggleWithCount.parent(0).nextSibling('span');
  }

  get bookmarkButton() {
    return this.self.find('.material-icons').withText('bookmark_border').parent('button');
  }

  get unBookmarkButton() {
    return this.self.find('.material-icons').withText('bookmark').parent('button');
  }

  get moreMenu() {
    return this.self.find('.material-icons').withText('more_horiz').parent('button');
  }
 
  async clickLikeOnActionBar() {
    await this.t.hover(this.self).click(this.likeToggleOnActionBar);
  }
 
  async clickLikeWithCount() {
    await this.t.hover(this.self).click(this.likeToggleWithCount);
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

  async addBookmark() {
    await this.t.hover(this.self).click(this.bookmarkButton);
  }

  async removeBookmark() {
    await this.t.hover(this.self).click(this.unBookmarkButton);
  }

  
  // --- mention page only ---
  get conversationName() {
    return this.self.find('.conversation-name')
  }

  async goToConversation() {
    await this.t.click(this.conversationName, { offsetX: 3 });
  }

  get jumpToConversationButton() {
    
    return this.self.find(`span`).withText(/Jump To Conversation/i).parent('button');
  }

  async jumpToAtMentionConversation() {
    await this.t.click(this.self);
  }


  async clickConversationByButton() {
    const buttonElement  = this.jumpToConversationButton;
    const displayJumpButton = ClientFunction(() => {
        buttonElement().style["opacity"] = "1"; 
    }, {
      dependencies: { buttonElement } }
    );
    await this.t.hover(this.self)
    await displayJumpButton();
     await this.t.click(this.jumpToConversationButton);
  }
}
