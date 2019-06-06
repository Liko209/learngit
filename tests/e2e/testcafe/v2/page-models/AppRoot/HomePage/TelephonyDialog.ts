import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";
import { ClientFunction } from 'testcafe';


export class TelephonyDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('dialer-move-animation-container');
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
    return this.getSelectorByAutomationId('telephony-end-btn');
  }

  async clickHangupButton() {
    await this.t.click(this.hangupButton);
  }

  get muteToggle() {
    return this.getSelectorByAutomationId('telephony-mute-btn');
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
    return this.getSelectorByAutomationId('telephony-hold-btn');
  }

  get minimizeWindow() {
    return this.getSelectorByAutomationId('telephony-minimized-view');
  }

  get holdButton() {
    return this.holdToggle.withAttribute('aria-label', 'Hold the call');
  }

  get minimizeMuteButton() {
    return this.minimizeWindow.withAttribute('aria-label', 'Mute');
  }

  async clickHoldButton() {
    return this.t.click(this.holdButton);
  }

  get unHoldButton() {
    return this.holdToggle.withAttribute('aria-label', 'Resume the call');
  }

  async clickUnHoldButton() {
    await this.t.click(this.unHoldButton);
  }

  get addButton() {
    return this.getSelectorByAutomationId('telephony-add-btn');
  }

  async clickAddButton() {
    await this.t.click(this.addButton);
  }

  get recordToggle() {
    return this.getSelectorByAutomationId('telephony-record-btn');
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
    return this.getSelectorByAutomationId('telephony-call-actions-btn');
  }

  get moreOptionsMenu() {
    return this.getSelectorByAutomationId('telephony-more-option-menu');
  }

  get replyActionMenuItem() {
    return this.getSelectorByAutomationId('telephony-reply-menu-item');
  }

  get replyWithInMeeting() {
    return this.getSelectorByAutomationId('reply-with-in-meeting');
  }

  get replyWithWillCallBackEntry() {
    return this.getSelectorByAutomationId('reply-with-will-call-back');
  }

  get replyWithWillCallBack5Min() {
    return this.getSelectorByAutomationId('reply-with-0-type-time');
  }

  get replyWithCustomMessage() {
    return this.getSelectorByAutomationId('reply-with-custom-message');
  }

  get replyBackActionButton() {
    return this.getSelectorByAutomationId('reply-back-button');
  }

  async clickActionsButton() {
    await this.t.click(this.actionsButton);
  }

  get hideKeypadPageButton() {
    return this.buttonOfIcon('previous');
  }

  async clickHideKeypadButton() {
    return this.t.click(this.hideKeypadPageButton);
  }

  get keysRecordArea() {
    return this.hideKeypadPageButton.nextSibling('div'); // todo: automation id
  }

  get minimizeButton() {
    return this.getSelectorByAutomationId('telephony-minimize-btn');
  }

  get ignoreButton() {
    return this.getSelectorByAutomationId('telephony-ignore-btn');
  }

  get deleteButton() {
    return this.buttonOfIcon('deletenumber');
  }

  // inbound call
  get sendToVoiceMailButton() {
    return this.getSelectorByAutomationId('telephony-voice-mail-btn');
  }

  get dialerInput() {
    return this.getSelectorByAutomationId('telephony-dialer-header').find('input[type="text"]');
  }

  get answerButton() {
    return this.getSelectorByAutomationId('telephony-answer-btn');
  }

  get dialButton() {
    return this.getSelectorByAutomationId('telephony-end-btn');
  }

  async keysRecordShouldBe(text: string) {
    await this.t.expect(this.keysRecordArea.textContent).eql(text);
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

  async focusKeypad() {
    var focus = ClientFunction(() => {
      document.querySelector('[data-test-automation-id="telephony-dialer-title"]').dispatchEvent(new Event('focus', { bubbles: true }))
    });

    await focus();
  }

  async tapKeypad(keys: string | string[]) {
    for (const i of keys) {
      await this.t.wait(5e2);
      await this.t.click(this.buttonOfIcon(this.keyMap[i]));
    }
  }

  async clickSendToVoiceMailButton() {
    await this.t.click(this.sendToVoiceMailButton);
  }

  async clickAnswerButton() {
    await this.t.click(this.answerButton);
  }

  async hoverAnswerButton() {
    await this.t.hover(this.answerButton);
  }

  async clickMinimizeButton() {
    await this.t.click(this.minimizeButton);
  }

  async clickIgnoreButton() {
    await this.t.click(this.ignoreButton);
  }

  async hoverIgnoreButton() {
    await this.t.hover(this.ignoreButton);
  }

  async hoverSendToVoiceMailButton() {
    await this.t.hover(this.sendToVoiceMailButton);
  }

  async hoverMinimizeButton() {
    await this.t.hover(this.minimizeButton);
  }

  async hoverDeleteButton() {
    await this.t.hover(this.deleteButton);
  }

  async clickDeleteButton() {
    await this.t.click(this.deleteButton);
  }

  async typeTextInDialer(text: string, options?) {
    await this.t.typeText(this.dialerInput, text, options)
  }

  async clickDialButton() {
    await this.t.click(this.dialButton);
  }

  async hoverMoreOptionsButton() {
    await this.t.hover(this.actionsButton);
  }

  async clickMoreOptionsButton() {
    await this.t.click(this.actionsButton);
  }

  async clickReplyActionButton() {
    await this.t.click(this.replyActionMenuItem);
  }

  async hoverReplyActionButton() {
    await this.t.hover(this.replyActionMenuItem);
  }

  async clickReplyInMeetingButton() {
    await this.t.click(this.replyWithInMeeting);
  }

  async clickReplyWithWillCallBackEntryButton() {
    await this.t.click(this.replyWithWillCallBackEntry);
  }

  async clickReplyWithWillCallBack5MinButton() {
    await this.t.click(this.replyWithWillCallBack5Min);
  }

  async hoverReplyBackActionButton() {
    await this.t.hover(this.replyBackActionButton);
  }

  async typeCustomReplyMessage(message: string) {
    await this.clickAndTypeText(this.replyWithCustomMessage, message);
  }

  async sendCustomReplyMessage() {
    await this.t.click(this.replyWithCustomMessage).pressKey('enter');
  }

  get callerIdSelector() {
    return this.getSelectorByAutomationId('callerIdSelector', this.self);
  }

  async currentCallerIdShoulebe(text: string) {
    await this.t.expect(this.callerIdSelector.textContent).eql(text);
  }

  async clickCallerIdSelector() {
    await this.t.click(this.callerIdSelector);
  }

  get callerIdList() {
    return this.getComponent(CallerIdList);
  }
}
class CallerIdList extends BaseWebComponent {
  get self() {
    return this.getSelector('[role="listbox"]')
  }

  get callerIds() {
    return this.self.find('li').filter('[data-value]');
  }

  async selectByValue(value: string) {
    await this.t.click(this.callerIds.filter(`[data-value="${value}"]`));
  }

  async selectNth(n: number) {
    await this.t.click(this.callerIds.nth(n))
  }

  async selectBlocked() {
    await this.selectByValue('Blocked');
  }

  async selectByText(text: string) {
    await this.t.click(this.callerIds.withExactText(text));
    return this.getSelectorByAutomationId('callerIdSelector');
  }
}

export class TelephonyMinimizeWindow extends BaseWebComponent {

  get self() {
    return this.getSelectorByAutomationId('telephony-minimized-view');
  }

  get minimizeMuteToggle() {
    return this.getSelectorByAutomationId('telephony-mute-btn');
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


  get hangupButton() {
    return this.buttonOfIcon('hand_up');
  }

  async clickHangupButton() {
    await this.t.click(this.hangupButton);
  }

  async hoverhandupButton() {
    await this.t.hover(this.hangupButton);
  }

  async hoverMuteButton() {
    await this.t.hover(this.muteButton);
  }

  async hoverunMuteButton() {
    await this.t.hover(this.unMuteButton);
  }
}
