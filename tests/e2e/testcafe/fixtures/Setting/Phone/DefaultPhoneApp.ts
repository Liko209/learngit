/*
 * @Author:Andy.Hu
 * @Date: 2019-05-28 15:24:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-08-02 15:23:18
 */

import { AppRoot } from '../../../v2/page-models/AppRoot/index';
import { h } from '../../../v2/helpers';
import { IGroup, ITestMeta } from '../../../v2/models';
import { SITE_URL, BrandTire } from '../../../config';
import { teardownCase, setupCase } from '../../../init';
import { WebphoneSession } from 'webphone-client';

fixture('Settings/DefaultPhoneApp')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2054'],
  maintainers: ['Andy.Hu'],
  keywords: ['telephony', 'default Phone app']
})('Check the incoming and outbound calls when the user switch between "Use RingCentral Phone" and "Use RingCentral App".', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];
  const yetAnotherUser = users[3];

  const app = new AppRoot(t);
  const { company: { number } } = anotherUser;

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog('Given I set default phone app to RC phone', async () => {
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.resetProfile(loginUser);
    await h(t).glip(loginUser).setDefaultPhoneApp('ringcentral');
  });

  await h(t).withLog('And I have a 1:1 chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let conversationPage;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter 1:1 chat`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  let callerWebPhone: WebphoneSession;
  // conversation page header

  await h(t).withLog('When I receive a call', async () => {
    callerWebPhone = await h(t).newWebphoneSession(anotherUser);
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then telephony dialog is not displayed', async () => {
    await app.homePage.telephonyDialog.ensureDismiss();
    await callerWebPhone.hangup();
  });

  await h(t).withLog('When I switch default phone app to Jupiter', async () => {
    await h(t).glip(loginUser).setDefaultPhoneApp('glip');
    await t.wait(5e3); // need time to sync to front-end.
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
    await t.wait(2e3);
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
    const callerWebPhone = await h(t).newWebphoneSession(yetAnotherUser);
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('Then telephony dialog is displayed', async () => {
    await app.homePage.telephonyDialog.ensureLoaded();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2049'],
  maintainers: ['William.Ye'],
  keywords: ['GeneralSettings']
})(`Check the display of the Default Phone App`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const defaultAppLabel = 'Default Phone app for calling';
  const defaultAppDescription = "Choose which app you'd like use to make calls";
  const defaultRingCentralApp = 'Use RingCentral App (this app)';
  const defaultRingCentralPhone = 'Use RingCentral Phone';

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Check the 'Default Phone App' section`, async () => {
    await phoneSettingPage.existDefaultAppLabel(defaultAppLabel);
    await phoneSettingPage.existDefaultAppDescription(defaultAppDescription);
  });

  await h(t).withLog(`When I click default app DropDown`, async () => {
    await phoneSettingPage.clickDefaultAppSelectBox();
  });

  await h(t).withLog(`Then I can see the default apps in the list`, async () => {
    await t.expect(phoneSettingPage.ringCentralAppItem.withExactText(defaultRingCentralApp)).ok();
    await t.expect(phoneSettingPage.ringCentralPhoneItem.withExactText(defaultRingCentralPhone)).ok();
  });

});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2051'],
  maintainers: ['William.Ye'],
  keywords: ['GeneralSettings']
})(`Check the confirmation dialog when the user selects "Use RingCentral Phone".`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const changeRCPhoneDialog = settingTab.phoneSettingPage.changeRCPhoneDialog;
  const title = 'Change default phone app';
  const statement = 'You are about to choose RingCentral Phone for your default phone features. Install RingCentral Phone app before continuing. Are you sure you want to change your default to RingCentral Phone?';
  const okButton = 'OK';
  const cancelButton = 'Cancel';
  const defaultRingCentralApp = 'Use RingCentral App (this app)';
  const defaultRingCentralPhone = 'Use RingCentral Phone';


  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });;

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`When I click default app DropDown`, async () => {
    await phoneSettingPage.clickDefaultAppSelectBox();
  });

  await h(t).withLog(`When I click "RingCentral Phone"`, async () => {
    await phoneSettingPage.clickRingCentralPhone();
  });

  await h(t).withLog(`Then a confirmation dialog will show`, async () => {
    await changeRCPhoneDialog.ensureLoaded();
  });

  await h(t).withLog(`And check the content of the confirmation dialog`, async () => {
    await changeRCPhoneDialog.titleShouldBe(title);
    await changeRCPhoneDialog.statementShouldBe(statement);
    await changeRCPhoneDialog.okButtonShouldBeText(okButton);
    await changeRCPhoneDialog.cancelButtonShouldBeText(cancelButton);
  });

  await h(t).withLog(`Click "Cancel" button`, async () => {
    await changeRCPhoneDialog.clickCancelButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await changeRCPhoneDialog.ensureDismiss();
  });

  await h(t).withLog(`And the the default app should keep the same`, async () => {
    await t.expect(phoneSettingPage.defaultAppSelectBox.innerText).contains(defaultRingCentralApp);
  });

  await h(t).withLog(`When I click default app DropDown again`, async () => {
    await phoneSettingPage.clickDefaultAppSelectBox();
  });

  await h(t).withLog(`When I click "RingCentral Phone"`, async () => {
    await phoneSettingPage.clickRingCentralPhone();
  });

  await h(t).withLog(`Then a confirmation dialog will show`, async () => {
    await changeRCPhoneDialog.ensureLoaded();
  });

  await h(t).withLog(`Click "OK" button`, async () => {
    await changeRCPhoneDialog.clickOKButton();
  });

  await h(t).withLog(`Then the dialog is closed`, async () => {
    await changeRCPhoneDialog.ensureDismiss();
  });

  await h(t).withLog(`And the the default app should keep the same`, async () => {
    await t.expect(phoneSettingPage.defaultAppSelectBox.innerText).contains(defaultRingCentralPhone);
  });
});


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2053'],
  maintainers: ['William.Ye'],
  keywords: ['GeneralSettings']
})('Check the settings changes when the user switch between "Use RingCentral Phone" and "Use RingCentral App"', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1]
  const anotherUser = users[2];

  const app = new AppRoot(t);
  const { company: { number } } = anotherUser;
  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfile(loginUser);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I set default phone app to RC phone', async () => {
    await h(t).glip(loginUser).setDefaultPhoneApp('ringcentral');
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Then the caller id section is hidden`, async () => {
    await t.expect(phoneSettingPage.callIdSetting.exists).notOk();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  await h(t).withLog('Then the Missed Calls and New Voicemails is hidden', async () => {
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsItem.exists).notOk();
  });

  await h(t).withLog('When I switch default phone app to Jupiter', async () => {
    await h(t).glip(loginUser).setDefaultPhoneApp('glip');
  });

  await h(t).withLog('Then the Missed Calls and New Voicemails is displayed', async () => {
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsItem.exists).ok();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`Then the caller id section is displayed`, async () => {
    await t.expect(phoneSettingPage.callIdSetting.exists).ok();
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2443'],
  maintainers: ['Mia.Cai'],
  keywords: ['GeneralSettings']
})(`Check if the background menu list will be picked up when the confirmation box pops up`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const phoneSettingPage = settingTab.phoneSettingPage;
  const changeRCPhoneDialog = settingTab.phoneSettingPage.changeRCPhoneDialog;

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click Phone tab`, async () => {
    await settingTab.phoneEntry.enter();
  });

  await h(t).withLog(`When I click default app DropDown`, async () => {
    await phoneSettingPage.clickDefaultAppSelectBox();
  });

  await h(t).withLog(`When I click "RingCentral Phone"`, async () => {
    await phoneSettingPage.clickRingCentralPhone();
    await changeRCPhoneDialog.ensureLoaded();
  });

  await h(t).withLog(`And the background menu list will be picked up`, async () => {
    await t.expect(phoneSettingPage.ringCentralAppItem.exists).notOk();
  });

});
