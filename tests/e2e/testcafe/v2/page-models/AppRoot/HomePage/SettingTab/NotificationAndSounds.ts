import { BaseWebComponent } from '../../../BaseWebComponent';
import * as assert from 'assert';

export class NotificationAndSounds extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('settingPage-notificationAndSounds');
  };

  get header() {
    return this.getSelectorByAutomationId('settingPageHeader-notificationAndSounds');
  }

  get headerTitle() {
    return this.getSelectorByAutomationId("conversation-page-header-title");
  }

  get audioSourcesSection() {
    return this.getSelectorByAutomationId('settingSection-audioSource');
  }

  get audioSourcesTitle() {
    return this.getSelectorByAutomationId('settingSectionTitle-audioSource');
  }

  get microphoneSourceLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-microphoneSource');
  }

  get microphoneSourceDescription() {
    return this.getSelectorByAutomationId('settingItemDescription-microphoneSource');
  }

  get microphoneSourceSelectBox() {
    return this.getSelectorByAutomationId('settingItemSelectBox-microphoneSource');
  }

  get microphoneSourceItems() {
    return this.getSelectorByAutomationId('settingItemSelectBoxItem-microphoneSource');
  }

  get speakerSourceLabel() {
    return this.getSelectorByAutomationId('settingItemLabel-speakerSource');
  }

  get speakerSourceDescription() {
    return this.getSelectorByAutomationId('settingItemDescription-speakerSource');
  }

  get speakerSourceSelectBox() {
    return this.getSelectorByAutomationId('settingItemSelectBox-speakerSource');
  }

  get speakerSourceItems() {
    return this.getSelectorByAutomationId('settingItemSelectBoxItem-speakerSource');
  }

  microphoneSourceById(value: string) {
    return this.microphoneSourceItems.filter(`[data-test-automation-value="${value}"]`);
  }

  microphoneSourceByLabel(label: string) {
    return this.microphoneSourceItems.withExactText(label);
  }

  getMicrophoneSourceIdByLabel(label: string) {
    return this.microphoneSourceByLabel(label).getAttribute('data-test-automation-value');
  }

  async clickMicrophoneSourceSelectBox() {
    await this.t.click(this.microphoneSourceSelectBox);
  }

  async currentMicrophoneSourceLabelToBe(label: string) {
    await this.t.expect(this.microphoneSourceSelectBox.textContent).eql(label);
  }

  async currentMicrophoneSourceIdToBe(value: string) {
    await this.t.expect(this.microphoneSourceSelectBox.getAttribute('data-test-automation-value')).eql(value);
  }

  async clickSpeakerSourceSelectBox() {
    await this.t.click(this.speakerSourceSelectBox);
  }

  async currentSpeakerSourceLabelToBe(babel: string) {
    await this.t.expect(this.speakerSourceSelectBox.textContent).eql(babel);
  }

  async currentSpeakerSourceIdToBe(value: string) {
    await this.t.expect(this.speakerSourceSelectBox.getAttribute('data-test-automation-value')).eql(value);
  }

  speakerSourceById(value: string) {
    return this.speakerSourceItems.filter(`[data-test-automation-value="${value}"]`);
  }

  speakerSourceByLabel(label: string) {
    return this.speakerSourceItems.withExactText(label);
  }

  getSpeakerSourceIdByLabel(label: string) {
    return this.microphoneSourceByLabel(label).getAttribute('data-test-automation-value');
  }

  async selectMicrophoneSourceByLabel(label: string) {
    await this.t.click(this.microphoneSourceByLabel(label));
  }

  async selectMicrophoneSourceById(value: string) {
    await this.t.click(this.microphoneSourceById(value));
  }

  async selectSpeakerSourceByLabel(label: string) {
    await this.t.click(this.speakerSourceByLabel(label));
  }

  async selectSpeakerSourceById(value: string) {
    await this.t.click(this.speakerSourceById(value));
  }


}
