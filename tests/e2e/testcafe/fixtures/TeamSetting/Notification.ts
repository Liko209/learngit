/*
 * @Author: Potar.He 
 * @Date: 2019-08-23 09:57:18 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-08-23 16:47:59
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
  priority: ['P2'], caseIds: ['JPT-2841'], keywords: ['notification'], maintainers: ['Potar.He']
})('Check the affects when "Mute all notifications everywhere" is on', async t => {
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

  await h(t).withLog(`When I click "Click the checkbox of the 'Mute all notifications everywhere'" checkbox`, async () => {
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
    await t.expect(conversationPage.mutedIcon.exists).ok()
  });

});

