/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 09:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import { IUser } from "../../../v2/models";
import { WebphoneSession } from "webphone-client";
import { h } from "../../../v2/helpers";
import { AppRoot } from "../../../v2/page-models/AppRoot";

export async function ensuredOneVoicemail(t: TestController, caller: IUser, callee: IUser, app: AppRoot) {
  const voicemailPage = app.homePage.phoneTab.voicemailPage;

  let hasVoicemail = await voicemailPage.items.count !== 0;
  if (!hasVoicemail) {
    await h(t).log('There is not any voicemail record. now make one voicemail...');

    let callerSession: WebphoneSession;
    await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
      step.initMetadata({
        number: caller.company.number,
        extension: caller.extension
      })
      callerSession = await h(t).newWebphoneSession(caller);
    });
    await addVoicemail(t, callerSession, `${callee.company.number}#${callee.extension}`, app);
  }
}

export async function addOneVoicemailFromAnotherUser(t: TestController, caller: IUser, callee: IUser, app: AppRoot) {
  let callerSession: WebphoneSession;
  await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
    step.initMetadata({
      number: caller.company.number,
      extension: caller.extension
    })
    callerSession = await h(t).newWebphoneSession(caller);
  });
  await addVoicemail(t, callerSession, `${callee.company.number}#${callee.extension}`, app);
}

export async function addOneVoicemailFromDid(t: TestController, did: string, password: string, callee: IUser, app: AppRoot) {
  let callerSession: WebphoneSession;
  await h(t).withLog('When I login webphone with did: {number}', async (step) => {
    step.initMetadata({ number: did })
    callerSession = await h(t).newWebphoneSessionWithDid(did, password);
  });
  await addVoicemail(t, callerSession, `${callee.company.number}#${callee.extension}`, app);
}

// need on voicemail page
export async function addVoicemail(t: TestController, callerSession: WebphoneSession, calleeNumber: string, app: AppRoot, callTime = 20e3, count = 1) {
  const voicemailPage = app.homePage.phoneTab.voicemailPage;
  for (let i = 0; i < count; i++) {
    await h(t).withLog('And caller session makeCall to callee "{calleeNumber}"', async (step) => {
      step.setMetadata('calleeNumber', calleeNumber);
      await callerSession.makeCall(calleeNumber);
    });

    await h(t).withLog('and send dtmf "#" to transfer voicemail', async () => {
      await callerSession.waitForStatus('accepted');
      await callerSession.dtmf('#');
    });

    await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
      step.setMetadata('time', (callTime / 1000).toString());
      await t.wait(callTime);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });
  }
  // due to voicemail delay from backend sync to frontend.
  await h(t).withLog('And refresh page', async () => {
    await t.wait(5e3);
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the voicemail page has more than {count} record', async (step) => {
    step.setMetadata('count', count.toString());
    await t.expect(voicemailPage.items.count).gte(count, { timeout: 30e3 });
  });

}