/*
 * @Author: Mia.Cai
 * @Date: 2019-02-13 15:21:28
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Profile/ChangeTeamAdmin')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

const makeTeamAdminText = 'Make team admin';
const revokeTeamAdminText = 'Revoke team admin';

test(formalName('Only admin has the ability to change team admins', ['P1', 'JPT-1092', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  const u3 = users[5];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);

  let teamId;
  await h(t).withLog('Given I have one team and I am admin', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId,u3.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${u1.company.number}#${u1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  // Case1: member 'u2' changed to admin
  await h(t).withLog(`And hover on the member 'u2' row -> "More" menu options `, async () => {
    // todo 
  });

  await h(t).withLog(`Then show "${makeTeamAdminText}" button`, async () => {
    // todo 
  });

  await h(t).withLog(`When hover on the 'u2' row again -> "More" menu options  `, async () => {
    // todo 
  });

  await h(t).withLog(`Then show "${revokeTeamAdminText}" button`, async () => {
    // todo 
  });

  // Case2: admin 'u1' changed to member
  await h(t).withLog(`And hover on the admin 'u1' row -> "More" menu options `, async () => {
    // todo 
  });

  await h(t).withLog(`Then show "${makeTeamAdminText}" button`, async () => {
    // todo 
  });

  await h(t).withLog(`When hover on the 'u1' row again -> "More" menu options  `, async () => {
    // todo 
  });

  await h(t).withLog(`Then show "${revokeTeamAdminText}" button`, async () => {
    // todo 
  });

});

test(formalName('The admin/non-admin roles should sync dynamically when the role changed', ['P1', 'JPT-1104', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  //check the settings when admin changed to member
  await h(t).withLog(`And I login Jupiter with ${u2.company.number}#${u2.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u2);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  //todo use api to change role
  await h(t).withLog(`And make member 'u2' to admin`, async() => {

  });

  await h(t).withLog(`Then will show 'Admin' label in u2 row`, async() => {
    await app.homePage.profileDialog.memberEntryById(u2.rcId).showAdminLabel();
  });

  await h(t).withLog(`When I open the team setting dialog`, async () => {
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then show admin settings`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.teamNameInputArea.exists).ok();
  });

//check the settings when admin changed to member
await h(t).withLog(`And I login Jupiter with ${u1.company.number}#${u1.extension}`, async () => {
  await h(t).directLoginWithUser(SITE_URL, u1);
  await app.homePage.ensureLoaded();
});

await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
  await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
  await app.homePage.messageTab.moreMenu.profile.enter();
});

await h(t).withLog(`When I open the team setting dialog`, async () => {
  await profileDialog.clickSetting();
});

  //todo use api to change role
  await h(t).withLog(`And make admin 'u1' to member`, async() => {

  });

  await h(t).withLog(`Then show admin settings`, async () => {
    await teamSettingDialog.shouldBePopup();
    await t.expect(teamSettingDialog.teamNameInputArea.exists).ok();
 });

 await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
  await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
  await app.homePage.messageTab.moreMenu.profile.enter();
});

 await h(t).withLog(`Then won't show label in member u1 row`, async() => {
  await app.homePage.profileDialog.memberEntryById(u2.rcId).showMemberLabel();
});

});  

test(formalName(`The whole "More" menu will be hidden in non-admin side`, ['P1', 'JPT-1101', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${u1.company.number}#${u1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the admin himself/herself row`, async () => {
    // todo 
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    // todo 
  });

});  

test(formalName(`Can't revoke himself/herself when login user is the only admin in one team`, ['P2', 'JPT-1099', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${u1.company.number}#${u1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the admin himself/herself row`, async () => {
    // todo 
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    // todo 
  });

});  

test(formalName(`The whole "More" menu will be hidden when this admin is the only one member in the team`, ['P2', 'JPT-1096', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${u1.company.number}#${u1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the admin himself/herself row`, async () => {
    // todo 
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    // todo 
  });

});  

test(formalName(`Make all team members as admin of this team when no admin in the team`, ['P2', 'JPT-1103', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  const u3 = users[5];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId,u3.rcId],
    });
  });

await h(t).withLog(`And remove the admin from the team`, async() => {
  await h(t).glip(u1).removeTeamMembers(teamId,[u2.rcId,u3.rcId]);
});

  await h(t).withLog(`And I login Jupiter with ${u2.company.number}#${u2.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u2);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the member 'u2' row -> "More" menu options `, async () => {
    // todo 
  });

  await h(t).withLog(`Then show "${makeTeamAdminText}" button`, async () => {
    // todo 
  });

});  