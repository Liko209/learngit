/*
 * @Author: Mia.Cai
 * @Date: 2018-12-25 10:47:23
 * Copyright © RingCentral. All rights reserved.
 */

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
    this.scrollToY(scrollHeight / 2);
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

  async sendMessageWithoutText() {
    await this.t
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

  get messageFilesArea() {
    return this.getSelectorByAutomationId('attachment-list');
  }

  get uploadFileInput() {
    return this.getSelectorByAutomationId('upload-file-input');
  }
  get removeButton() {
    return this.getSelectorByAutomationId('attachment-action-button');
  }

  get attachmentFileName() {
    return this.getSelectorByAutomationId('attachment-file-name');
  }

  get fileNameOnPost() {
    return this.getSelectorByAutomationId('file-name');
  }

  get fileSize() {
    return this.getSelectorByAutomationId('file-size');
  }

  get previewFileSize() {
    return this.getSelectorByAutomationId('file-no-preview-size');
  }

  get conversationCard() {
    return this.getSelectorByAutomationId('conversation-card-activity');
  }

  private uploadFiles(selector: Selector, filesPath: Array<string>) {
    return this.t.setFilesToUpload(selector, filesPath);
  }

  async uploadFilesToMessageAttachment(filesPath: Array<string>) {
    await this.uploadFiles(this.uploadFileInput, filesPath);
  }

  async clickRemoveButton() {
    await this.t.click(this.removeButton);
  }

}

export class DuplicatePromptPage extends BaseConversationPage {
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
    return this.getSelectorByAutomationId('post-list-page');
  }
}
export class BookmarkPage extends BaseConversationPage {
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
