/*
 * @Author: doyle.wu
 * @Date: 2019-06-12 11:13:38
 */

require("dotenv").config();
import { Config } from '../config';
import { WebphoneSession } from 'webphone-client';
import { PptrUtils, JupiterUtils } from '../utils';
import * as bluebird from 'bluebird';

const extensions = ["701", "702", "703", "704", "705", "706", "707", "708"];

const getSession = async (index) => {
  let extension: string = extensions[index % extensions.length];
  if (extension === Config.jupiterPin) {
    extension = extensions[(index + 1) % extensions.length];
  }

  try {
    const session = new WebphoneSession(Config.webPhoneUrl, Config.webPhoneEnv, {
      phoneNumber: Config.jupiterUser,
      extension,
      password: Config.jupiterPassword,
      mediaType: 'Tone',
      frequency: 440
    });

    await session.init();

    return session;
  } catch {
    return undefined;
  }
}

(async () => {

  const readCount = 0, unreadCount = 400000, toVoiceMail = true;

  const browser = await PptrUtils.launch();

  const page = await browser.newPage();

  await page.goto(await JupiterUtils.getAuthUrl(Config.jupiterHost, browser));

  await PptrUtils.waitForSelector(page, "div.conversation-list-section li.conversation-list-item");

  await PptrUtils.click(page, 'div[data-test-automation-id="phone"]');
  let index = 1;
  let session: WebphoneSession;
  if (toVoiceMail) {
    try {
      for (let i = 0; i < unreadCount; i++) {
        await PptrUtils.click(page, 'button[data-test-automation-id="telephony-voice-mail-btn"]');
      }
    } catch (err) {
    }
  } else {
    for (let i = 0; i < readCount; i++) {
      session = await getSession(i);
      if (!session) {
        continue;
      }
      //console.log(index++);
      try {
        await session.makeCall([Config.jupiterUser, '#', Config.jupiterPin].join(''))
      } catch {
        continue;
      }
      await PptrUtils.click(page, 'button[data-test-automation-id="telephony-answer-btn"]');

      await bluebird.delay(3000);
      await PptrUtils.click(page, 'button[data-test-automation-id="telephony-end-btn"]');

      await session.close();
    }

    index = 1;
    for (let i = 0; i < unreadCount; i++) {
      session = await getSession(i);

      if (!session) {
        continue;
      }
      //console.log(index++);
      try {
        await session.makeCall([Config.jupiterUser, '#', Config.jupiterPin].join(''))
      } catch {
        continue;
      }

      await bluebird.delay(3000);

      await session.hangup();

      await session.close();
    }

  }
  await PptrUtils.closeAll();
})();
