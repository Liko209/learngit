/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-22 15:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as assert from 'assert';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamSetting/LeaveTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Leave team successful after clicking Leave button.`, ['P1', 'JPT-935', 'LeaveTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(adminUser).init();
  const memberGlipId = await h(t).glip(adminUser).toPersonId(memberUser.rcId);
  const memberUserName = await h(t).glip(adminUser).getPersonPartialData('display_name', memberUser.rcId);

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [adminUser, memberUser],
    owner: adminUser
  };

  await h(t).withLog(`Given I have one team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`And I login Jupiter with team member: ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, memberUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then "Leave Team" button should be showed`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.leaveTeamButton.visible).ok();
  });

  await h(t).withLog(`When I click "Leave team" button`, async () => {
    await teamSettingDialog.clickLeaveTeamButton();
  });

  await h(t).withLog(`Then the Setting dialog is closed `, async () => {
    await t.expect(teamSettingDialog.exists).notOk();
  });

  const leaveTeamDialog = app.homePage.leaveTeamDialog
  await h(t).withLog(`And the Leave Team confirmation is displayed`, async () => {
    await leaveTeamDialog.shouldBePopup();
  });

  await h(t).withLog(`When I click "Cancel" button`, async () => {
    await leaveTeamDialog.cancel();
  });

  await h(t).withLog(`Then the confirmation dismiss`, async () => {
    await t.expect(leaveTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And the team member still in the team`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await t.expect(profileDialog.memberNames.withText(memberUserName).exists).ok();
  });

  await h(t).withLog(`When I open Leave Team confirmation again`, async () => {
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
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog(`And admin check the left member not exist in team member list via API `, async () => {
    await H.retryUntilPass(async () => {
      const members = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data.members);
      assert.ok(!_.includes(members, memberGlipId), `Have not removed ${memberUserName} from api`);
    })
  });
});


test(formalName(`The team information is updated when the member is left`, ['P1', 'JPT-938', 'LeaveTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const loginUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

;

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [adminUser, loginUser],
    owner: adminUser
  };

  await h(t).withLog(`Given I have one team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });


  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const profileDialog = app.homePage.profileDialog

  await h(t).withLog(`And I login Jupiter with team member: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  const teamSettingDialog = app.homePage.teamSettingDialog;
  const leaveTeamDialog = app.homePage.leaveTeamDialog

  await h(t).withLog(`When I open Leave Team confirmation and click "Leave" button`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.clickLeaveTeamButton();
    await leaveTeamDialog.leave()
  });

  await h(t).withLog(`Then the confirmation dismiss and the team should not exist in team section list`, async () => {
    await t.expect(leaveTeamDialog.exists).notOk();
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog(`Then the loginUser should not be in the member list (check via API)`, async () => {
    const personId = await h(t).glip(adminUser).toPersonId(loginUser.rcId);
    await H.retryUntilPass(async () => {
      const members = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data['members']);
      assert.ok(!_.includes(members, personId), `Login User should no be in team members list`);
    });
  });

  await h(t).withLog(`When team member send a message on the team`, async () => {
    await h(t).platform(adminUser).sendTextPost("leave team should not receive", team.glipId);
  });

  await h(t).withLog(`Then loginUser cannot receive the message(the team should not exist in team section list)`, async () => {
    await t.expect(teamEntry.exists).notOk();
  });
});

test(formalName(`Only team members are allowed to leave team`, ['P2', 'JPT-932', 'LeaveTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [adminUser, memberUser],
    owner: adminUser
  };

  await h(t).withLog(`Given I have one team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`And I login Jupiter with team admin: ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When team admin open team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then team admin can't see the 'Leave Team' option`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.leaveTeamButton.visible).notOk();
    await teamSettingDialog.cancel();
  });

  await h(t).withLog(`And I login Jupiter with team member: ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
  });

  await h(t).withLog(`When team member open team setting dialog via team profile entry on conversation list`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then team admin can see the 'Leave Team' option`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.leaveTeamButton.visible).ok();
  });

});

test(formalName(`User should not be allowed to leave the all hands team`, ['P1', 'JPT-1021', 'LeaveTeam', 'Chris.Zhan']), async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(memberUser).init();
  await h(t).platform(otherUser).init();
  await h(t).glip(memberUser).init();

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I have one all hands team`, async () => {
    const ids = await h(t).glip(memberUser).getCompanyTeamId();
    teamId = ids[0];
  });

  await h(t).withLog(`And I login Jupiter with team member: ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, memberUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When all hands team receive new message and appear on the left rail`, async () => {
    await h(t).platform(otherUser).sendTextPost('test', teamId);
  })

  await h(t).withLog(`When team member open team setting dialog via team profile entry on conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  const teamSettingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then team member can't see the 'Leave Team' option`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.leaveTeamButton.visible).notOk();
  });
});

