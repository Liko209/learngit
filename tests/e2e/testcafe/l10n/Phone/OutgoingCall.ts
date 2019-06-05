import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import { WebphoneSession } from '../../v2/webphone/session';

fixture('Phone/OutgoingCall')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Make a call from a conversation', ['P2', 'Phone', 'OutgoingCall', 'V1.4', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a chat between ${loginUser.company.number}#${loginUser.extension} & ${otherUser.company.number}#${otherUser.extension}`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  })

  let session: WebphoneSession;
  await h(t).withLog(`And ${otherUser.company.number}#${otherUser.extension} login webphone`, async () => {
    session = await h(t).newWebphoneSession(otherUser);
  })

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('When I enter the chat', async () => {
    await directMessagesSection.expand();
    await directMessagesSection.conversationEntryById(chat.glipId).enter();
  })

  await h(t).withLog('And click Call button', async() => {
    await app.homePage.messageTab.conversationPage.clickTelephonyButton();
  })

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('Then I can see call dialog', async () => {
    await t.expect(telephonyDialog.title.exists).ok();
  })

  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_Phone_OutgoingCall_01'});

  await h(t).withLog('When I click the record button', async () => {
    await telephonyDialog.clickRecordButton();
  })
  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_Phone_CallRecordFail'});

  await h(t).withLog('When the callee answers the call', async () => {
    await session.answer();
    await session.waitForStatus('accepted');
  })

  await h(t).withLog('And I click Mute, Recording & Hold button', async () => {
    await telephonyDialog.clickMuteButton();
    await telephonyDialog.clickRecordButton();
    await telephonyDialog.clickHoldButton();
  })

  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_Phone_OutgoingCall_02'});

  await h(t).withLog('When I click logout button in the upper right corner', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.clickLogout();
  })

  const logoutDialog = app.homePage.logoutDialog;
  await h(t).withLog('Then I see a prompt popup', async () => {
    await logoutDialog.ensureLoaded();
  })

  await h(t).log('And I capture screenshot', {screenshotPath: 'Jupiter_Phone_logoutDuringACall'});

  await h(t).withLog('When I close the popup and end the call', async () => {
    await logoutDialog.clickCancelButton();
    await session.hangup();
  })

  await h(t).withLog('Then the popup disappears', async () => {
    await logoutDialog.ensureDismiss();
  })

})
