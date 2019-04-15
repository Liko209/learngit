import * as _ from 'lodash';
import { h } from '../../../helpers';
import { BaseWebComponent } from "../../BaseWebComponent";


export class TelephonyDialog extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="document"] > .react-draggable');
  }

  get callTime() {
    return this.self.find("div > div > div > div > div"); // TODO: automationId
  }

  get avatar() {
    return this.self.find('div').withAttribute('uid'); // TODO: automationId
  }

  get name() {
    return this.avatar.nextSibling('div').find('div').nth(0);// TODO: automationId
  }

  get extension() {
    return this.avatar.nextSibling('div').find('div').nth(1);// TODO: automationId
  }

  get handUpButton() {
    return this.buttonOfIcon('hand_up');
  }

  async clickHandUpButton() {
    await this.click(this.handUpButton);
  }

  get muteButton() {
    return this.buttonOfIcon('mic');
  }

  async clickMuteButton() {
    await this.click(this.muteButton);
  }

  get unMuteButton() {
    return this.buttonOfIcon('mic_off');
  }

  async clickUnMuteButton() {
    return this.click(this.unMuteButton);
  }

  get keypadButton() {
    return this.buttonOfIcon('keypad');
  }

  async clickKeypadButton() {
    await this.click(this.keypadButton);
  }

  get holdToggle() {
    return this.getSelectorByAutomationId('holdBtn');
  }

  get holdButton() {
    return this.holdToggle.withAttribute('aria-label', 'Hold the call');
  }

  async clickHoldButton() {
    return this.click(this.holdButton);
  }

  get unHoldButton() {
    return this.holdToggle('holdBtn').withAttribute('aria-label', 'Resume the call');
  }

  async clickUnHoldButton() {
    await this.click(this.unHoldButton);
  }

  get addButton() {
    return this.buttonOfIcon('call_add');
  }

  async clickAddButton() {
    await this.click(this.addButton);
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
    await this.click(this.recordButton);
  }

  async clickStopRecordButton() {
    await this.click(this.stopRecordButton);
  }

  get actionsButton() {
    return this.buttonOfIcon('call_more');
  }

  async clickActionsButton() {
    await this.click(this.actionsButton);
  }

  get backButtonOnKeypadPage() {
    return this.buttonOfIcon('previous');
  }

  async clickBackButton() {
    return this.click(this.backButtonOnKeypadPage);
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
      await this.click(this.buttonOfIcon(this.keyMap[i]));
    }
  }

  // inbound call

  get answerButton() {
    return this.buttonOfIcon('phone')
  }

  async clickAnswerButton() {
    await this.click(this.answerButton);
  }

  get ignoreButton() {
    return this.buttonOfIcon('close')
  }

  async clickIgnoreButton() {
    await this.click(this.ignoreButton);
  }
}