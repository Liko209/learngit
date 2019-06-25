/*
 * @Author: doyle.wu
 * @Date: 2019-06-11 09:18:15
 */
import { Page } from "./page";
import * as bluebird from "bluebird";
import { PptrUtils } from '../utils';
import { WebphoneSession } from 'webphone-client';
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

      if (Config.jupiterPin === extension) {
        this.otherExtensions.push(extension);
      }
    }
  }

  private async _getSession(): Promise<WebphoneSession> {
    let index = parseInt((Math.random() * 1000).toFixed(0));
    let extension: string = this.otherExtensions[index % this.otherExtensions.length];

    let retryCnt = 5, session;
    while (retryCnt-- > 0) {
      try {
        session = new WebphoneSession(Config.webPhoneUrl, Config.webPhoneEnv, {
          phoneNumber: Config.jupiterUser,
          extension,
          password: Config.jupiterPassword,
          mediaType: 'Tone',
          frequency: 440
        });

        await session.init();
      } catch {
      }

      if (session) {
        return session;
      }
    }
    return undefined;
  }

  async waitForCompleted(): Promise<boolean> {
    let page = await this.page();

    await PptrUtils.waitForSelector(page, "div.conversation-list-section li.conversation-list-item");

    await PptrUtils.click(page, 'div[data-test-automation-id="phone"]');

    return await PptrUtils.waitForSelector(page, this.callHistoryAllBtn);
  }


  async enterVoiceMailTab(): Promise<void> {
    let page = await this.page();

    await PptrUtils.click(page, this.voiceMailTab);

    await PptrUtils.waitForSelector(page, this.voiceMailItem);
  }

  async createVoiceMail(): Promise<void> {
    let page = await this.page();

    let session = await this._getSession();
    if (!session) {
      await bluebird.delay(15000);
      await PptrUtils.click(page, this.telephonyMinBtn, { timeout: 3000 });
      return;
    }

    try {
      await session.makeCall([Config.jupiterUser, '#', Config.jupiterPin].join(''))
    } catch {
      await bluebird.delay(15000);
      await PptrUtils.click(page, this.telephonyMinBtn, { timeout: 3000 });
      return;
    }

    await PptrUtils.click(page, this.toVoiceMailBtn);

    await bluebird.delay(15000);

    try {
      await session.hangup();
    } catch (err) {
    }

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
