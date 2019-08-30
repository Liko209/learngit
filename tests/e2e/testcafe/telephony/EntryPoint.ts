/*
 * @Author: Potar.He
 * @Date: 2019-03-14 15:24:53
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-14 15:56:35
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../v2/models";
import { SITE_URL, BrandTire } from '../config';
import { E911Address } from './e911address';

fixture('Telephony/EntryPoint')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.skip.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1354'],
  maintainers: ['Potar.He'],
  keywords: ['telephony', 'entry']
})('User should be able to see the 1:1 Call button in different entry points', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const app = new AppRoot(t);
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  // await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).scenarioHelper.resetProfile(loginUser);
  await h(t).glip(loginUser).setDefaultPhoneApp('glip');
  const anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId: string;
  await h(t).withLog('Given I have a 1:1 chat, another user send a post', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), chat, anotherUser);
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

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then should start call and display call UI', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the hang up button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog dismiss', async () => {
    await t.expect(telephonyDialog.exists).notOk();
  });

  // mini profile
  await h(t).withLog('When I open mini profile of the post sender', async () => {
    await conversationPage.postItemById(postId).clickAvatar();
  });

  const miniProfile = app.homePage.miniProfile;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(miniProfile.telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await miniProfile.clickTelephonyButton();
  });

  await h(t).withLog('Then should start call and display call UI', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the hang up button', async () => {
    await t.wait(2e3); // immediately click hangup button cannot hangup.
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog dismiss', async () => {
    await t.expect(telephonyDialog.exists).notOk();
  });

  // skip this entry due to testcafe cannot simulate force hover state
  await h(t).withLog('When I open profile dialog of the post sender', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And hover the extension area', async () => {
    profileDialog.ensureLoaded()
    await t.hover(profileDialog.extensionArea, {offsetY: 150});
    await t.hover(profileDialog.extensionArea, {speed: 0.1}); // TODO: extensionArea need automation Id
  })

  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(profileDialog.telephonyButton.visible).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await profileDialog.makeCall();
  });

  await h(t).withLog('Then should start call and display call UI', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the hang up button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog dismiss', async () => {
    await t.wait(2e3);
    await t.expect(telephonyDialog.exists).notOk();
  });

  //  search people
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search ${anotherUserName}`, async () => {
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(anotherUserName);
  });

  await h(t).withLog('And hover the people first result', async () => {
    await t.hover(searchDialog.instantPage.nthPeople(0).self);
  })

  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(searchDialog.instantPage.nthPeople(0).telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await searchDialog.instantPage.nthPeople(0).clickTelephonyButton();
  });

  await h(t).withLog('Then should start call and display call UI', async () => {
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog('When I click the hang up button', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then telephony dialog dismiss', async () => {
    await t.expect(telephonyDialog.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1323'],
  maintainers: ['potar.he'],
  keywords: ['search', 'telephony'],
})('Clear recent search history', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];
  await h(t).glip(loginUser).init();
  await h(t).platform(loginUser).init();
  await h(t).platform(loginUser).updateDevices(() => E911Address);
  await h(t).glip(loginUser).resetProfile();
  const beSearchUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', users[2].rcId);

  await h(t).withLog(`Given I login Jupiter with this extension ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  let resultName: string;
  await h(t).withLog(`When I search ${beSearchUserName} and hover the people result and click call icon then close`, async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(beSearchUserName);
    resultName = await searchDialog.instantPage.nthPeople(0).getName();
    await searchDialog.instantPage.nthPeople(0).makeCall();
    await app.homePage.telephonyDialog.ensureLoaded(60e3);
    await app.homePage.telephonyDialog.clickHangupButton();
  });

  await h(t).withLog(`And mouse in the global search box`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
  });

  await h(t).withLog(`Then the recently searched dropdown list displayed and the new contact items are added`, async () => {
    await searchDialog.recentPage.ensureLoaded();
    await t.expect(searchDialog.recentPage.items.count).eql(1);
    await t.expect(searchDialog.recentPage.conversationByName(resultName).exists).ok();
  });

});
