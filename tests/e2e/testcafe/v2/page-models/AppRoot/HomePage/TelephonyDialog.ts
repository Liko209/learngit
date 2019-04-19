import * as _ from 'lodash';
import { h } from '../../../helpers';
import { BaseWebComponent } from "../../BaseWebComponent";


export class TelephonyDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="document"]');
  }

  get title() {
    return this.getSelectorByAutomationId('telephony-dialer-title');
  }

  get callTime() {
    return this.getSelectorByAutomationId('telephony-dialer-title-left');
  }

  get header() {
    return this.getSelectorByAutomationId('telephony-dialer-header');
  }

  get avatar() {
    return this.header.find('div').withAttribute('uid');
  }

  get name() {
    return this.getSelectorByAutomationId('telephony-dialer-header-name');
  }

  get extension() {
    return this.getSelectorByAutomationId('telephony-dialer-header-phone');
  }

  get hangupButton() {
    return this.buttonOfIcon('hand_up');
  }

  async clickHangupButton() {
    await this.t.click(this.hangupButton);
  }

  get muteButton() {
    return this.buttonOfIcon('mic');
  }

  async clickMuteButton() {
    await this.t.click(this.muteButton);
  }

  get unMuteButton() {
    return this.buttonOfIcon('mic_off');
  }

  async clickUnMuteButton() {
    return this.t.click(this.unMuteButton);
  }

  get keypadButton() {
    return this.buttonOfIcon('keypad');
  }

  async clickKeypadButton() {
    await this.t.click(this.keypadButton);
  }

  get holdToggle() {
    return this.getSelectorByAutomationId('holdBtn');
  }

  get holdButton() {
    return this.holdToggle.withAttribute('aria-label', 'Hold the call');
  }

  async clickHoldButton() {
    return this.t.click(this.holdButton);
  }

  get unHoldButton() {
    return this.holdToggle('holdBtn').withAttribute('aria-label', 'Resume the call');
  }

  async clickUnHoldButton() {
    await this.t.click(this.unHoldButton);
  }

  get addButton() {
    return this.buttonOfIcon('call_add');
  }

  async clickAddButton() {
    await this.t.click(this.addButton);
  }

  get recordToggle() {
    return this.getSelectorByAutomationId('recordBtn');
  }

  get recordButton() {
    return this.recordToggle.withAttribute('aria-label', 'Record the call');
  }

  get stopRecordButton() {
    return this.recordToggle.withAttribute('aria-label', 'Stop recording');
  }

  async clickRecordButton() {
    await this.t.click(this.recordButton);
  }

  async clickStopRecordButton() {
    await this.t.click(this.stopRecordButton);
  }

  get actionsButton() {
    return this.buttonOfIcon('call_more');
  }

  async clickActionsButton() {
    await this.t.click(this.actionsButton);
  }

  get backButtonOnKeypadPage() {
    return this.buttonOfIcon('previous');
  }

  async clickBackButton() {
    return this.t.click(this.backButtonOnKeypadPage);
  }

  get keyRecordArea() {
    return this.backButtonOnKeypadPage.nextSibling('div'); // todo: automation id
  }

  // keypad
  private keyMap = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    0: 'zero',
    '*': 'asterisk',
    '#': 'hash'
  }

  async pressKeypad(keys: string | string[]) {
    for (const i of keys) {
      await this.t.wait(5e2);
      await this.t.click(this.buttonOfIcon(this.keyMap[i]));
    }
  }

  // inbound call
  get sendToVoiceMailButton() {
    return this.getSelectorByAutomationId('telephony-voice-mail-btn');
  }

  async clickSendToVoiceMailButton() {
    await this.t.click(this.sendToVoiceMailButton);
  }

  get answerButton() {
    return this.buttonOfIcon('phone')
  }

  async clickAnswerButton() {
    await this.t.click(this.answerButton);
  }

  get ignoreButton() {
    return this.buttonOfIcon('close')
  }

  async clickIgnoreButton() {
    await this.t.click(this.ignoreButton);
  }

  async hoverSendToVoiceMailButton() {
    await this.t.hover(this.sendToVoiceMailButton);
  }

}
