import { BaseWebComponent } from '../../../BaseWebComponent';
import * as assert from 'assert';

export class MessageSettingPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('settingPage-message');
  }

  get header() {
    return this.getSelectorByAutomationId('settingPageHeader-message');
  }

  get headerTitle() {
    return this.getSelectorByAutomationId('conversation-page-header-title', this.header);
  }

  get conversationListSection() {
    return this.getSelectorByAutomationId('settingSection-conversationList');
  }

  get messageThreadSection() {
    return this.getSelectorByAutomationId('settingSection-messageThread');
  }
  get maxConversationSelectBox() {
    return this.getSelectorByAutomationId(
      'settingItemSelectBox-maxConversations',
      this.conversationListSection,
    );
  }
  get showLinkPreviewToggle() {
    return this.getSelectorByAutomationId(
      'settingItemToggleButton-showLinkPreviews',
      this.messageThreadSection,
    );
  }
  get maxConversationDropDownItems() {
    return this.getSelectorByAutomationClass('settingItemSelectBoxItem');
  }

  async clickMaxConversationSelectBox(){
   await this.t.click(this.maxConversationSelectBox)
  }

  get newMessageBadgeCountDropDown() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-newMessageBadgeCount", this.conversationListSection
    );
  }

  get newMessageBadgeCount() {
    return this.getSelector(
      `*[data-test-automation-id^="settingItemSelectBoxItem-newMessageBadgeCount-"`
    );
  }

  async selectNewMessageBadgeCount(text: string) {
    await this.t.click(this.newMessageBadgeCount.withText(text));
  }

  async clickNewMessageBadgeCountDropDown() {
    await this.t.click(this.newMessageBadgeCountDropDown);
  }

}
