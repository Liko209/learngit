/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-21 12:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta, IUser } from '../../v2/models';

fixture('TeamSetting/AddTeamMembersPermission')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-948'],
  priority: ['P1'],
  maintainers: ['Potar.He'],
  keywords: ['AddTeamMembersPermission']
})(`Only admin and member have add members permission when add team member toggle is on`, async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  const guest = h(t).rcData.guestCompany.users[0];
  await h(t).glip(memberUser).init();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init()

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: adminUser,
    members: [adminUser, memberUser, guest]
  }

  await h(t).withLog('Given I have a team with guest', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with adminUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`And admin set Add team member permission toggle is "on" on team settings page`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.allowAddTeamMember();
    await teamSettingDialog.save();
  })

  await h(t).withLog(`When admin open team profile dialog`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await profileDialog.ensureLoaded();
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.clickCancelButton();
  });


  await h(t).withLog(`When member of the team open team profile dialog {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: memberUser.company.number,
      extension: memberUser.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When the member click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.clickCancelButton();
  });

  await h(t).withLog(`When member (guest role) of the team open team profile dialog {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: guest.company.number,
      extension: guest.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, guest);
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is not "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-949'],
  priority: ['P1'],
  maintainers: ['Potar.He'],
  keywords: ['AddTeamMembersPermission']
})(`Only admin has add member permission when add team members toggle is off`, async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  const guestUser = h(t).rcData.guestCompany.users[0];
  await h(t).glip(memberUser).init();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init()

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: adminUser,
    members: [adminUser, memberUser, guestUser],
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
  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog(`And admin set Add team member permission toggle is "off" on team settings page`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.notAllowAddTeamMember();
    await teamSettingDialog.updateDescription("test"); // need https://git.ringcentral.com/Fiji/Fiji/merge_requests/1477 to merge
    await teamSettingDialog.save();
  });

  await h(t).withLog(`When admin open team profile dialog`, async () => {
    await t.expect(teamSettingDialog.exists).notOk();
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" icon`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then the add team member dialog should be popup`, async () => {
    await t.expect(addTeamMemberDialog.exists).ok();
    await addTeamMemberDialog.clickCancelButton();
  });

  await h(t).withLog(`When I logout and login  with member ${memberUser.company.number}#${memberUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
  })

  await h(t).withLog(`And open team profile dialog`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is no "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
    await app.homePage.profileDialog.clickCloseButton();
  });

  await h(t).withLog(`When I logout and login  with guest ${guestUser.company.number}#${guestUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, guestUser);
  })

  await h(t).withLog(`And open team profile dialog`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is no "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-951'],
  priority: ['P1'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['AddTeamMembersPermission']
})(`The value of add team members toggle can sync`, async t => {
  const app = new AppRoot(t);
  const memberUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];
  const guestUser = h(t).rcData.guestCompany.users[0];
  guestUser['type'] = 'guest';
  memberUser['type'] = 'member';
  adminUser['type'] = 'admin';
  await h(t).glip(memberUser).init();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const conversationPage = app.homePage.messageTab.conversationPage;

  const checkAddMember = async (user: IUser, isAddMembmerEnabled: boolean) => {
    await h(t).withLog(`When I logout and login  with ${user['type']} ${user.company.number}#${user.extension}`, async () => {
      await app.homePage.logoutThenLoginWithUser(SITE_URL, user);
    })

    await h(t).withLog(`And open team profile dialog`, async () => {
      await teamEntry.enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    })

    if (isAddMembmerEnabled) {
      await h(t).withLog(`Then there is "add team members" icon`, async () => {
        await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
      });
    } else {
      await h(t).withLog(`Then there is no "add team members" icon`, async () => {
        await t.expect(app.homePage.profileDialog.addMembersIcon.exists).notOk();
      });
    }
    await app.homePage.profileDialog.clickCloseButton();
  }

  const allowAddTeamMember = async (isAddTeamMemberEnabled: boolean) => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    if (isAddTeamMemberEnabled) {
      await teamSettingDialog.allowAddTeamMember();
    } else {
      await teamSettingDialog.notAllowAddTeamMember();
    }
    await teamSettingDialog.save();
  }

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: adminUser,
    members: [adminUser, memberUser, guestUser],
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
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog(`And admin set Add team member permission toggle is "off" on team settings page`, async () => {
    await allowAddTeamMember(false);
  });

  await h(t).withLog(`And open team profile dialog`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });


  await h(t).withLog(`Final close profileDialog`, async () => {
    await app.homePage.profileDialog.clickCloseButton();
  });

  await checkAddMember(memberUser, false);
  await checkAddMember(guestUser, false);

  await h(t).withLog(`When I logout and login  with admin ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  })

  await h(t).withLog(`And admin set Add team member permission toggle is "on" on team settings page`, async () => {
    await allowAddTeamMember(true);
  });

  await h(t).withLog(`And open team profile dialog`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  })

  await h(t).withLog(`Then there is "add team members" icon`, async () => {
    await t.expect(app.homePage.profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`Final close profileDialog`, async () => {
    await app.homePage.profileDialog.clickCloseButton();
  });

  await checkAddMember(memberUser, true);
  await checkAddMember(guestUser, false);
});
