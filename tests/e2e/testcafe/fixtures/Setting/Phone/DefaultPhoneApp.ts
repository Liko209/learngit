/*
 * @Author:Andy.Hu
 * @Date: 2019-05-28 15:24:53 
 * @Last Modified by: Andy.Hu
 * @Last Modified time: 2019-05-28 15:56:35
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
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);
  const callerWebPhone = await h(t).newWebphoneSession(anotherUser);
  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }


  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I switch default phone app to Jupiter', async () => {
     await h(t).glip(loginUser).setDefaultPhoneApp('glip');
  });
 
  await h(t).withLog('Given I have a 1:1 chat, another user send a post', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  // conversation page header
  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('When I open the 1:1 chat', async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  // await h(t).withLog('Then the call button should display', async () => {
  //   await t.expect(conversationPage.telephonyButton).ok();
  // });

  // await h(t).withLog('When I click the call button', async () => {
  //   await conversationPage.clickTelephonyButton();
  // });

  let telephonyDialog = app.homePage.telephonyDialog;
  // await h(t).withLog('Then should start call and display call UI', async () => {
  //   await telephonyDialog.ensureLoaded();
  // });

  // await h(t).withLog('When I click the hang up button', async () => {
  //   await telephonyDialog.clickHangupButton();
  // });

  // await h(t).withLog('Then telephony dialog dismiss', async () => {
  //   await t.expect(telephonyDialog.exists).notOk();
  // });

  await h(t).withLog('When I receive a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

   telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When callerUser hangup the call', async () => {
     await callerWebPhone.hangup();
  });

  await h(t).withLog('When I switch to RC Phone', async () => {
     await h(t).glip(loginUser).setDefaultPhoneApp('ringcentral');
  });

  await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
   });
  
  await h(t).withLog('Then telephony dialog is not displayed', async () => {
      await telephonyDialog.ensureDismiss();
  });

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
  });

  telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then call UI should not displayed', async () => {
    await telephonyDialog.ensureDismiss();
  });

   await h(t).withLog('When I call this extension', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then telephony dialog is not displayed', async () => {
    await telephonyDialog.ensureDismiss();
  });
});
