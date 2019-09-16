import * as _ from 'lodash';
import { BaseWebComponent } from "../../BaseWebComponent";
import { ClientFunction } from 'testcafe';
import { H } from '../../../helpers';
import * as assert from 'assert';
import { Selector } from 'testcafe';

export class TelephonyDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('dialer-container');
  }

  get title() {
    return this.getSelectorByAutomationId('telephony-dialer-title');
  }

  get callTime() {
    return this.getSelectorByAutomationId('telephony-dialer-title-left');
  }

  get titleLabel() {
    return this.getSelectorByAutomationId('telephony-dialer-title-left');
  }

  get header() {
    return this.getSelectorByAutomationId('telephony-dialer-header');
  }

  // Fixme
  get avatar() {
    return this.getSelectorByAutomationIdUnderSelf('dialer-header-avatar');
  }

  get name() {
    return this.getSelectorByAutomationId('telephony-dialer-header-name');
  }

  get phoneNumber() {
    return this.getSelectorByAutomationId('telephony-dialer-header-phone');
  }

  get conferenceCall() {
    return this.getSelectorByAutomationId('telephony-dialer-header-name');
  }

  get hangupButton() {
    return this.getSelectorByAutomationId('telephony-end-btn');
  }

  get recentCallButton() {
    return this.getSelectorByAutomationId('recentCallBtn');
  }

  get backToDialpadButton() {
    return this.getSelectorByAutomationId('telephony-dialpad-btn', this.self);
  }

  get callLogList() {
    return this.getSelectorByAutomationId('virtualized-list');
  }

  get callLogItem() {
    return this.getSelectorByAutomationId('virtualized-list').find('div').nth(1).find('div');
  }

  async clickHangupButton() {
    await H.sleep(1e3);
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

  //Transfer
  get transferActionsButton() {
    return this.getSelectorByAutomationId('telephony-transfer-menu-item');
  }

  get transferAskFirstButton() {
    return this.getSelectorByAutomationId('telephony-ask-first-btn');
  }

  get completeTransferButton() {
    return this.getSelectorByAutomationId('complete-transfer-call-btn');
  }

  get cancelTransferButton() {
    return this.getSelectorByAutomationId('cancel-warm-transfer-btn');
  }

  get transferNowButton() {
    return this.getSelectorByAutomationId('telephony-transfer-btn');
  }

  get transferToVoicemailButton() {
    return this.getSelectorByAutomationId('telephony-voice-mail-btn');
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

  //Multiple call
  get endAndAnswerButton() {
    return this.getSelectorByAutomationId('telephony-end-answer-btn');
  }

  //contact search

  get contactSearchAvatar() {
    return this.getSelectorByAutomationId('telephony-contact-search-list_item-avatar');
  }

  // park
  get parkActionMenuItem() {
    return this.getSelectorByAutomationId('telephony-park-menu-item');
  }

  // forward
  get forwardActionMenuItem() {
    return this.getSelectorByAutomationId('telephony-forward-menu-item');
  }

  get forwardListFirstItem() {
    return this.getSelectorByAutomationId('forward-list-0-item');
  }

  get customForwardItem() {
    return this.getSelectorByAutomationId('custom-forward');
  }

  get forwardActionButton() {
    return this.getSelectorByAutomationId('telephony-forward-btn');
  }

  //call switch
  get SwitchToptap() {
    return this.getSelector('.MuiSnackbarContent-action.action').find('button').withText('Switch call to this device');
  }
  async clickSwitchToptap() {
    await this.t.click(this.SwitchToptap);
  }
  get callSwitchDialog() {
    return this.getSelectorByAutomationId('callSwitchDialog');
  }

  get SwitchOKButton() {
    return this.getSelectorByAutomationId('callSwitchOkButton');
  }
  async clickSwitchOKButton() {
    await this.t.click(this.SwitchOKButton);
  }
  get CancelSwitchButton() {
    return this.getSelectorByAutomationId('callSwitchCancelButton');
  }

  async clickCancelSwitchButton() {
    await this.t.click(this.CancelSwitchButton);
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
    return this.getSelectorByAutomationId('telephony-dial-btn');
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

  async clickEndAndAnswerButton() {
    await this.t.click(this.endAndAnswerButton);
  }

  async hoverSendToVoiceMailButton() {
    await this.t.hover(this.sendToVoiceMailButton, { speed: 0.1 });
  }

  async hoverMinimizeButton() {
    await this.t.hover(this.minimizeButton, { speed: 0.1 });
  }

  async hoverRecentCallButton() {
    await this.t.hover(this.recentCallButton, { speed: 0.1 });
  }

  async clickRecentCallButton() {
    await this.t.click(this.recentCallButton);
  }

  async hoverBackToDialpadButton() {
    await this.t.hover(this.backToDialpadButton, { speed: 0.1 });
  }

  async clickCallLogItem(n: number) {
    await this.t.click(this.callLogItem.nth(n));
  }

  async scrollToY(y: number) {
    const scrollDivElement = this.callLogList;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }

  async expectStreamScrollToY(y: number) {
    await this.t.expect(this.callLogList.scrollTop).eql(y);
  }

  async scrollToBottom(retryTime = 3) { // retry until scroll bar at the end
    let initHeight = 0;
    for (const i of _.range(retryTime)) {
      const scrollHeight = await this.callLogList.scrollHeight;
      if (initHeight == scrollHeight) {
        break
      }
      initHeight = scrollHeight;
      const clientHeight = await this.callLogList.clientHeight;
      await this.scrollToY(scrollHeight - clientHeight);
    }
  }

  async expectStreamScrollToBottom() {
    await H.retryUntilPass(async () => {
      const scrollTop = await this.callLogList.scrollTop;
      const scrollHeight = await this.callLogList.scrollHeight;
      const clientHeight = await this.callLogList.clientHeight;
      assert.deepStrictEqual(scrollTop, scrollHeight - clientHeight, `${scrollTop} != ${scrollHeight} - ${clientHeight}`)
    });
  }

  async selectItemByKeyboard() {
    await this.t.pressKey('down');
  }

  async hoverDeleteButton() {
    await this.t.hover(this.deleteButton, { speed: 0.1 });
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
    await this.t.hover(this.actionsButton, { speed: 0.1 });
  }

  async clickMoreOptionsButton() {
    await this.t.click(this.actionsButton);
  }

  async clickTransferActionButton() {
    await this.t.click(this.transferActionsButton);
  }

  async clickTransferAskFirstButton() {
    await this.t.click(this.transferAskFirstButton);
  }

  async hoverCompleteTransferButton() {
    await this.t.hover(this.completeTransferButton);
  }

  async clickCompleteTransferButton() {
    await this.t.click(this.completeTransferButton);
  }

  async hoverCancelTransferButton() {
    await this.t.hover(this.cancelTransferButton);
  }

  async clickCancelTransferButton() {
    await this.t.click(this.cancelTransferButton);
  }

  async clickTransferNowButton() {
    await this.t.click(this.transferNowButton);
  }

  async clickTransferToVoicemailButton() {
    await this.t.click(this.transferToVoicemailButton);
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
    await this.t.hover(this.replyBackActionButton, { speed: 0.1 });
  }

  async typeCustomReplyMessage(message: string) {
    await this.clickAndTypeText(this.replyWithCustomMessage, message);
  }

  async sendCustomReplyMessage() {
    await this.t.click(this.replyWithCustomMessage).pressKey('enter');
  }

  get callerIdSelector() {
    return this.getSelectorByAutomationId('caller-id-selector', this.self);
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

  async hitEnterToMakeCall() {
    await this.t.click(this.dialerInput).pressKey('enter');
  }

  get contactSearchList() {
    return this.getComponent(ContactSearchList);
  }

  // Park
  async clickParkActionButton() {
    await this.t.click(this.parkActionMenuItem);
  }

  // Forward
  async hoverForwardButton() {
    await this.t.hover(this.forwardActionMenuItem);
  }

  async clickForwardListFirstButton() {
    await this.t.click(this.forwardListFirstItem);
  }

  async clickCustomForwardButton() {
    await this.t.click(this.customForwardItem);
  }

  async hoverForwardActionButton() {
    await this.t.hover(this.forwardActionButton, { speed: 0.1 });
  }

  async clickForwardActionButton() {
    await this.t.click(this.forwardActionButton);
  }

  async existForwardTitle(text: string) {
    await this.t.expect(this.titleLabel.withText(text).exists).ok();
  }
}

class CallerIdList extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('caller-id-selector-list');
  }

  get callerIds() {
    return this.self.find('li');
  }

  async selectByValue(value: string) {
    await this.t.click(this.callerIds.filter(`[value="${value}"]`));
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

export class ContactSearchList extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('telephony-contact-search-list');
  }

  /* scroll */
  get scrollDiv() {
    return this.getSelectorByAutomationId('virtualized-list', this.self);
  }

  async scrollToY(y: number) {
    const scrollDivElement = this.scrollDiv;
    await ClientFunction((_y) => {
      scrollDivElement().scrollTop = _y;
    },
      { dependencies: { scrollDivElement } })(y);
  }

  async scrollToMiddle() {
    const scrollHeight = await this.scrollDiv.scrollHeight;
    const clientHeight = await this.scrollDiv.clientHeight;
    const middleHeight = (scrollHeight - clientHeight) / 2;
    await this.scrollToY(middleHeight);
  }

  async expectStreamScrollToY(y: number) {
    await this.t.expect(this.scrollDiv.scrollTop).eql(y);
  }

  get searchResults() {
    return this.getSelectorByAutomationId("telephony-contact-search-list_item", this.self);
  }

  async selectNth(n: number) {
    await this.t.click(this.searchResults.nth(n));
  }

  get directDialIcon() {
    return this.getSelectorByAutomationId('telephony-contact-search-list_item-dial_button', this.searchResults.nth(0));
  }

  get hasDirectDialIcon() {
    return this.getSelectorByAutomationId('telephony-contact-search-list_item-dial_button', this.searchResults.nth(0)).exists;
  }

  async clickDirectDialIcon() {
    await this.t.click(this.directDialIcon);
  }

  get hasDirectDial() {
    return !!(this.searchResults[0] && this.searchResults.nth(0).find('div:nth-child(2)>button').exists);
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

  async hoverUnMuteButton() {
    await this.t.hover(this.unMuteButton, { speed: 0.1 });
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
    await this.t.hover(this.hangupButton, { speed: 0.1 });
  }

  async hoverMuteButton() {
    await this.t.hover(this.muteButton, { speed: 0.1 });
  }

  async hoverunMuteButton() {
    await this.t.hover(this.unMuteButton);
  }
}
