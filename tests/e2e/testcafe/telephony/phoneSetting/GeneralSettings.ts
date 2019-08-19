import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from "../../v2/models";
import { WebphoneSession } from 'webphone-client';
import * as assert from 'assert';

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RC_WITH_DID))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1934'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings', 'Telephony']
})(`Should show the extension number when caller enables the "Display my extension number for internal calls"`, async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const anotherUser = h(t).rcData.mainCompany.users[5];

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I have a extension {number}#{extension} and reset its profile', async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
  });

  let anotherUserName = '';
  await h(t).withLog('And I get the display name {name} of anotherUser ', async (step) => {
    anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
    step.setMetadata('name', anotherUserName)
  });

  await h(t).withLog('And I have a 1:1 chat with anotherUser', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let otherUserPostId;
  await h(t).withLog('And anotherUser send a mention loginUser post', async () => {
    otherUserPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`Other post ${uuid()}`, chat, anotherUser);
  });

  let session: WebphoneSession;
  await h(t).withLog('And another user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const messagesEntry = app.homePage.leftPanel.messagesEntry;
  const settingTab = app.homePage.settingTab;
  const phoneTab = settingTab.phoneSettingPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  const miniProfile = app.homePage.miniProfile;
  const profileDialog = app.homePage.profileDialog;

  // Entry1: 1:1conversation
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click the caller id`, async () => {
    await phoneTab.clickCallerIDDropDown();
  });

  let callerIDList = [];
  await h(t).withLog('And I get the caller id list from the setting', async () => {
    callerIDList = await phoneTab.getCallerIDList();
  });

  let randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });

  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I open the 1:1 chat in the messages tab', async () => {
    await messagesEntry.enter();
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {extension} from anotherUser`, async (step) => {
    step.setMetadata('extension', loginUser.extension)
    await session.waitForPhoneNumber(loginUser.extension);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry2: mini profile
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('And I click the at-mention on the post', async () => {
    await messagesEntry.enter();
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
  });

  await h(t).withLog('Then show mini profile', async () => {
    await miniProfile.shouldBePopUp();
  });

  await h(t).withLog('When I click call button on the mini profile', async () => {
    await miniProfile.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {extension} from anotherUser`, async (step) => {
    step.setMetadata('extension', loginUser.extension)
    await session.waitForPhoneNumber(loginUser.extension);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry3: profile
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('And I click the avatar on the post', async () => {
    await messagesEntry.enter();
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
    await miniProfile.ensureLoaded();
  });

  await h(t).withLog('And I click the Profile button on mini profile', async () => {
    await miniProfile.openProfile();
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('And I click call button on the profile', async () => {
    await profileDialog.makeCall();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {extension} from anotherUser`, async (step) => {
    step.setMetadata('extension', loginUser.extension)
    await session.waitForPhoneNumber(loginUser.extension);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry4: search result
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  const anotherUserRecord = searchDialog.instantPage.searchPeopleWithText(anotherUserName);
  await h(t).withLog(`And I search the person {anotherUserName}`, async (step) => {
    step.setMetadata('anotherUserName', anotherUserName);
    await messagesEntry.enter();
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(anotherUserName);
    await t.expect(anotherUserRecord.exists).ok();
  });

  await h(t).withLog('And I hover on the record', async () => {
    await t.hover(anotherUserRecord.self);
  });

  await h(t).withLog('And I click call button on the record', async () => {
    await anotherUserRecord.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {extension} from anotherUser`, async (step) => {
    step.setMetadata('extension', loginUser.extension)
    await session.waitForPhoneNumber(loginUser.extension);
  });
});

fixture('Phone/GeneralSettings')
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1759'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings', 'Telephony']
})(`Check if the caller id is implemented correctly`, async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const anotherUser = h(t).rcData.guestCompany.users[0];

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }


  const extractNumber = (callerId: string): string => {
    if (callerId == 'Blocked') {
      return 'anonymous';
    }
    return callerId.replace(/[^\d]/g, '');
  }

  const checkCallerId = async (randomCallerID: any, session: WebphoneSession) => {
    const formalNumber = extractNumber(randomCallerID);
    await session.waitForStatus('invited');
    await H.retryUntilPass(async () => {
      const reg = new RegExp(`${formalNumber}$`);
      const lastIncomingCallNumber = await session.lastIncomingCallNumber;
      const isMatch = reg.test(lastIncomingCallNumber);
      assert.ok(isMatch, `${formalNumber} != "${lastIncomingCallNumber}" (webphone)`);
    });
  }


  await h(t).withLog('Given I have a extension {number}#{extension} and reset its profile', async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
  });

  let anotherUserName = '';
  await h(t).withLog('And I get the display name {name} of anotherUser ', async (step) => {
    anotherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
    step.setMetadata('name', anotherUserName)
  });

  await h(t).withLog('And I have a 1:1 chat with anotherUser', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let otherUserPostId;
  await h(t).withLog('And anotherUser send a mention loginUser post', async () => {
    otherUserPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`Other post ${uuid()}`, chat, anotherUser);
  });

  let session: WebphoneSession;
  await h(t).withLog('And another user login webphone', async () => {
    session = await h(t).newWebphoneSession(anotherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const messagesEntry = app.homePage.leftPanel.messagesEntry;
  const settingTab = app.homePage.settingTab;
  const phoneTab = settingTab.phoneSettingPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  const miniProfile = app.homePage.miniProfile;
  const profileDialog = app.homePage.profileDialog;

  // Entry1: 1:1conversation
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`And I click the caller id tab`, async () => {
    await phoneTab.clickCallerIDDropDown();
  });

  let callerIDList = [];
  await h(t).withLog('And I get the caller id list from the setting', async () => {
    callerIDList = await phoneTab.getCallerIDList();
  });

  let randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.selectCallerID(randomCallerID);
  });

  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I open the 1:1 chat in the messages tab', async () => {
    await messagesEntry.enter();
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then the call button should display', async () => {
    await t.expect(conversationPage.telephonyButton).ok();
  });

  await h(t).withLog('When I click the call button', async () => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {randomCallerID} check by anotherUser webphone session`, async (step) => {
    step.setMetadata('randomCallerID', randomCallerID)
    await checkCallerId(randomCallerID, session);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry2: mini profile
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('And I click the at-mention on the post', async () => {
    await messagesEntry.enter();
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
  });

  await h(t).withLog('Then show mini profile', async () => {
    await miniProfile.shouldBePopUp();
  });

  await h(t).withLog('When I click call button on the mini profile', async () => {
    await miniProfile.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {randomCallerID} check by anotherUser webphone session`, async (step) => {
    step.setMetadata('randomCallerID', randomCallerID)
    await checkCallerId(randomCallerID, session);
  });;

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry3: profile
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  await h(t).withLog('And I click the avatar on the post', async () => {
    await messagesEntry.enter();
    const postItem = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
    await postItem.clickAvatar();
    await miniProfile.ensureLoaded();
  });

  await h(t).withLog('And I click the Profile button on mini profile', async () => {
    await miniProfile.openProfile();
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('When I click call button on the profile', async () => {
    await profileDialog.makeCall();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {randomCallerID} check by anotherUser webphone session`, async (step) => {
    step.setMetadata('randomCallerID', randomCallerID)
    await checkCallerId(randomCallerID, session);
  });

  await h(t).withLog('Given I click hangup button', async () => {
    await telephonyDialog.clickHangupButton();
    await telephonyDialog.ensureDismiss();
  });

  // Entry4: search result
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  randomCallerID = _.sample(callerIDList);
  await h(t).withLog(`And I change the caller id from the setting`, async () => {
    await phoneTab.clickCallerIDDropDown();
    await phoneTab.selectCallerID(randomCallerID);
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  const anotherUserRecord = searchDialog.instantPage.searchPeopleWithText(anotherUserName);
  await h(t).withLog(`And I search the person {anotherUserName}`, async (step) => {
    step.setMetadata('anotherUserName', anotherUserName);
    await messagesEntry.enter();
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(anotherUserName);
    await t.expect(anotherUserRecord.exists).ok();
  });

  await h(t).withLog('And I hover on the record', async () => {
    await t.hover(anotherUserRecord.self);
  });

  await h(t).withLog('And I click call button on the record', async () => {
    await anotherUserRecord.clickTelephonyButton();
    await telephonyDialog.ensureLoaded();
  });

  await h(t).withLog(`Then the caller id is {randomCallerID} check by anotherUser webphone session`, async (step) => {
    step.setMetadata('randomCallerID', randomCallerID)
    await checkCallerId(randomCallerID, session);
  });
});

