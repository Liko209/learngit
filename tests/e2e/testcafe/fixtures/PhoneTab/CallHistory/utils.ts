/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-26 09:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import { IUser } from "../../../v2/models";
import { h } from "../../../v2/helpers";
import { WebphoneSession } from 'webphone-client';

export async function ensuredOneCallLog(t: TestController, caller: IUser, callee: IUser, app) {
  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  const telephoneDialog = app.homePage.telephonyDialog;

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

    await h(t).withLog('and caller session makeCall to callee', async () => {
      await callerSession.makeCall(`${callee.company.number}#${callee.extension}`);
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
    });

    await h(t).withLog('Then the call history page has one record', async (step) => {
      await t.expect(callHistoryPage.items.count).eql(1, { timeout: 60e3 });
    });
  }
}

export async function addOneCallLogFromGuest(t: TestController, caller: IUser, callee: IUser, app) {
  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
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

    const waitTime = 5e3;
    await h(t).withLog('and caller wait {time} seconds and hangup the call', async (step) => {
      step.setMetadata('time', (waitTime / 1000).toString());
      await t.wait(waitTime);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
      await t.expect(callHistoryPage.items.count).gte(1, { timeout: 10e3 });
    });

    await h(t).withLog('And refresh page', async () => {
      await t.wait(5e3);
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });
  }


