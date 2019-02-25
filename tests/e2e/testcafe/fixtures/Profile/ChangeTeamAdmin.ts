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
  const u1 = users[4];
  const u2 = users[5];
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const u1Name = await h(t).glip(u1).getPersonPartialData('display_name', u1.rcId);
  const u2Name = await h(t).glip(u1).getPersonPartialData('display_name', u2.rcId);

  let teamId;
  await h(t).withLog('Given I have one team with admin and member', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with admin u1 ${u1.company.number}#${u1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin u1 open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  // Case1: member 'u2' changed to admin
  await h(t).withLog(`And hover on the member 'u2' row `, async () => {
    await t.hover(profileDialog.memberEntryByName(u2Name).self);
  });

  await h(t).withLog('Then show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(u2Name).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(u2Name).moreButton);
  });

  await h(t).withLog(`Then show "${makeTeamAdminText}" button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.makeTeamAdminItem.withExactText(makeTeamAdminText).exists).ok();
  });

  await h(t).withLog(`When click the "${makeTeamAdminText}" button`, async () => {
    await profileDialog.memberMoreMenu.clickMakeTeamAdmin();
  });

  await h(t).withLog(`Then will show 'Admin' label in u2 row`, async () => {
    await app.homePage.profileDialog.memberEntryByName(u2Name).showAdminLabel();
  });

  await h(t).withLog(`When hover on the 'u2' row again`, async () => {
    await t.hover(profileDialog.memberEntryByName(u2Name).self, { speed: 0.1 }); // ensured mouse hovers on it from outside.
  });

  await h(t).withLog('Then Show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(u2Name).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(u2Name).moreButton);
  });

  await h(t).withLog(`Then show "${revokeTeamAdminText}" button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.revokeTeamAdminItem.withExactText(revokeTeamAdminText).exists).ok();
  });

  // Case2: admin 'u1' changed to member
  await h(t).withLog(`When hover on the admin 'u1' row`, async () => {
    // await profileDialog.memberMoreMenu.quit();
    await t.click(profileDialog.profileTitle); // FIXME: press key 'ESC' invalid
    await t.hover(profileDialog.memberEntryByName(u1Name).self);
  });

  await h(t).withLog('Then show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(u1Name).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(u1Name).moreButton);
  });

  await h(t).withLog(`Then show "${revokeTeamAdminText}" button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.revokeTeamAdminItem.withExactText(revokeTeamAdminText).exists).ok();
  });

  await h(t).withLog(`When click the "${revokeTeamAdminText}" button`, async () => {
    await profileDialog.memberMoreMenu.clickRevokeTeamAdmin();
  });

  await h(t).withLog(`Then won't show label in member u1 row`, async () => {
    await profileDialog.memberEntryByName(u1Name).showMemberLabel();
  });

  await h(t).withLog(`When hover on the 'u1' row again`, async () => {
    await t.hover(profileDialog.memberEntryByName(u1Name).self);
  });

  await h(t).withLog(`Then won't "more" button`, async () => {
    await t.expect(profileDialog.memberEntryByName(u1Name).moreButton.exists).notOk();
  }, true);

});

test(formalName('The admin/non-admin roles should sync dynamically when the role changed', ['P1', 'JPT-1104', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[4];
  const u2 = users[5];
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const u1Name = await h(t).glip(u1).getPersonPartialData('display_name', u1.rcId);
  const u2Name = await h(t).glip(u1).getPersonPartialData('display_name', u2.rcId);
  const u1PersonId = await h(t).glip(u1).toPersonId(u1.rcId);
  const u2PersonId = await h(t).glip(u1).toPersonId(u2.rcId);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  const roleUser1 = await h(t).userRole(u1);
  const roleUser2 = await h(t).userRole(u2);

  //check the settings when admin changed to member
  await h(t).withLog(`And I login Jupiter with ${u2.company.number}#${u2.extension}`, async () => {
    await t.useRole(roleUser2);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  let adminIds = [u1PersonId, u2PersonId];
  await h(t).withLog(`And make member 'u2' to admin`, async () => {
    await h(t).glip(u1).updateGroup(teamId, {
      permissions: {
        admin: { uids: adminIds }
      }
    })
  });

  await h(t).withLog(`Then will show 'Admin' label in u2 row`, async () => {
    await app.homePage.profileDialog.memberEntryByName(u2Name).showAdminLabel();
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
    await t.useRole(roleUser1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`When I open the team setting dialog`, async () => {
    await profileDialog.clickSetting();
  });

  adminIds = [u2PersonId];
  await h(t).withLog(`And make login user admin 'u1' to member`, async () => {
    await h(t).glip(u1).updateGroup(teamId, {
      permissions: {
        admin: { uids: adminIds }
      }
    })
  });
  await h(t).withLog(`Then the admin settings dialog will change to non-admin settings dialog`, async () => {
    await t.expect(teamSettingDialog.leaveTeamButton.exists).ok();
  });

  await h(t).withLog(`When click cancel button in the settings profile`, async () => {
    await teamSettingDialog.cancel();
  });

  await h(t).withLog(`And admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then won't show label in member u1 row`, async () => {
    await profileDialog.memberEntryByName(u1Name).showMemberLabel();
  });

});

test(formalName(`The whole "More" menu will be hidden in non-admin side`, ['P1', 'JPT-1101', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[4];
  const u2 = users[5];
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const u1Name = await h(t).glip(u1).getPersonPartialData('display_name', u1.rcId);
  const u2Name = await h(t).glip(u1).getPersonPartialData('display_name', u2.rcId);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with non-admin ${u2.company.number}#${u2.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u2);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the admin himself/herself row`, async () => {
    await t.hover(profileDialog.memberEntryByName(u1Name).self);
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    await t.expect(profileDialog.memberEntryByName(u1Name).moreButton.exists).notOk();
  });

  await h(t).withLog(`And hover on the member himself/herself row`, async () => {
    await t.hover(profileDialog.memberEntryByName(u2Name).self);
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    await t.expect(profileDialog.memberEntryByName(u2Name).moreButton.exists).notOk();
  });

});

test(formalName(`Can't revoke himself/herself when login user is the only admin in one team`, ['P2', 'JPT-1099', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[4];
  const u2 = users[5];
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const u1Name = await h(t).glip(u1).getPersonPartialData('display_name', u1.rcId);

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
    await t.hover(profileDialog.memberEntryByName(u1Name).self);
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    await t.expect(profileDialog.memberEntryByName(u1Name).moreButton.exists).notOk();
  });

});

test(formalName(`The whole "More" menu will be hidden when this admin is the only one member in the team`, ['P2', 'JPT-1096', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[4];
  await h(t).platform(u1).init();
  await h(t).glip(u1).init();
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const u1Name = await h(t).glip(u1).getPersonPartialData('display_name', u1.rcId);

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
    await t.hover(profileDialog.memberEntryByName(u1Name).self);
  });

  await h(t).withLog(`Then the whole "More" menu will be hidden`, async () => {
    await t.expect(profileDialog.memberEntryByName(u1Name).moreButton.exists).notOk();
  });

});

test(formalName(`Make all team members as admin of this team when no admin in the team`, ['P2', 'JPT-1103', 'ChangeTeamAdmin', 'Mia.Cai']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const u1 = users[3];
  const u2 = users[4];
  const u3 = users[5];
  await h(t).glip(u1).init();

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  const u2Name = await h(t).glip(u1).getPersonPartialData('display_name', u2.rcId);
  const u3Name = await h(t).glip(u1).getPersonPartialData('display_name', u3.rcId);

  let teamId;
  await h(t).withLog('Given I have one team', async () => {
    teamId = await h(t).platform(u1).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [u1.rcId, u2.rcId, u3.rcId],
    });
  });

  await h(t).withLog(`And remove the admin from the team`, async () => {
    await h(t).glip(u1).removeTeamMembers(teamId, [u1.rcId]);
  });

  await h(t).withLog(`And I login Jupiter with a member u3 ${u3.company.number}#${u3.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, u3);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`And hover on the member 'u2' row`, async () => {
    await t.hover(profileDialog.memberEntryByName(u2Name).self);
  });

  await h(t).withLog('Then show "more" button', async () => {
    await t.expect(profileDialog.memberEntryByName(u2Name).moreButton.exists).ok();
  }, true);

  await h(t).withLog('When click the more button', async () => {
    await t.click(profileDialog.memberEntryByName(u2Name).moreButton);
  });

  await h(t).withLog(`Then show "${makeTeamAdminText}" button`, async () => {
    await t.expect(profileDialog.memberMoreMenu.makeTeamAdminItem.withExactText(makeTeamAdminText).exists).ok();
  });

  await h(t).withLog(`When click the "${makeTeamAdminText}" button`, async () => {
    await profileDialog.memberMoreMenu.clickMakeTeamAdmin();
  });

  await h(t).withLog(`Then will show 'Admin' label in u2 row`, async () => {
    await profileDialog.memberEntryByName(u2Name).showAdminLabel();
  });

  await h(t).withLog(`And hover on the member 'u3' row`, async () => {
    await t.hover(profileDialog.memberEntryByName(u3Name).self);
  });

  await h(t).withLog(`Then won't show "more" button`, async () => {
    await t.expect(profileDialog.memberEntryByName(u3Name).moreButton.exists).notOk();
  }, true);

});  