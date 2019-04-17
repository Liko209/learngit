/*
 * @Author: Potar.He 
 * @Date: 2019-04-17 15:12:44 
 * @Last Modified by:   Potar.He 
 * @Last Modified time: 2019-04-17 15:12:44 
 */

import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';

fixture('Telephony/EndCall')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-1536'],
  maintainers: ['Potar.He'],
  keywords: ['EndCall', 'UI']
})('Show prompt pop-up after user logged out the app', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4]
  const anotherUser = users[5];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);

  const title = "Log out?";
  const content = "Your call will be disconnected if you log out . Do you want to log out and end the call?";
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

  const session = await h(t).webphone(anotherUser);
  await h(t).withLog('And anotherUser answer the call', async () => {
    await session.preOperate("answerCall", true);
  });

  await h(t).withLog('And I click the “sign out ”button in the upper right corner', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
  });

  const logoutDialog = app.homePage.logoutDialog;
  await h(t).withLog('Then Show the prompt pop-up', async () => {
    await logoutDialog.ensureLoaded();
  });

  await h(t).withLog('Then the content of prompt pop-up should be correct', async () => {
    await t.expect(logoutDialog.title.textContent).eql(title);
    await logoutDialog.ConfirmationTextShouldBe(content);
    await logoutDialog.shouldHaveButtonOfText(cancelButtonText);
    await logoutDialog.shouldHaveButtonOfText(logoutButtonText);
  });

  await h(t).withLog('ending webPhone client', async () => {
    await session.close();
  })
});