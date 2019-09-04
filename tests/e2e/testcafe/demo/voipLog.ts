/*
 * @Author: Potar.He
 * @Date: 2019-04-17 15:12:44
 * @Last Modified by: isaac.liu
 * @Last Modified time: 2019-08-02 17:32:58
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { WebphoneSession } from 'webphone-client';

fixture('Telephony/Answer')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-0'],
  maintainers: ['Potar.He'],
  keywords: ['voip']
})('just demo for check voip', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const callee = users[1]
  const caller = users[2];

  const app = new AppRoot(t);
  await h(t).glip(callee).init();

  let calleeSession: WebphoneSession, callerSession: WebphoneSession;

  await h(t).withLog(`Given I login Jupiter with callee {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: callee.company.number,
      extension: callee.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, callee);
    await app.homePage.ensureLoaded();
    await app.waitForPhoneReady();
  });

  await h(t).withLog('And the callee login webphone', async () => {
    calleeSession = await h(t).newWebphoneSession(callee);
  });

  await h(t).withLog('And the callee login webphone', async () => {
    callerSession = await h(t).newWebphoneSession(caller);
  });

  await h(t).withLog('When caller make call to callee', async () => {
    await callerSession.makeCall(callee.extension);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then the callee on jupiter receive a incoming call', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee on webphone also receive a incoming call', async () => {
    await calleeSession.waitForStatus('invited')
  });


  await h(t).withLog('When callee on jupiter click "answer" button', async () => {
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog('And callee on jupiter click "hangup" button', async () => {
    await t.wait(1e3)
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then voip log show: ƒanswer and hangup is called', async () => {
    const reg = new RegExp(`.*the.*of VoIP is called`)
    let temps = await t.getBrowserConsoleMessages()
    const logs = temps.info
    let matchLogs = logs.filter(item => { return reg.test(item) });
    console.log(matchLogs)
    await h(t).browserConsoleHelper.voipActionShouldBeCalled('answer');
    await h(t).browserConsoleHelper.voipActionsInOrder(['answer', 'hangup'])
  });

});

