/*
 * @Author: Zack.Zheng
 * @Date: 2019-05-07 11:11:11
 * @Last Modified by: Lex Huang (lex.huang@ringcentral.com)
 * @Last Modified time: 2019-06-28 14:14:07
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { WebphoneSession } from 'webphone-client';

fixture('Telephony/MinimizeCall')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1746', 'JPT-1742'],
  maintainers: ['Zack.Zheng'],
  keywords: ['MinimizedCall']
})('Can end the call in the minimized view', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);

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

  const telephonyDialog = app.homePage.telephonyDialog;
  const minimizeCallWindow = app.homePage.minimizeCallWindow;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('And I click the “minimized”icon', async () => {
    await telephonyDialog.clickMinimizeButton();
  });

  await h(t).withLog(`When I click the mute button in minimized window`, async () => {
    await minimizeCallWindow.clickMuteButton();
  });

  await h(t).withLog(`Then the mute icon change to unmute`, async () => {
    await t.expect(minimizeCallWindow.unMuteButton.exists).ok();
    await t.expect(minimizeCallWindow.muteButton.exists).notOk();
  });

  await h(t).withLog(`When I click the unmute button in minimized window`, async () => {
    await minimizeCallWindow.clickUnMuteButton();
  });

  await h(t).withLog(`Then the unmute icon change to mute`, async () => {
    await t.expect(minimizeCallWindow.unMuteButton.exists).notOk();
    await t.expect(minimizeCallWindow.muteButton.exists).ok();
  });

  await h(t).withLog(`When I click the end button in minimized window`, async () => {
    await minimizeCallWindow.clickHangupButton();
  });

  //Reserve for check end call status from log
  await h(t).withLog(`Then the call should be ended and minimized window should dismissed`, async () => {
    await minimizeCallWindow.ensureDismiss();
    await session.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1751'],
  maintainers: ['Zack.Zheng'],
  keywords: ['MinimizedCall']
})('The content of the “keypad” page is not affected by the minimization function', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);

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

  const telephonyDialog = app.homePage.telephonyDialog;
  const minimizeCallWindow = app.homePage.minimizeCallWindow;
  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });

  await h(t).withLog('And click the keypad button', async () => {
    await telephonyDialog.clickKeypadButton();
  });

  await h(t).withLog('When I click "##" on the keypad ', async () => {
    await telephonyDialog.tapKeypad('##');
  });

  await h(t).withLog('Then I click the “minimized”icon', async () => {
    await telephonyDialog.clickMinimizeButton();
  });

  await h(t).withLog('When I restore the “minimized” window', async () => {
    await minimizeCallWindow.clickSelf();
  });

  await h(t).withLog('Then the keys history should be "##"', async () => {
    await telephonyDialog.keysRecordShouldBe('##')
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1793'],
  maintainers: ['Naya.Fang'],
  keywords: ['MinimizedCall']
})(' Hover the "end" button then show the tooltip', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  const tooltipText = 'End call';
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
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
  await h(t).withLog('When user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation page header
  await h(t).withLog('Then I open the 1:1 chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  const minimizeCallWindow = app.homePage.minimizeCallWindow;
  await h(t).withLog('And I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });
  await h(t).withLog('And I click the “minimized”icon', async () => {
    await telephonyDialog.clickMinimizeButton();
  });
  await h(t).withLog('And I hover the “end” button', async () => {
    await minimizeCallWindow.hoverhandupButton();
  });
  await h(t).withLog('Then show the tooltip', async () => {
    await telephonyDialog.showTooltip(tooltipText);
  });
})

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1792'],
  maintainers: ['Naya.Fang'],
  keywords: ['MinimizedCall']
})('Hover the "mute"/"unmute" button then show the tooltip', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  const tooltipTextmute = 'Mute';
  const tooltipTextunmute = 'Unmute';
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
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
  await h(t).withLog('When user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  // conversation page header
  await h(t).withLog('Then I open the 1:1 chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  const minimizeCallWindow = app.homePage.minimizeCallWindow;
  await h(t).withLog('And I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('And the callee answer the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  });
  await h(t).withLog('And I click the “minimized”icon', async () => {
    await telephonyDialog.clickMinimizeButton();
  });
  await h(t).withLog('And I hover the “mute” button', async () => {
    await minimizeCallWindow.hoverMuteButton();
  });
  await h(t).withLog('Then show the tooltip', async () => {
    await minimizeCallWindow.showTooltip(tooltipTextmute);
  });
  await h(t).withLog('When I click the “mute”button', async () => {
    await minimizeCallWindow.clickMuteButton();
  });
  await h(t).withLog('And I hover the “unmute” button', async () => {
    await minimizeCallWindow.hoverUnMuteButton();
  });
  await h(t).withLog('Then show the tooltip', async () => {
    await minimizeCallWindow.showTooltip(tooltipTextunmute);
  });
});
