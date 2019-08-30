/*
 * @Author: Potar.He
 * @Date: 2019-04-17 15:12:44
 * @Last Modified by: isaac.liu
 * @Last Modified time: 2019-08-02 17:32:58
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { WebphoneSession } from 'webphone-client';
import { E911Address } from './e911address';

fixture('Telephony/EndCall')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1536'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall']
})('Show prompt pop-up after user logged out the app', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);
  await h(t).glip(loginUser).resetProfileAndState();

  const title = "Log out?";
  const content = "Your call will be disconnected if you log out. Do you want to log out and end the call?";
  const cancelButtonText = "Cancel";
  const logoutButtonText = "Log out";

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let session: WebphoneSession;
  await h(t).withLog('And user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation page header
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('And I click the “sign out ”button in the upper right corner', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
  });

  const logoutDialog = app.homePage.logoutDialog;
  await h(t).withLog('Then Show the prompt pop-up', async () => {
    await logoutDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the title of prompt pop-up should be "${title}"`, async () => {
    await t.expect(logoutDialog.title.textContent).eql(title);
  });

  await h(t).withLog(`And the content should be "${content}"`, async () => {
    await logoutDialog.ConfirmationTextShouldBe(content);
  });

  await h(t).withLog(`And should have "${cancelButtonText}" button`, async () => {
    await logoutDialog.shouldHaveButtonOfText(cancelButtonText);
  });

  await h(t).withLog(`And should have "${logoutButtonText}" button`, async () => {
    await logoutDialog.shouldHaveButtonOfText(logoutButtonText);
  });
});


test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1537', 'JPT-1584'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall']
})('The call should be ended after the user logged out & Should navigate to the login main interface', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  await h(t).glip(loginUser).resetProfileAndState();
  await h(t).platform(loginUser).updateDevices(() => E911Address);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let session: WebphoneSession;
  await h(t).withLog('And another user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.waitForPhoneReady();
  });

  // conversation page header
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And anotherUser answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('And I click the “sign out ”button in the upper right corner', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
  });

  const logoutDialog = app.homePage.logoutDialog;
  await h(t).withLog('Then Show the prompt pop-up', async () => {
    await logoutDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the "Log out" button', async () => {
    await logoutDialog.clickLogoutButton();
  });

  await h(t).withLog('Then web page navigate to the login main interface', async () => {
    await t.expect(h(t).href).contains('unified-login');
  });

  await h(t).withLog('Then the call for the current platform is ended', async () => {
    await session.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1538'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall']
})('The call should be ended after the user logged out', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);


  let session: WebphoneSession;
  await h(t).withLog('Given another user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When anotherUser make call to this loginUser', async () => {
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then loginUser answer the call', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog(`And webphone session status should be 'accepted'`, async () => {
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('When I click the “sign out ”button in the upper right corner', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
  });

  const logoutDialog = app.homePage.logoutDialog;
  await h(t).withLog('Then Show the prompt pop-up', async () => {
    await logoutDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the "Cancel" button', async () => {
    await logoutDialog.clickCancelButton();
  });

  await h(t).withLog('Then logout prompt dismiss', async () => {
    await logoutDialog.ensureDismiss();
  });

  await h(t).withLog('And telephony dialog should be keep', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And webphone session status is keeping "accepted"', async () => {
    await session.waitForStatus('accepted');
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1643'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall']
})('User should can ended call successfully when call is active', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let webphoneSession: WebphoneSession;

  await h(t).withLog(`Given another user login webphone:  ${anotherUser.company.number}#${anotherUser.extension}`, async () => {
    webphoneSession = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I have a 1:1 conversation with antherUser '`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  // Inbound call
  await h(t).withLog('When anotherUser make call to this loginUser', async () => {
    await webphoneSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then loginUser answer the call', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
  });

  await h(t).withLog(`And webphone session status should be 'accepted'`, async () => {
    await webphoneSession.waitForStatus('accepted');
  });

  await h(t).withLog('When I click the hangup button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('And anotherUser webphone session status is "terminated"', async () => {
    await webphoneSession.waitForStatus('terminated');
  });

  // outbound call
  await h(t).withLog('When I enter the conversation withe antherUser', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('And I click telephone call button', async () => {
    await app.homePage.messageTab.conversationPage.clickTelephonyButton();
  });

  await h(t).withLog('And anotherUser answer the call from webphone', async () => {
    await webphoneSession.answer();
  });

  await h(t).withLog(`And webphone session status should be 'accepted'`, async () => {
    await webphoneSession.waitForStatus('accepted');
  });

  await h(t).withLog('When antherUser hangup the call', async () => {
    await webphoneSession.hangup();
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('And anotherUser webphone session status is "terminated"', async () => {
    await webphoneSession.waitForStatus('terminated');
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1642'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall']
})('User should can ended call successfully', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const me = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(me).init();
  await h(t).platform(me).init();
  await h(t).platform(me).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(me);
  await h(t).glip(me).resetProfileAndState();

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: me,
    members: [me, anotherUser]
  }

  let webphoneSession: WebphoneSession;

  await h(t).withLog(`Given there is a user login with webphone:  ${anotherUser.company.number}#${anotherUser.extension}`, async () => {
    webphoneSession = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I have a 1:1 conversation with that user'`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, me);
  });

  await h(t).withLog(`And I login Jupiter with my extension: ${me.company.number}#${me.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When the other user make a phone call to me', async () => {
    await webphoneSession.makeCall(`${me.company.number}#${me.extension}`);
  });

  await h(t).withLog('And I click send to voice mail button', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickSendToVoiceMailButton();
  });

  await h(t).withLog(`Then the status of the other user's webphone should be "accepted"`, async () => {
    await webphoneSession.waitForStatus('accepted');
  });

  await h(t).withLog('And my telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When the other user hangup the call', async () => {
    await webphoneSession.hangup();
  });

  await h(t).withLog(`And its webphone session's status should be "terminated"`, async () => {
    await webphoneSession.waitForStatus('terminated');
  });

  // outbound call
  await h(t).withLog('When I enter the conversation withe antherUser', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('And I click telephone call button', async () => {
    await app.homePage.messageTab.conversationPage.clickTelephonyButton();
  });


  await h(t).withLog(`And anotherUser does not answer the call(session status: invited)`, async () => {
    await webphoneSession.waitForStatus('invited');
  });

  await h(t).withLog('When loginUser click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog should dismiss', async () => {
    await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('And anotherUser webphone session status is "terminated"', async () => {
    await webphoneSession.waitForStatus('terminated');
  });

});
