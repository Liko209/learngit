/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 09:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import { IUser } from "../../../v2/models";
import { WebphoneSession } from "webphone-client";
import { h } from "../../../v2/helpers";

export async function ensuredOneVoicemail(t: TestController, caller: IUser, callee: IUser, app) {
  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  const telephoneDialog = app.homePage.telephonyDialog;

  let hasVoicemail = await voicemailPage.items.count !== 0;
  if (!hasVoicemail) {
    await h(t).log('There is not any voicemail record. now make one voicemail...')
    let callerSession: WebphoneSession;
    await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
      step.initMetadata({
        number: caller.company.number,
        extension: caller.extension
      })
      callerSession = await h(t).newWebphoneSession(caller);
    });

    await h(t).withLog('and caller session makeCall to callee', async () => {
      await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
    });

    await h(t).withLog('Then the telephone dialog should be popup', async () => {
      await telephoneDialog.ensureLoaded();
    });

    await h(t).withLog('When callee click "send to voicemail" button', async () => {
      await telephoneDialog.clickSendToVoiceMailButton();
    });

    const waitTime = 20e3;
    await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
      step.setMetadata('time', (waitTime / 1000).toString());
      await t.wait(waitTime);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });

    await h(t).withLog('And refresh page', async () => {
      await t.wait(5e3);
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the voicemail page has one record', async (step) => {
      await t.expect(voicemailPage.items.count).eql(1, { timeout: 60e3 });
    });
  }
}

export async function addOneVoicemailFromGuest(t: TestController, caller: IUser, callee: IUser, app) {
  const telephoneDialog = app.homePage.telephonyDialog;

    let callerSession: WebphoneSession;
    await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
      step.initMetadata({
        number: caller.company.number,
        extension: caller.extension
      })
      callerSession = await h(t).newWebphoneSession(caller);
    });

    await h(t).withLog('and caller session makeCall to callee', async () => {
      await t.wait(5e3);
      console.log(`${callee.company.number}#${callee.extension}`)
      await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
    });

    await h(t).withLog('Then the telephone dialog should be popup', async () => {
      await telephoneDialog.ensureLoaded();
    });

    await h(t).withLog('When callee click "send to voicemail" button', async () => {
      await telephoneDialog.clickSendToVoiceMailButton();
    });

    const waitTime = 20e3;
    await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
      step.setMetadata('time', (waitTime / 1000).toString());
      await t.wait(waitTime);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });

    await h(t).withLog('And refresh page', async () => {
      await t.wait(5e3);
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });
  }


  export async function addOneVoicemailFromExt(t: TestController, caller: IUser, callee: IUser, app) {
    const voicemailPage = app.homePage.phoneTab.voicemailPage;
    const telephoneDialog = app.homePage.telephonyDialog;
  
      let callerSession: WebphoneSession;
      await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
        step.initMetadata({
          number: caller.company.number,
          extension: caller.extension
        })
        callerSession = await h(t).newWebphoneSession(caller);
      });
  
      await h(t).withLog('and caller session makeCall to callee', async () => {
        await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
      });
  
      await h(t).withLog('Then the telephone dialog should be popup', async () => {
        await telephoneDialog.ensureLoaded();
      });
  
      await h(t).withLog('When callee click "send to voicemail" button', async () => {
        await telephoneDialog.clickSendToVoiceMailButton();
      });
  
      const waitTime = 20e3;
      await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
        step.setMetadata('time', (waitTime / 1000).toString());
        await t.wait(waitTime);
        await callerSession.hangup();
        await callerSession.waitForStatus('terminated');
      });
  
      await h(t).withLog('And refresh page', async () => {
        await t.wait(5e3);
        await h(t).reload();
        await app.homePage.ensureLoaded();
      });
  
      await h(t).withLog('Then the voicemail page has one record', async (step) => {
        await t.expect(voicemailPage.items.count).eql(1, { timeout: 60e3 });
      });
    }
  
