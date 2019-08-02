/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 09:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import { IUser } from "../../../v2/models";
import { h } from "../../../v2/helpers";
import { WebphoneSession } from 'webphone-client';
import { AppRoot } from "../../../v2/page-models/AppRoot";

export async function ensuredOneMissCallLog(t: TestController, caller: IUser, callee: IUser, app) {
  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;

  let hasCallLog = await callHistoryPage.items.count !== 0;
  if (!hasCallLog) {
    await h(t).log('There is not any call log record. now make one call log...')
    let callerSession: WebphoneSession;
    await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
      step.initMetadata({
        number: caller.company.number,
        extension: caller.extension
      })
      callerSession = await h(t).newWebphoneSession(caller);
    });

    await addOneMissCallLog(t, callerSession, `${callee.company.number}#${callee.extension}`, app);
  }
}

export async function addOneMissCallLogFromAnotherUser(t: TestController, caller: IUser, callee: IUser, app: AppRoot, ) {
  let callerSession: WebphoneSession;

  await h(t).withLog('When I login webphone with {number}#{extension}', async (step) => {
    step.initMetadata({
      number: caller.company.number,
      extension: caller.extension
    })
    callerSession = await h(t).newWebphoneSession(caller);
  });
  await addOneMissCallLog(t, callerSession, `${callee.company.number}#${callee.extension}`, app);
}

// need in call log page.
export async function addOneMissCallLog(t: TestController, callerSession: WebphoneSession, calleeNumber: string, app: AppRoot, ) {
  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  const telephoneDialog = app.homePage.telephonyDialog;

  await h(t).withLog('and caller session makeCall to callee', async () => {
    await callerSession.makeCall(calleeNumber);
  });

  await h(t).withLog('Then the telephone dialog should be popup', async () => {
    await telephoneDialog.ensureLoaded();
  });

  const waitTime = 5e3;
  await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
    step.setMetadata('time', (waitTime / 1000).toString());
    await t.wait(waitTime);
    await callerSession.hangup();
    await callerSession.waitForStatus('terminated');
    await telephoneDialog.ensureDismiss();
    await t.expect(callHistoryPage.items.count).gte(1, { timeout: 20e3 });
  });

  await h(t).withLog('And refresh page', async () => {
    const href = await h(t).href;
    const originUrl = new URL(href).origin;
    const voicemailUrl = originUrl + '/phone/callhistory';
    await t.wait(5e3);
    await t.navigateTo(voicemailUrl);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the call history page has one record', async (step) => {
    await t.expect(callHistoryPage.items.count).gte(1, { timeout: 30e3 });
  });
}


