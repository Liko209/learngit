/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-21 12:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamSetting/AddTeamMembersPermission')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


// TODO: Guest user
test(formalName(`Only admin and member have add members permission when add team member toggle is on`, ['P1', 'JPT-948', 'AddTeamMembersPermission', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(memberUser).init();
  await h(t).glip(memberUser).resetProfileAndState();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init()

  let teamId;
  await h(t).withLog('Given I have team', async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      description: "need description??",
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`And admin set Add team member permission toggle is "on" on team settings page`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.allowAddTeamMember();
    await teamSettingDialog.save();
  })

  await h(t).withLog(`When admin open team profile dialog`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.cancel();
  });


  await h(t).withLog(`When member of the team open team profile dialog`, async () => {
    await h(t).userRole(memberUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  })

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When the member click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.cancel();
  });

  // TODO: Guest User

});

// TODO: Guest user
test(formalName(`Only admin has add member permission when add team members toggle is off`, ['P1', 'JPT-949', 'AddTeamMembersPermission', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(memberUser).init();
  await h(t).glip(memberUser).resetProfileAndState();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init()

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: adminUser,
    members: [adminUser, memberUser],
  }

  await h(t).withLog(`Given I have team named: ${team.name}`, async () => {
   await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with admin ${adminUser.company.number}#${adminUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog(`And admin set Add team member permission toggle is "off" on team settings page`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.notAllowAddTeamMember();
    await teamSettingDialog.updateDescription("test"); // need https://git.ringcentral.com/Fiji/Fiji/merge_requests/1477 to merge
    await teamSettingDialog.save();
  });

  await h(t).withLog(`When admin open team profile dialog`, async () => {
    await t.expect(teamSettingDialog.exists).notOk();
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.cancel();
  });

  await h(t).withLog(`When member of the team open team profile dialog`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  })

  await h(t).withLog(`Then there is not "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
  });

  // TODO: Guest User

});