import { BaseWebComponent } from "../../../BaseWebComponent";
import * as assert from "assert";

export class NotificationAndSoundSettingPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("settingPage-notificationAndSounds");
  }
  get header() {
    return this.getSelectorByAutomationId(
      "settingPageHeader-notificationAndSounds"
    );
  }
  get headerTitle() {
    return this.getSelectorByAutomationId("conversation-page-header-title", this.header);
  }

  /** audio sources */
  get audioSourcesSection() {
    return this.getSelectorByAutomationId("settingSection-audioSource");
  }

  get audioSourcesTitle() {
    return this.getSelectorByAutomationId("settingSectionTitle-audioSource");
  }

  get microphoneSourceLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-microphoneSource");
  }

  get microphoneSourceDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-microphoneSource"
    );
  }

  get microphoneSourceSelectBox() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-microphoneSource"
    );
  }

  get microphoneSourceItems() {
    return this.getSelectorByAutomationClass("settingItemSelectBoxItem");
  }

  get speakerSourceLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-speakerSource");
  }

  get speakerSourceDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-speakerSource"
    );
  }

  get speakerSourceSelectBox() {
    return this.getSelectorByAutomationId("settingItemSelectBox-speakerSource");
  }

  get speakerSourceItems() {
    return this.getSelectorByAutomationClass("settingItemSelectBoxItem");
  }

  get ringerSourceSelectBox() {
    return this.getSelectorByAutomationId("settingItemSelectBox-ringerSource");
  }

  get ringerSourceItems() {
    return this.getSelectorByAutomationClass("settingItemSelectBoxItem");
  }

  get ringerSourceLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-ringerSource");
  }

  get ringerSourceDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-ringerSource"
    );
  }

  microphoneSourceById(value: string) {
    return this.microphoneSourceItems.filter(
      `[data-test-automation-value="${value}"]`
    );
  }

  microphoneSourceByLabel(label: string) {
    return this.microphoneSourceItems.withExactText(label);
  }

  getMicrophoneSourceIdByLabel(label: string) {
    return this.microphoneSourceByLabel(label).getAttribute(
      "data-test-automation-value"
    );
  }

  getMicrophoneSourceIdByNth(n: number) {
    return this.microphoneSourceItems
      .nth(n)
      .getAttribute("data-test-automation-value");
  }

  get microphoneSourceDefaultItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-microphoneSource-default"
    );
  }

  get ringerSourceAllAudioSourcesItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-ringerSource-all"
    );
  }

  get audioSourcesVolumeControlLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-volume");
  }

  get ringSourceSelectBoxOffItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-ringerSource-off"
    );
  }

  async hoverRingSourceSelectBoxOffItem() {
    await this.t.hover(this.ringSourceSelectBoxOffItem);
  }

  async hoverAudioSourcesVolumeControlLabel() {
    await this.t.hover(this.audioSourcesVolumeControlLabel);
  }

  async hoverRingerSourceSelectBox() {
    await this.t.hover(this.ringerSourceSelectBox);
  }

  async hoverMicrophoneSourceSelectBox() {
    await this.t.hover(this.microphoneSourceSelectBox);
  }

  async clickMicrophoneSourceSelectBox() {
    await this.t.click(this.microphoneSourceSelectBox);
  }

  async currentMicrophoneSourceLabelToBe(label: string) {
    await this.t.expect(this.microphoneSourceSelectBox.textContent).eql(label);
  }

  async currentMicrophoneSourceIdToBe(value: string) {
    await this.t
      .expect(
        this.microphoneSourceSelectBox.getAttribute(
          "data-test-automation-value"
        )
      )
      .eql(value);
  }

  async clickSpeakerSourceSelectBox() {
    await this.t.click(this.speakerSourceSelectBox);
  }

  async currentSpeakerSourceLabelToBe(babel: string) {
    await this.t.expect(this.speakerSourceSelectBox.textContent).eql(babel);
  }

  async currentSpeakerSourceIdToBe(value: string) {
    await this.t
      .expect(
        this.speakerSourceSelectBox.getAttribute("data-test-automation-value")
      )
      .eql(value);
  }

  async clickRingerSourceSelectBox() {
    await this.t.click(this.ringerSourceSelectBox);
  }

  async currentRingerSourceLabelToBe(babel: string) {
    await this.t.expect(this.ringerSourceSelectBox.textContent).eql(babel);
  }

  async currentRingerSourceIdToBe(value: string) {
    await this.t
      .expect(
        this.ringerSourceSelectBox.getAttribute("data-test-automation-value")
      )
      .eql(value);
  }

  speakerSourceById(value: string) {
    return this.speakerSourceItems.filter(
      `[data-test-automation-value="${value}"]`
    );
  }

  speakerSourceByLabel(label: string) {
    return this.speakerSourceItems.withExactText(label);
  }

  getSpeakerSourceIdByLabel(label: string) {
    return this.microphoneSourceByLabel(label).getAttribute(
      "data-test-automation-value"
    );
  }

  getSpeakerSourceIdByNth(n: number) {
    return this.speakerSourceItems
      .nth(n)
      .getAttribute("data-test-automation-value");
  }

  ringerSourceById(value: string) {
    return this.ringerSourceItems.filter(
      `[data-test-automation-value="${value}"]`
    );
  }

  ringerSourceByLabel(label: string) {
    return this.ringerSourceItems.withExactText(label);
  }

  getRingerSourceIdByLabel(label: string) {
    return this.microphoneSourceByLabel(label).getAttribute(
      "data-test-automation-value"
    );
  }

  getRingerSourceIdByNth(n: number) {
    return this.ringerSourceItems
      .nth(n)
      .getAttribute("data-test-automation-value");
  }

  async selectMicrophoneSourceByLabel(label: string) {
    await this.t.click(this.microphoneSourceByLabel(label));
  }

  async selectMicrophoneSourceById(value: string) {
    await this.t.click(this.microphoneSourceById(value));
  }

  async selectMicrophoneSourceByNth(n: number) {
    await this.t.click(this.microphoneSourceItems.nth(n));
  }

  async selectSpeakerSourceByLabel(label: string) {
    await this.t.click(this.speakerSourceByLabel(label));
  }

  async selectSpeakerSourceById(value: string) {
    await this.t.click(this.speakerSourceById(value));
  }

  async selectSpeakerSourceByNth(n: number) {
    await this.t.click(this.speakerSourceItems.nth(n));
  }

  async selectRingerSourceByLabel(label: string) {
    await this.t.click(this.ringerSourceByLabel(label));
  }

  async selectRingerSourceById(value: string) {
    await this.t.click(this.ringerSourceById(value));
  }

  async selectRingerSourceByNth(n: number) {
    await this.t.click(this.ringerSourceItems.nth(n));
  }

  /** desktop notification */
  get desktopNotificationsSection() {
    return this.getSelectorByAutomationId(
      "settingSection-desktopNotifications"
    );
  }

  get desktopNotificationSectionTitle() {
    return this.getSelectorByAutomationId(
      "settingSectionTitle-desktopNotifications"
    );
  }

  get browserSwitchItem() {
    return this.getSelectorByAutomationId("settingItem-notificationBrowser");
  }
  get browserSwitchItemLabel() {
    return this.getSelectorByAutomationId(
      "settingItemLabel-notificationBrowser"
    );
  }
  get browserSwitchItemDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-notificationBrowser"
    );
  }

  get browserSwitchItemToggle() {
    return this.getSelectorByAutomationId(
      "settingItemToggleButton-notificationBrowser"
    );
  }

  get DialogOKButton() {
    return this.getSelectorByAutomationId("DialogOKButton");
  }

  // New Message
  get newMessageItem() {
    return this.getSelectorByAutomationId("settingItem-newMessages");
  }

  get newMessageItemStatus() {
    return this.newMessageItem.getAttribute("data-disabled");
  }

  get newMessagesLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-newMessages");
  }

  get newMessageDescription() {
    return this.getSelectorByAutomationId("settingItemDescription-newMessages");
  }

  get newMessageItemSelectBox() {
    return this.getSelectorByAutomationId("settingItemSelectBox-newMessages");
  }

  get newMessageItemSelectOff() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-newMessages-never"
    );
  }

  get newMessageDropDownItems() {
    return this.getSelectorByAutomationClass("settingItemSelectBoxItem");
  }

  async hoverNewMessageItemSelectOff() {
    await this.t.hover(this.newMessageItemSelectOff);
  }

  // Incoming Call
  get incomingCallsItem() {
    return this.getSelectorByAutomationId("settingItem-incomingCalls");
  }

  get incomingCallsLabel() {
    return this.getSelectorByAutomationId("settingItemLabel-incomingCalls");
  }

  get incomingCallsDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-incomingCalls"
    );
  }

  get incomingCallsToggle() {
    return this.getSelectorByAutomationId(
      "settingItemToggleButton-incomingCalls"
    );
  }

  // Calls and Voicemails
  get missedCallsAndVoicemailsItem() {
    return this.getSelectorByAutomationId("settingItem-callsAndVoicemails");
  }

  get missedCallsAndVoicemailsLabel() {
    return this.getSelectorByAutomationId(
      "settingItemLabel-callsAndVoicemails"
    );
  }

  get missedCallsAndVoicemailsDescription() {
    return this.getSelectorByAutomationId(
      "settingItemDescription-callsAndVoicemails"
    );
  }

  get missedCallsAndVoicemailsToggle() {
    return this.getSelectorByAutomationId(
      "settingItemToggleButton-callsAndVoicemails"
    );
  }

  /// drop down check
  async clickNewMessageItemSelectBox() {
    await this.t.click(this.newMessageItemSelectBox);
  }

  async checkNewMessageDropDownItemCount(count: number) {
    await this.t.expect(this.newMessageDropDownItems.count).eql(count);
  }

  async newMessageDropDownItemsContains(newMessageItems: string[]) {
    const count = await this.newMessageDropDownItems.count;
    for (let i = 0; i < count; i++) {
      const text = await this.newMessageDropDownItems.nth(i).innerText;
      const result = newMessageItems.indexOf(text) !== -1;
      assert.ok(result, `${text} does not apply ${newMessageItems}`);
    }
  }

  async toggleOffBrowserNotification() {
    if ((await this.browserSwitchItemToggle.find("input").checked) !== false) {
      await this.t.click(this.browserSwitchItemToggle);
    }
  }

  async toggleOnBrowserNotification() {
    if ((await this.browserSwitchItemToggle.find("input").checked) !== true) {
      await this.t.click(this.browserSwitchItemToggle);
    }
  }

  get otherNotificationSettings() {
    return this.getSelectorByAutomationId(
      "settingSection-otherNotificationSettings"
    );
  }

  get newMessageBadgeCountDropDown() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-newMessageBadgeCount"
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

  /// Direct messages
  get directMessagesSelectBox() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-notificationDirectMessages"
    );
  }

  async clickDirectMessagesSelectBox() {
    await this.t.click(this.directMessagesSelectBox);
  }

  get directMessagesOffItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-notificationDirectMessages-0"
    );
  }

  async hoverDirectMessagesOffItem() {
    await this.t.hover(this.directMessagesOffItem);
  }

  /// Other notification settings
  get otherNotificationSettingsTitle() {
    return this.getSelectorByAutomationId(
      "settingSectionTitle-otherNotificationSettings"
    );
  }

  get newMessageBadgeCountSelectBox() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-newMessageBadgeCount"
    );
  }

  get directMessagesAndMentionsOnlyItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-newMessageBadgeCount-groups_and_mentions"
    );
  }

  get allNewMessagesItem() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-newMessageBadgeCount-all"
    );
  }

  async hoverAllNewMessagesItem() {
    await this.t.hover(this.allNewMessagesItem);
  }

  async hoverOtherNotificationSettingsTitle() {
    await this.t.hover(this.otherNotificationSettingsTitle);
  }

  async clickNewMessageBadgeCountSelectBox() {
    await this.t.click(this.newMessageBadgeCountSelectBox);
  }
  // sounds section
  get soundsSection() {
    return this.getComponent(SoundsSection);
  }
}

export class SoundsSection extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("settingSection-sounds");
  }

  get soundDirectMessages() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-soundDirectMessages"
    )
      .find("div")
      .find("p");
  }

  get soundMentions() {
    return this.getSelectorByAutomationId("settingItemSelectBox-soundMentions")
      .find("div")
      .find("p");
  }

  get soundTeamMessages() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-soundTeamMessages"
    )
      .find("div")
      .find("p");
  }

  get soundIncomingCall() {
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-soundIncomingCall"
    )
      .find("div")
      .find("p");
  }

  async showSoundInCurrentDirectMessagesSetting(sound: string) {
    await this.t.expect(this.soundDirectMessages.withText(sound).exists).ok();
  }

  async showSoundInCurrentMentionsSetting(sound: string) {
    await this.t.expect(this.soundMentions.withText(sound).exists).ok();
  }

  async showSoundInCurrentTeamsMessagesSetting(sound: string) {
    await this.t.expect(this.soundTeamMessages.withText(sound).exists).ok();
  }

  async showSoundInCurrentIncomingCallSetting(sound: string) {
    await this.t.expect(this.soundIncomingCall.withText(sound).exists).ok();
  }
  // Sound Direct Messages
  async clickSoundDirectMessages(){
    await this.t.click(this.soundDirectMessages);
  }
  get audioSpeakerButton(){
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-soundDirectMessages-2Beep"
    )
  }
  async hoverAudioSpeakerButton(){
    await this.t.hover(this.audioSpeakerButton);
  }
  // Sound Incoming voice calls
  get incomingVoiceCalls(){
    return this.getSelectorByAutomationId(
      "settingItemSelectBox-soundIncomingCall"
  );
  }
  get incomingVoiceCallsLabel(){
    return this.getSelectorByAutomationId(
      "settingItemLabel-soundIncomingCall"
  );
  }
  async clickIncomingVoiceCallsLable(){
    await this.t.click(this.incomingVoiceCallsLabel);
  }
  async clickIncomingVoiceCalls(){
    await this.t.click(this.incomingVoiceCalls);
  }
  get incomingVoiceCallsSelectBoxItem(){
    return this.getSelectorByAutomationId(
      "settingItemSelectBoxItem-soundIncomingCall-0"
    );
  }
  async hoverIncomingVoiceCallsSelectBoxItem(){
    await this.t.hover(this.incomingVoiceCallsSelectBoxItem);
  }
}
