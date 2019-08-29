/*
 * @Author: Potar.He 
 * @Date: 2019-08-23 09:57:18 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-08-23 17:20:15
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('TeamSetting/DeleteTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2841', 'JPT-2887'], keywords: ['notification'], maintainers: ['Potar.He']
})('Check the affects when "Mute all notifications everywhere" is on & Check the hover text on"Mute all notifications everywhere" icon', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }

  await h(t).withLog('Given I have one team', async () => {
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with adminUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const notificationPreferencesDialog = app.homePage.notificationPreferencesDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open unopened Team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.clickNotificationPreferences();
  });

  await h(t).withLog(`Then Notification Preferences Dialog should be showed`, async () => {
    await notificationPreferencesDialog.ensureLoaded();
  });

  await h(t).withLog(`When I check "Mute all notifications everywhere" checkbox`, async () => {
    await notificationPreferencesDialog.checkMuteAll();
  });

  await h(t).withLog(`Then The checkbox of the 'Mute all notifications everywhere' is checked.`, async () => {
    await t.expect(notificationPreferencesDialog.muteAllCheckbox.checked).ok();
  });

  await h(t).withLog(`And DesktopNotification options are disabled .`, async () => {
    await notificationPreferencesDialog.expectDesktopNotificationDisabled();
  });

  await h(t).withLog(`And SoundNotification options are disabled .`, async () => {
    await notificationPreferencesDialog.expectSoundNotificationDisabled();
  });

  await h(t).withLog(`And MobileNotification options are disabled .`, async () => {
    await notificationPreferencesDialog.expectMobileNotificationDisabled();
  });

  await h(t).withLog(`And EmailNotification options are disabled .`, async () => {
    await notificationPreferencesDialog.expectEmailNotificationDisabled();
  });

  await h(t).withLog(`When I save and back to conversation header or team profile`, async () => {
    await notificationPreferencesDialog.clickSaveButton();
  });

  await h(t).withLog('Then Show a mute icon on Conversation header', async () => {
    await t.expect(conversationPage.muteButton.exists).ok()
  });

  await h(t).withLog(`When I hover the mute icon`, async () => {
    await t.hover(conversationPage.muteButton, { speed: 0.1 });
  });

  await h(t).withLog('Then Show tooltip ""Notification preferences""', async () => {
    await conversationPage.showTooltip("Notification preferences");
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2864'], keywords: ['notification'], maintainers: ['Potar.He']
})(`Check the "Sound notifications" option will be disabled if 'Enable desktop notifications' is unchecked`, async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }

  await h(t).withLog('Given I have one team', async () => {
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with adminUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const notificationPreferencesDialog = app.homePage.notificationPreferencesDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open unopened Team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.clickNotificationPreferences();
  });

  await h(t).withLog(`Then Notification Preferences Dialog should be showed`, async () => {
    await notificationPreferencesDialog.ensureLoaded();
  });

  await h(t).withLog(`When I uncheck "Mute all notifications everywhere"checkbox`, async () => {
    await notificationPreferencesDialog.uncheckMuteAll();
  });

  await h(t).withLog(`And uncheck 'Enable desktop notifications'`, async () => {
    await notificationPreferencesDialog.uncheckDesktopNotification();
  });

  await h(t).withLog(`And SoundNotification options are disabled .`, async () => {
    await notificationPreferencesDialog.expectSoundNotificationDisabled();
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'], caseIds: ['JPT-2870'], keywords: ['notification'], maintainers: ['Potar.He']
})(`Check the settings of "Notification preferences" can be saved successfully`, async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }

  await h(t).withLog('Given I have one team', async () => {
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with adminUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const notificationPreferencesDialog = app.homePage.notificationPreferencesDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open unopened Team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.clickNotificationPreferences();
  });

  let muteAllStatus, desktopNotificationStatus, soundNotificationStatus, mobileNotificationStatus, emailNotificationStatus;

  await h(t).withLog(`Then Notification Preferences Dialog should be showed`, async () => {
    await notificationPreferencesDialog.ensureLoaded();
  });

  await h(t).withLog('And I record the init config "{muteAllStatus}, {desktopNotificationStatus}, {soundNotificationStatus}, {mobileNotificationStatus}, {emailNotificationStatus}"', async (step) => {
    muteAllStatus = await notificationPreferencesDialog.muteAllCheckbox.checked;
    desktopNotificationStatus = await notificationPreferencesDialog.desktopNotificationCheckbox.checked;
    soundNotificationStatus = await notificationPreferencesDialog.soundNotificationSelectBox.textContent;
    mobileNotificationStatus = await notificationPreferencesDialog.mobileNotificationSelectBox.textContent;
    emailNotificationStatus = await notificationPreferencesDialog.emailNotificationSelectBox.textContent;
    step.initMetadata({ muteAllStatus, desktopNotificationStatus, soundNotificationStatus, mobileNotificationStatus, emailNotificationStatus });

  });

  const clickRandomSelectItem = async () => {
    let count = await notificationPreferencesDialog.selectBoxItems.count;
    let randomInt = Math.round(Math.random() * (count - 1))
    await notificationPreferencesDialog.clickSelectBoxItemByNth(randomInt);
  }

  await h(t).withLog(`When I make some config change`, async () => {
    if (muteAllStatus) {
      await notificationPreferencesDialog.uncheckMuteAll();
    }
    if (!desktopNotificationStatus) {
      await notificationPreferencesDialog.checkDesktopNotification();
    }
    await notificationPreferencesDialog.clickSoundNotificationSelectBox();
    await clickRandomSelectItem();
    await notificationPreferencesDialog.clickMobileNotificationSelectBox();
    await clickRandomSelectItem();
    await notificationPreferencesDialog.clickEmailNotificationSelectBox();
    await clickRandomSelectItem();
  });

  await h(t).withLog(`And I click cancel button`, async () => {
    await notificationPreferencesDialog.clickCancelButton();
  });

  await h(t).withLog(`And I open  Notification Preferences Dialog again`, async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.clickNotificationPreferences();
    await notificationPreferencesDialog.ensureLoaded();
  });

  await h(t).withLog('Then the configs are not changed', async () => {
    await t.expect(notificationPreferencesDialog.muteAllCheckbox.checked).eql(muteAllStatus);
    await t.expect(notificationPreferencesDialog.desktopNotificationCheckbox.checked).eql(desktopNotificationStatus);

    await notificationPreferencesDialog.expectSoundNotificationSelectBoxText(soundNotificationStatus);
    await notificationPreferencesDialog.expectMobileNotificationSelectBoxText(mobileNotificationStatus);
    await notificationPreferencesDialog.expectEmailNotificationSelectBoxText(emailNotificationStatus);
  });

  await h(t).withLog(`When I make some config change`, async () => {
    if (muteAllStatus) {
      await notificationPreferencesDialog.uncheckMuteAll();
    }
    if (!desktopNotificationStatus) {
      await notificationPreferencesDialog.checkDesktopNotification();
    }
    await notificationPreferencesDialog.clickSoundNotificationSelectBox();
    await clickRandomSelectItem();
    await notificationPreferencesDialog.clickMobileNotificationSelectBox();
    await clickRandomSelectItem();
    await notificationPreferencesDialog.clickEmailNotificationSelectBox();
    await clickRandomSelectItem();
  });

  await h(t).withLog('And I record the init config "{muteAllStatus}, {desktopNotificationStatus}, {soundNotificationStatus}, {mobileNotificationStatus}, {emailNotificationStatus}"', async (step) => {
    muteAllStatus = await notificationPreferencesDialog.muteAllCheckbox.checked;
    desktopNotificationStatus = await notificationPreferencesDialog.desktopNotificationCheckbox.checked;
    soundNotificationStatus = await notificationPreferencesDialog.soundNotificationSelectBox.textContent;
    mobileNotificationStatus = await notificationPreferencesDialog.mobileNotificationSelectBox.textContent;
    emailNotificationStatus = await notificationPreferencesDialog.emailNotificationSelectBox.textContent;
    step.updateMetadata({ muteAllStatus, desktopNotificationStatus, soundNotificationStatus, mobileNotificationStatus, emailNotificationStatus });

  });

  await h(t).withLog(`And I click save button`, async () => {
    await notificationPreferencesDialog.clickSaveButton();
  });

  await h(t).withLog(`And I open  Notification Preferences Dialog again`, async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.clickNotificationPreferences();
    await notificationPreferencesDialog.ensureLoaded();
  });

  await h(t).withLog('Then the configs are changed', async () => {
    await t.expect(notificationPreferencesDialog.muteAllCheckbox.checked).eql(muteAllStatus);
    await t.expect(notificationPreferencesDialog.desktopNotificationCheckbox.checked).eql(desktopNotificationStatus);

    await notificationPreferencesDialog.expectSoundNotificationSelectBoxText(soundNotificationStatus);
    await notificationPreferencesDialog.expectMobileNotificationSelectBoxText(mobileNotificationStatus);
    await notificationPreferencesDialog.expectEmailNotificationSelectBoxText(emailNotificationStatus);
  });

});