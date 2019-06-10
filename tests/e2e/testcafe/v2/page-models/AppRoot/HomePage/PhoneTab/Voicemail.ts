/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 10:23:06
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseWebComponent } from "../../../BaseWebComponent";

export class VoicemailPage extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('VoicemailPageHeader').parent('div');
  }

  get header() {
    return this.getSelectorByAutomationId('VoicemailPageHeader');
  }

  get headerTitle() {
    return this.getSelectorByAutomationId('conversation-page-header-title');
  }

  get scrollDiv() {
    return this.getSelectorByAutomationId('virtualized-list');
  }

  get items() {
    return this.getSelector('[data-test-automation-class="voicemail-item"]')
  }

  voicemailItemByNth(n: number) {
    return this.getComponent(VoicemailItem, this.items.nth(n));
  }

  voicemailItemById(id: string) {
    return this.getComponent(VoicemailItem, this.items.filter(`[data-id="${id}"]`));
  }
}

class VoicemailItem extends BaseWebComponent {
  get id() {
    return this.self.getAttribute('data-id');
  }

  get avatar() {
    return this.self.find('[uid]');
  }

  get uid() {
    return this.avatar.getAttribute('uid')
  }

  get callerName() {
    return this.self.find('.list-item-primary');
  }

  get callerNumber() {
    return this.self.find('.list-item-secondary');
  }

  get playButton() {
    return this.getSelectorByAutomationId('audio-play-btn', this.self);
  }

  get pauseButton() {
    return this.getSelectorByAutomationId('audio-pause-btn', this.self);
  }

  async clickPlayButton() {
    return this.t.click(this.playButton);
  }

  async clickPauseButton() {
    return this.t.click(this.pauseButton);
  }

  get endTimeSpan() {
    return this.getSelectorByAutomationId('audio-end-time', this.self);
  }

  get currentTimeSpan() {
    return this.getSelectorByAutomationId('audio-current-time', this.self);
  }

  get moreMenuButton() {
    return this.getSelectorByAutomationId('voicemail-more-button', this.self);
  }

  async openMoreMenu() {
    await this.t.hover(this.self).click(this.moreMenuButton);
  }

  get readToggleButton() {
    return this.getSelectorByAutomationId('voicemail-read-button');
  }

  get downloadButton() {
    return this.getSelectorByAutomationId('voicemail-download-button');
  }

  get deleteButton() {
    return this.getSelectorByAutomationId('voicemail-delete-button');
  }

  async clickReadToggle() {
    await this.t.click(this.readToggleButton);
  }

  async clickDeleteButton() {
    await this.t.click(this.deleteButton);
  }
}

export class DeleteVoicemailDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId("deleteVoicemailConfirmDialog");
  }

  get title() {
    return this.getSelectorByAutomationId("DialogTitle", this.self)
  }

  get content() {
    return this.getSelectorByAutomationId("DialogContent", this.self)
  }

  get cancelButton() {
    return this.getSelectorByAutomationId("deleteVoicemailCancelButton", this.self)
  }

  get deleteButton() {
    return this.getSelectorByAutomationId("deleteVoicemailOkButton", this.self)
  }

  async clickCancelButton() {
    return this.t.click(this.cancelButton);
  }

  async clickDeleteButton() {
    return this.t.click(this.deleteButton);
  }

}