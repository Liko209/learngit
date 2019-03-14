/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2018-12-24 15:58:39
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('ConversationList/MarkPrivateOrProtected')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Team admin can change team from public to private.', ['JPT-517', 'P1']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const nonMember = users[6];
  const app = new AppRoot(t);

  const teamsSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let team = <IGroup>{
    type: 'Team', isPublic: true,
    name: uuid(),
    owner: admin,
    members: [admin],
  }

  await h(t).withLog(`Given I have a public team ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const teamChat = teamsSection.conversationEntryByName(team.name);
  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
    await teamsSection.expand();
    await t.expect(teamChat.exists).ok({ timeout: 10e3 });
  });

  await h(t).withLog(`When I click a team conversation profile button`, async () => {
    await teamChat.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then a team conversation profile dialog should be popup`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I click a team conversation profile dialog private icon`, async () => {
    await t.wait(2e3);
    await profileDialog.clickPrivate();
    await t.wait(2e3);
    await profileDialog.close();
    await t.wait(2e3);
  });

  await h(t).withLog('Then I can open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });
  await h(t).withLog('When I click logout button in setting menu', async () => {
    await app.homePage.settingMenu.clickLogout();
  });

  await h(t).withLog(`Given I login Jupiter with nonMember: ${nonMember.company.number}#${nonMember.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, nonMember);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${team.name} in search input area`, async () => {
    await search.typeSearchKeyword(team.name);
  });

  await h(t).withLog(`Then I should not find ${team.name} team.`, async () => {
    await t.expect(search.teams.withText(team.name).exists).notOk({ timeout: 10e3 });
  }, true);

});

test(formalName('Team admin can change team from private to public.', ['JPT-518', 'P1']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const nonMember = users[6];
  const app = new AppRoot(t);

  const teamsSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let team = <IGroup>{
    type: 'Team', isPublic: false,
    name: uuid(),
    owner: admin,
    members: [admin],
  }

  await h(t).withLog(`Given I have a private team ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const teamChat = teamsSection.conversationEntryByName(team.name);
  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
    await teamsSection.expand();
    await t.expect(teamChat.exists).ok({ timeout: 10e3 });
  });

  await h(t).withLog(`When I click a team conversation profile button`, async () => {
    await teamChat.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then a team conversation profile dialog should be popup`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I click a team conversation profile dialog private icon`, async () => {
    await t.wait(2e3);
    await profileDialog.clickPrivate();
    await t.wait(2e3);
    await profileDialog.close();
    await t.wait(2e3);
  });

  await h(t).withLog('Then I can open setting menu in home page', async () => {
    await app.homePage.openSettingMenu();
    await app.homePage.settingMenu.ensureLoaded();
  });
  await h(t).withLog('When I click logout button in setting menu', async () => {
    await app.homePage.settingMenu.clickLogout();
  });

  await h(t).withLog(`Given I login Jupiter with ${nonMember.company.number}#${nonMember.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, nonMember);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${team.name} in search input area`, async () => {
    await search.typeSearchKeyword(team.name);
  });

  await h(t).withLog('Then I should find at least team result', async () => {
    await t.expect(search.teams.count).gte(1);
  }, true);

  await h(t).withLog('Then I should find this team', async () => {
    await search.dropDownListShouldContainTeam(team);
  }, true);
});

test(formalName('Public/Private team icon is disabled for team member.', ['JPT-519', 'P1']), async (t) => {
  const app = new AppRoot(t);

  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const member = users[6];

  let publicTeam = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${H.uuid()} public Team`,
    owner: admin,
    members: [admin, member],
  }
  let privateTeam = <IGroup>{
    type: 'Team', isPublic: false,
    name: `${H.uuid()} private Team`,
    owner: admin,
    members: [admin, member],
  }

  await h(t).withLog(`Given I have a public team and a private team`, async () => {
    await h(t).scenarioHelper.createTeams([publicTeam, privateTeam]);
  });

  await h(t).withLog(`And I login Jupiter with team member: ${member.company.number}#${member.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, member);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open a public team "${publicTeam.name}" conversation and click private button icon in conversation header`, async () => {
    await teamsSection.conversationEntryById(publicTeam.glipId).enter();
    await conversationPage.clickPrivate();
  }, true);

  await h(t).withLog(`then should icon not update`, async () => {
    await t.expect(conversationPage.publicTeamIcon.exists).ok();
    await t.expect(conversationPage.privateTeamIcon.exists).notOk();
  }, true);

   await h(t).withLog(`When I open a private team "${privateTeam.name}" conversation and click private button icon in conversation header`, async () => {
    await teamsSection.conversationEntryById(privateTeam.glipId).enter();
    await conversationPage.clickPrivate();
  }, true);

  await h(t).withLog(`then should icon not update`, async () => {
    await t.expect(conversationPage.privateTeamIcon.exists).ok();
    await t.expect(conversationPage.publicTeamIcon.exists).notOk();;
  }, true);
});


