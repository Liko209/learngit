import { BaseWebComponent } from '../../../BaseWebComponent';


export class NotificationAndSoundSettingPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('settingPage-notificationAndSounds');
  };

  get header() {
    return this.getSelectorByAutomationId('settingPageHeader-notificationAndSounds');
  }

  get headerTitle() {
    return this.getSelectorByAutomationId("conversation-page-header-title");
  }

  get desktopNotificationsSection() {
    return this.getSelectorByAutomationId('settingSection-desktopNotifications');
  }
  get otherNotificationSettings() {
  return this.getSelectorByAutomationId('settingSection-otherNotificationSettings')
  }


  get newMessageBadgeCountDropDown() {
    return this.getSelectorByAutomationId('settingItemSelectBox-newMessageBadgeCount');
  }

  get newMessageBadgeCount() {
    return this.getSelectorByAutomationId('settingItemSelectBoxItem-newMessageBadgeCount');
  }

  async selectNewMessageBadgeCount(text: string) {
    await this.t.click(this.newMessageBadgeCount.withText(text));
  }

  async clickNewMessageBadgeCountDropDown() {
    await this.t.click(this.newMessageBadgeCountDropDown);
  }
}
