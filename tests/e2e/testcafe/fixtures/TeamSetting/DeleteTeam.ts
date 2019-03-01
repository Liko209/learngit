/*
 * @Author: Potar.He 
 * @Date: 2019-02-18 17:51:37 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-20 11:14:11
 */

import * as assert from 'assert';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamSetting/DeleteTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Delete team successfully after clicking Delete button.`, ['P1', 'JPT-1109', 'DeleteTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const alertText = "Team deleted successfully.";
  const unopenedTeamName = uuid();

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let unopenedTeamId, openedTeamId;
  await h(t).withLog(`Given I have one new team`, async () => {
    unopenedTeamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: unopenedTeamName,
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });

    openedTeamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with adminUser: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
    await teamSection.conversationEntryById(openedTeamId).enter();
  });

  await h(t).withLog(`When I open unopened Team setting dialog via team profile entry on conversation list`, async () => {
    await teamSection.conversationEntryById(unopenedTeamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then "Delete team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.deleteTeamButton.visible).ok();
  });

  await h(t).withLog(`When I click "Delete team" button`, async () => {
    await teamSettingDialog.clickDeleteTeamButton();
  });

  const deleteTeamDialog = app.homePage.deleteTeamDialog;
  await h(t).withLog(`And the Delete team confirmation is displayed`, async () => {
    await deleteTeamDialog.shouldBePopup();
    await deleteTeamDialog.teamNameInConfirmationShouldBe(unopenedTeamName);
  });

  await h(t).withLog(`When I click "Cancel" button`, async () => {
    await deleteTeamDialog.clickCancel();
  });

  await h(t).withLog(`Then the confirmation dismiss`, async () => {
    await t.expect(deleteTeamDialog.exists).notOk();
  });

  await h(t).withLog(`Then the Settings dialog should remain on the screen`, async () => {
    await t.expect(teamSettingDialog.exists).ok();
  });

  await h(t).withLog(`And the team still in the team list`, async () => {
    await t.expect(teamSection.conversationEntryById(unopenedTeamId).exists).ok();
  });

  await h(t).withLog(`When I open Delete team confirmation again`, async () => {
    await teamSettingDialog.clickDeleteTeamButton();
  });

  await h(t).withLog(`Then the confirmation is displayed`, async () => {
    await deleteTeamDialog.shouldBePopup();
  });

  await h(t).withLog(`When I click "Delete Team" button`, async () => {
    await deleteTeamDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the confirmation dismiss`, async () => {
    await t.expect(deleteTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
    await app.homePage.messageTab.conversationPage.groupIdShouldBe(openedTeamId);
  });

  await h(t).withLog(`And the team conversation was removed from the conversation list`, async () => {
    await t.expect(teamSection.conversationEntryById(unopenedTeamId).exists).notOk();
  });

  await h(t).withLog(`When I delete opened Team`, async () => {
    await teamSection.conversationEntryById(openedTeamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.clickDeleteTeamButton();
    await deleteTeamDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the detele Team confirmation dismiss`, async () => {
    await t.expect(deleteTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And there should be success flash toast (short = 2s) displayed "${alertText}"`, async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog(`And send to the empty conversation screen`, async () => {
    await t.expect(h(t).href).match(/messages\/$/);
  });

  await h(t).withLog(`And the team conversation was removed from the conversation list`, async () => {
    await t.expect(teamSection.conversationEntryById(openedTeamId).exists).notOk();
  });
});

test(formalName(`The team can't be displayed on conversation list and search results list after the team is deleted.`, ['P2', 'JPT-1116', 'DeleteTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: adminUser,
    members: [adminUser, memberUser],
  }

  await h(t).withLog(`Given I have one new team ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const profileDialog = app.homePage.profileDialog;
  const deleteTeamDialog = app.homePage.deleteTeamDialog;

  await h(t).withLog(`And I login Jupiter with adminUser: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open Team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then "Delete team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.deleteTeamButton.visible).ok();
  });

  await h(t).withLog(`When I delete the team via 'Delete team' entry`, async () => {
    await teamSettingDialog.clickDeleteTeamButton();
    await deleteTeamDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the team conversation was removed from the conversation list`, async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  const searchBar = app.homePage.header.search;
  await h(t).withLog(`When search with keyword "${team.name}"`, async () => {
    await searchBar.typeSearchKeyword(team.name);
  });

  await h(t).withLog(`Then I can't find the team in search results list`, async () => {
    await t.expect(searchBar.teams.withText(team.name).exists).notOk()
  }, true);

  await h(t).withLog(`When I login Jupiter with team member: ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await searchBar.quit();
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
  });

  await h(t).withLog(`Then can't find the team in conversation list`, async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog(`When search with keyword "${team.name}"`, async () => {
    await searchBar.typeSearchKeyword(team.name);
  });

  await h(t).withLog(`Then I can't find the team in search results list`, async () => {
    await t.expect(searchBar.teams.withText(team.name).exists).notOk()
  }, true);
});


test(formalName(`Can create team that team name is same as the deleted team`, ['P2', 'JPT-1121', 'DeleteTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const teamName = uuid();

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const deleteTeamDialog = app.homePage.deleteTeamDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;

  let teamId;
  await h(t).withLog(`Given I have one new team`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: teamName,
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with adminUser: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open Team setting dialog via team profile entry on conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then "Delete team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.deleteTeamButton.visible).ok();
  });

  await h(t).withLog(`When I delete the team via 'Delete team' entry`, async () => {
    await teamSettingDialog.clickDeleteTeamButton();
    await deleteTeamDialog.clickDeleteButton();
  });

  await h(t).withLog(`Then the team conversation was removed from the conversation list`, async () => {
    await t.expect(teamSection.conversationEntryById(teamId).exists).notOk();
  });

  await h(t).withLog(`When I create a team with the same name via "new actions" entry`, async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await app.homePage.createTeamModal.typeTeamName(teamName);
    await app.homePage.createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`Then Create successfully`, async () => {
    await t.expect(teamSection.conversationEntryByName(teamName).exists).ok();
  });
});

test.skip(formalName(`Should display tooltip when click "i" icon beside the "Delete team" button`, ['P2', 'JPT-1114', 'DeleteTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const tooltipText = "Delete a team permanently."

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I have one new team`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [adminUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with adminUser: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open Team setting dialog via team profile entry on conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then "Archive team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.deleteTeamButton.visible).ok();
  });

  await h(t).withLog(`When I click "i" icon beside the 'Delete team' button`, async () => {
    await t.click(teamSettingDialog.deleteTeamButtonInfoIcon);
  });

  await h(t).withLog(`Then there should be tooltip displayed '${tooltipText}`, async () => {
    await teamSettingDialog.showTooltip(tooltipText);
  });
});