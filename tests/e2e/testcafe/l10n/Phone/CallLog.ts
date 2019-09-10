import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { WebphoneSession } from 'webphone-client';

fixture('Phone/CallLog')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check three kind of call logs', ['P2', 'Phone', 'CallLog', 'V1.6', 'Sean.Zhuang']), async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[5];
    const otherUser = users[6];

    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
    const telephoneDialog = app.homePage.telephonyDialog;
    const deleteAllCallDialog = app.homePage.deleteAllCalllDialog;

    await h(t).withLog('And I click Phone entry of leftPanel and click call history entry', async () => {
      await app.homePage.leftPanel.phoneEntry.enter();
      await app.homePage.phoneTab.callHistoryEntry.enter();
      await callHistoryPage.ensureLoaded();
    });

    await h(t).withLog('And minimize phone dialog',async()=>{
      if (await telephoneDialog.exists) {
        await telephoneDialog.clickMinimizeButton()
      }
    });

    await h(t).withLog('And I clear call history ', async () => {
      if(!await callHistoryPage.emptyPage.exists){
        await callHistoryPage.clickMoreIcon();
        await callHistoryPage.clickDeleteAllCallButton();
        await deleteAllCallDialog.clickDeleteButton();
      }
    });

    let callerSession: WebphoneSession;
    const telephonyDialog = app.homePage.telephonyDialog;

     // Inbound call
    await h(t).withLog(`When another user login webphone:  ${otherUser.company.number}#${otherUser.extension}`, async () => {
      callerSession = await h(t).newWebphoneSession(otherUser);
    });

    await h(t).withLog('And anotherUser make call to this loginUser', async () => {
      await callerSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });

    await h(t).withLog('And loginUser answer the call', async () => {
      await telephonyDialog.ensureLoaded();
      await telephonyDialog.clickAnswerButton();
    });

    await h(t).withLog(`Then webphone session status should be 'accepted'`, async () => {
      await callerSession.waitForStatus('accepted');
    });

    await h(t).withLog('When I click the hangup button', async () => {
      await t.wait(6e4);
      await telephonyDialog.clickHangupButton();
    });

    await h(t).withLog('Then telephony dialog should dismiss', async () => {
      await telephonyDialog.ensureDismiss();
    });

    await h(t).withLog('And anotherUser webphone session status is "terminated"', async () => {
      await callerSession.waitForStatus('terminated');
    });

    // Outbound call
    await h(t).withLog(`When I login webphone with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      callerSession = await h(t).newWebphoneSession(loginUser);
    });

    await h(t).withLog('And caller session makeCall to callee', async () => {
      await callerSession.makeCall(`${otherUser.company.number}#${otherUser.extension}`);
    });

    await h(t).withLog('And caller wait 30s and hangup the call', async () => {
      await t.wait(3e4);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });

    // Missed call
    await h(t).withLog(`When I login webphone with ${otherUser.company.number}#${otherUser.extension}`, async () => {
      callerSession = await h(t).newWebphoneSession(otherUser);
    });

    await h(t).withLog('And caller session makeCall to callee', async () => {
      await callerSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });

    await h(t).withLog('And caller wait 30s seconds and hangup the call', async () => {
      await t.wait(3e4);
      await callerSession.hangup();
      await callerSession.waitForStatus('terminated');
    });

    await h(t).withLog('And refresh the page' ,async()=>{
      await t.wait(5e3);
      await h(t).reload();
      await callHistoryPage.ensureLoaded();
    })

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_CallLogs' });

});
