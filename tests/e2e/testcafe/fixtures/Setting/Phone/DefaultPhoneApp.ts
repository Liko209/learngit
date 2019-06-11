/*
 * @Author:Andy.Hu
 * @Date: 2019-05-28 15:24:53
 * @Last Modified by: Lex Huang (lex.huang@ringcentral.com)
 * @Last Modified time: 2019-06-05 15:22:24
 */

import { AppRoot } from '../../../v2/page-models/AppRoot/index';
import { h } from '../../../v2/helpers';
import { IGroup, ITestMeta } from '../../../v2/models';
import { SITE_URL, BrandTire } from '../../../config';
import { teardownCase, setupCase } from '../../../init';

fixture('Settings/DefaultPhoneApp')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2054'],
  maintainers: ['Andy.Hu'],
  keywords: ['telephony', 'default Phone app']
})('Check the incoming and outbound calls when the user switch between "Use RingCentral Phone" and "Use RingCentral App".', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4]
  const anotherUser = users[5];

  const app = new AppRoot(t);
  const { company: { number } } = anotherUser;
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }
  await h(t).withLog('When I set default phone app to RC phone', async () => {
    await h(t).glip(loginUser).setDefaultPhoneApp('ringcentral');
  });
  await h(t).withLog('Given I have a 1:1 chat, another user send a post', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let conversationPage;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
    await chatEntry.enter();
  });

  const callerWebPhone = await h(t).newWebphoneSession(anotherUser);
  // conversation page header

  await h(t).withLog('When I receive a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then telephony dialog is not displayed', async () => {
    await app.homePage.telephonyDialog.ensureDismiss();
    await callerWebPhone.hangup();
  });

  await h(t).withLog('When I switch default phone app to Jupiter', async () => {
     await h(t).glip(loginUser).setDefaultPhoneApp('glip');
  });

  await h(t).withLog('When I click the call button', async () => {
    conversationPage = app.homePage.messageTab.conversationPage;
    await conversationPage.clickTelephonyButton();
    await app.homePage.telephonyDialog.ensureLoaded();
    await app.homePage.telephonyDialog.clickHangupButton();
  });


  /* from dialer start */
  await h(t).withLog('When I click the to dialpad button', async () => {
    await app.homePage.openDialer();
  });

  await h(t).withLog('Then display the dialer', async () => {
    await app.homePage.telephonyDialog.ensureLoaded();
    await t.expect(app.homePage.telephonyDialog.self.exists).ok();
  });

  await h(t).withLog(`When I type phone number in the input field`, async () => {
    await app.homePage.telephonyDialog.typeTextInDialer(number);
  });

  await h(t).withLog('And I hit the `Enter` key', async () => {
    await app.homePage.telephonyDialog.hitEnterToMakeCall();
  });

  await h(t).withLog('Then a call should be initiated', async () => {
    await t.expect(app.homePage.telephonyDialog.hangupButton.exists).ok();
  });

  await h(t).withLog('When I end the call', async () => {
   await app.homePage.telephonyDialog.clickHangupButton()
  });

  await h(t).withLog(`Then I should be return to the dialer`, async () => {
    await t.expect(app.homePage.telephonyDialog.dialButton.exists).ok();
  });

  /* from dialer stop */
  await h(t).withLog('When I receive a call', async () => {
    const callerWebPhone = await h(t).newWebphoneSession(anotherUser);
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await app.homePage.telephonyDialog.ensureLoaded();
  });
});
