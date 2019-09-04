/*
 * @Author: doyle.wu
 * @Date: 2019-06-11 09:18:15
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { WebPhone } from '../webphone';
import { PptrUtils } from '../utils';
import { Config } from '../config';

class PhonePage extends Page {
  private callHistoryAllBtn: string = 'button[data-test-automation-id="CallHistoryAllCalls"]';

  private telephonyMinBtn: string = 'button[data-test-automation-id="telephony-minimize-btn"]';

  private voiceMailTab: string = 'div[data-test-automation-id="phone-tab-voicemail"]';

  private voiceMailItem: string = 'div[data-test-automation-class="voicemail-item"]';

  private voiceMailMoreBtn: string = 'button[data-test-automation-id="voicemail-more-button"]';

  private voiceMailDeleteBtn: string = '*[data-test-automation-id="voicemail-delete-button"]';

  private voiceMailDeleteOkBtn: string = 'button[data-test-automation-id="deleteVoicemailOkButton"]';

  private toVoiceMailBtn: string = 'button[data-test-automation-id="telephony-voice-mail-btn"]';

  private otherExtensions: Array<string> = [];

  constructor(passContext: any) {
    super(passContext);

    let extension;
    for (let i = 701; i <= 708; i++) {
      extension = i.toFixed(0);

      if (Config.jupiterPin !== extension) {
        this.otherExtensions.push(extension);
      }
    }
  }

  private async _getPhone(): Promise<WebPhone> {
    let index = parseInt((Math.random() * 1000).toFixed(0));
    let extension: string = this.otherExtensions[index % this.otherExtensions.length];

    return new WebPhone(Config.jupiterUser, extension);
  }

  async waitForCompleted(): Promise<boolean> {
    let page = await this.page();

    await PptrUtils.waitForSelector(page, "div.conversation-list-section li.conversation-list-item");

    await PptrUtils.click(page, 'div[data-test-automation-id="phone"]');

    return await PptrUtils.waitForSelector(page, this.callHistoryAllBtn);
  }

  async lookupRecentCallLog(): Promise<void> {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="telephony-dialpad-btn"]');

    await PptrUtils.click(page, 'button[data-test-automation-id="recentCallBtn"]', { timeout: 3000 });

    await PptrUtils.waitForSelector(page, 'div[data-test-automation-id="dialer-container"] div[data-test-automation-id="virtualized-list"]', { timeout: 3000 })

    await PptrUtils.click(page, 'div[data-test-automation-id="dialer-container"] button[data-test-automation-id="telephony-dialpad-btn"]');
  }

  async createCallLog(): Promise<void> {
    let page = await this.page();

    let session = await this._getPhone();

    try {
      await session.makeCall(Config.jupiterUser, Config.jupiterPin);
      await PptrUtils.click(page, 'button[data-test-automation-id="telephony-answer-btn"]', { timeout: 10000 });
      await bluebird.delay(3000);
      await PptrUtils.click(page, 'button[data-test-automation-id="telephony-end-btn"]', { timeout: 3000 });
    } catch {
      return;
    } finally {
      await session.destroy();
      await PptrUtils.click(page, this.telephonyMinBtn, { timeout: 3000 });
    }
  }

  async deleteCallLog(): Promise<void> {
    let page = await this.page();
    await PptrUtils.hover(page, 'div[data-test-automation-class="call-history-item"]:nth-child(2)');

    await PptrUtils.click(page, 'button[data-test-automation-id="calllog-delete-button"]', { timeout: 3000 });

    await PptrUtils.click(page, 'button[data-test-automation-id="deleteCallLogOkButton"]', { timeout: 3000 });
  }


  async enterVoiceMailTab(): Promise<void> {
    let page = await this.page();
    await bluebird.delay(2000);

    await PptrUtils.click(page, this.voiceMailTab);

    await PptrUtils.waitForSelector(page, this.voiceMailItem);
  }

  async createVoiceMail(): Promise<void> {
    let page = await this.page();

    await PptrUtils.click(page, 'button[data-test-automation-id="telephony-dialpad-btn"]');

    let session = await this._getPhone();

    await session.makeCall(Config.jupiterUser, Config.jupiterPin);

    await PptrUtils.click(page, this.toVoiceMailBtn);

    await bluebird.delay(20000);

    await session.hangup();

    await bluebird.delay(2000);

    await session.destroy();

    await PptrUtils.click(page, this.telephonyMinBtn, { timeout: 3000 });
  }

  async deleteVoiceMail(): Promise<void> {
    let page = await this.page();
    await PptrUtils.hover(page, this.voiceMailItem);

    await PptrUtils.click(page, this.voiceMailMoreBtn, { timeout: 3000 });

    await PptrUtils.click(page, this.voiceMailDeleteBtn, { timeout: 3000 });

    await PptrUtils.click(page, this.voiceMailDeleteOkBtn, { timeout: 3000 });
  }
}

export {
  PhonePage
}
