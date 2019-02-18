/*
 * @Author: Potar.He 
 * @Date: 2019-02-18 17:51:37 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-18 18:03:45
 */

import * as assert from 'assert';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('TeamSetting/DeleteTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Delete team successfully after clicking Delete button.`, ['P1', 'JPT-1109', 'DeleteTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const memberUserName = await h(t).glip(adminUser).getPersonPartialData('display_name', memberUser.rcId);
  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  const roleAdmin = await h(t).userRole(adminUser);

  let teamId;
  await h(t).withLog(`Given I have one new team`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with team member: ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, memberUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open team setting dialog via team profile entry on conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then "Delete team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.leaveTeamButton.visible).ok();
  });

  await h(t).withLog(`When I click "Delete team" button`, async () => {
    await teamSettingDialog.clickLeaveTeamButton();
  });

  await h(t).withLog(`Then the Setting dialog is closed `, async () => {
    await t.expect(teamSettingDialog.exists).notOk();
  });

  const leaveTeamDialog = app.homePage.leaveTeamDialog
  await h(t).withLog(`And the Delete team confirmation is displayed`, async () => {
    await leaveTeamDialog.shouldBePopup();
  });

  await h(t).withLog(`When I click "Cancel" button`, async () => {
    await leaveTeamDialog.cancel();
  });

  await h(t).withLog(`Then the confirmation dismiss`, async () => {
    await t.expect(leaveTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And the team member still in the team`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await t.expect(profileDialog.memberNames.withText(memberUserName).exists).ok();
  });

  await h(t).withLog(`When I open Delete team confirmation again`, async () => {
    await profileDialog.clickSetting();
    await teamSettingDialog.clickLeaveTeamButton();
  })

  await h(t).withLog(`Then the confirmation is displayed and teamSettingDialog is closed`, async () => {
    await t.expect(teamSettingDialog.exists).notOk();
    await leaveTeamDialog.shouldBePopup();
  });

  await h(t).withLog(`When I click "Leave" button`, async () => {
    await leaveTeamDialog.leave();
  });

  await h(t).withLog(`Then the confirmation dismiss`, async () => {
    await t.expect(leaveTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And the team conversation was removed from the conversation list`, async () => {
    await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
  });

  await h(t).withLog(`When I login Jupiter with team admin: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await t.useRole(roleAdmin);
  });

  await h(t).withLog(`And I open profile dialog of the team`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then the team member ${memberUserName} leave the team`, async () => {
    await t.expect(profileDialog.memberNames.withText(memberUserName).exists).notOk();
  });

});

