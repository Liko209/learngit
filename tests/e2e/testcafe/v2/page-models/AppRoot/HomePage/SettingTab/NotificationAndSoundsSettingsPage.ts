import { BaseWebComponent } from '../../../BaseWebComponent';
import * as assert from 'assert';


export class NotificationAndSoundsSettingsPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('settingPage-notificationAndSounds');
  };
  get header() {
    return this.getSelectorByAutomationId('settingPage-notificationAndSounds');
  }
  get pageHeaderTitle(){
    return this.getSelectorByAutomationId('settingPageHeader-notificationAndSounds');
  }
  get settingsSection(){
    return this.getSelectorByAutomationId('settingSection-desktopNotifications');
  }
  get sectionHeaderTitle(){
    return this.getSelectorByAutomationId('settingSectionTitle-desktopNotifications');
  }
  get browserSection(){
    return this.getSelectorByAutomationId('settingItem-notificationBrowser');
  }
  get browserItemTitle(){
    return this.getSelectorByAutomationId('settingItemLabel-notificationBrowser');
  }
  get browserItemDescription(){
    return this.getSelectorByAutomationId('settingItemDescription-notificationBrowser');
  }
  get browserItemToggle(){
    return this.getSelectorByAutomationId('settingItemToggleButton-notificationBrowser');
  }
  // New Message
  get newMessageSection(){
    return this.getSelectorByAutomationId('settingItem-newMessages')
  }


  get newMessageSectionStatus(){
    return this.newMessageSection.getAttribute('data-disabled')
  }
  get newMessagesTitle(){
  return this.getSelectorByAutomationId('settingItemLabel-newMessages');
  }
  get newMessageDescription(){
    return this.getSelectorByAutomationId('settingItemDescription-newMessages');
  }
  get newMessageSelector(){
    return this.getSelectorByAutomationId('settingItemSelectBox-newMessages');
  }
  get newMessgesSelectorItem(){
    return this.getSelectorByAutomationId('settingItemSelectBox-newMessages-item') // check settingItemSelectBoxItem-newMessages
  }
  get newMessageSelectorAllItems(){
    return this.getSelectorByAutomationId('settingItemSelectBoxItem-newMessages');
  }
  // Incoming Call
  get incomingCallsSection() {
    return this.getSelectorByAutomationId('settingItem-incomingCalls')
  }

  get incomingCallsTitle(){
    return this.getSelectorByAutomationId('settingItemLabel-incomingCalls');
  }
  get incomingCallsDescription(){
    return this.getSelectorByAutomationId('settingItemDescription-incomingCalls');
}
  get incomingCallsToggle(){
    return this.getSelectorByAutomationId('settingItemToggleButton-incomingCalls');
}
// Calls and Voicemails
  get callsAndVoicemailsSection() {
    return this.getSelectorByAutomationId('settingItem-callsAndVoicemails')
  }
  get callsAndVoicemailsTitle() {
    return this.getSelectorByAutomationId('settingItemLabel-callsAndVoicemails');
  }
  get callsAndVoicemailsDescription() {
    return this.getSelectorByAutomationId('settingItemDescription-callsAndVoicemails');
  }
  get callsAndVoicemailsToggle() {
    return this.getSelectorByAutomationId('settingItemToggleButton-callsAndVoicemails');
  }


  async existSectionLabel(text:string){
    await this.t.expect(this.settingsSection.withText(text).exists).ok();
}
  async existbrowserItemLabel(text: string) {
    await this.t.expect(this.browserItemTitle.withText(text).exists).ok();
  }
  async existBrowserItemDescription(text: string) {
    await this.t.expect(this.browserItemDescription.withText(text).exists).ok();
  }
  async existNewMessageItemLabel(text:string){
    await this.t.expect(this.newMessagesTitle.withText(text).exists).ok();
  }
  async existNewMessageDescription(text: string) {
    await this.t.expect(this.newMessageDescription.withText(text).exists).ok();
  }

  async existBrowserToggle() {
    await this.t.expect(this.browserItemToggle.exists).ok();
  }
  async existsNoIncomingCallSection(){
    await this.t.expect(this.incomingCallsSection.exists).notOk();
  }
  async existsNoMissedCallAndVoicemailSection() {
    await this.t.expect(this.callsAndVoicemailsSection.exists).notOk();
  }
  async existsBrowserSection(){
    await this.t.expect(this.browserSection.exists).ok();
  }
  async existsNewMessageSection(){
    await this.t.expect(this.newMessageSection.exists).ok();
  }

  async incomingcallToggleIsOn(){
    return this.t.expect(this.incomingCallsToggle.checked).ok();
  }
  async callsAndVoicemailsToggleIsOn() {
    return this.t.expect(this.callsAndVoicemailsToggle.checked).ok();
  }
  async existNewMessageDropDown() {
    await this.t.expect(this.newMessageSelector.exists).ok();
  }

  /// dropdown check
  async clickNewMessageDropDownItem() {
    await this.t.click(this.newMessageSelector);
  }
  async checkNewMessageItemCount(count: number) {
    await this.t.expect(this.newMessageSelectorAllItems.count).eql(count);
  }

  async newMessageDropDownItemContains(newMessageItems: string[]) {
    const count = await this.newMessageSelectorAllItems.count;
    for (let i = 0; i < count; i++) {
      const text = await this.newMessageSelectorAllItems.nth(i).innerText;
      const result = newMessageItems.includes(text);
      assert.ok(result, `${text} does not apply ${newMessageItems}`);
    }
  }

  async existIncomingCallsLabel(text: string) {
    await this.t.expect(this.incomingCallsTitle.withText(text).exists).ok();
  }
  async existIncomingCallsDescription(text: string) {
    await this.t.expect(this.incomingCallsDescription.withText(text).exists).ok();
  }
  async existCallsAndVoicemailsLabel(text: string) {
    await this.t.expect(this.callsAndVoicemailsTitle.withText(text).exists).ok();
  }
  async existCallsAndVoicemailsDescription(text: string) {
    await this.t.expect(this.callsAndVoicemailsDescription.withText(text).exists).ok();
  }


async getBrowserToggleIsOFF(){
  if (await this.browserItemToggle.checked !== false)
  {
    await this.t.click(this.browserItemToggle);
  }
}
}

