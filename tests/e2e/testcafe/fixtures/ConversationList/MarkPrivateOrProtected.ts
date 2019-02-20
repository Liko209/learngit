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

fixture('ConversationList/MarkPrivateOrProtected')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Team admin can change team from public to private.', ['JPT-517', 'P1']), async (t) => {
 const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const app = new AppRoot(t);
  const teamName = uuid();

  const teamsSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId
  await h(t).withLog('Given I have a team.', async () => {
    teamId = (await loginUser.sdk.platform.createGroup({
      isPublic: true,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    })).data.id;
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamChat = teamsSection.conversationEntryById(teamId);
  await h(t).withLog('Then I can find the 1 conversations in conversation list', async () => {
    await teamsSection.expand();
    await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
  }, true);


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

  await h(t).withLog(`Given I login Jupiter with ${users[6].company.number}#${users[6].extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, users[6]);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${teamName} in search input area`, async () => {
    await search.typeSearchKeyword(teamName);
  });

  await h(t).withLog(`Then I should not find ${teamName} team.`, async () => {
    const teamCount = await search.teams.count;
    let hasSearch = false;
    if(teamCount) {
      for (let i = 0; i < teamCount; i++) {
        const searchId = await search.nthTeam(i).getId();
        if (searchId === teamId) {
          hasSearch = true;
        }
      }
    }
    await t.expect(hasSearch).eql(false);
  }, true);

});

test(formalName('Team admin can change team from private to public.', ['JPT-518', 'P1']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const app = new AppRoot(t);
  const teamName = uuid();

  const teamsSection = app.homePage.messageTab.teamsSection;

  let teamId
  await h(t).withLog('Given I have a team.', async () => {
    teamId = (await loginUser.sdk.platform.createGroup({
      isPublic: false,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    })).data.id;
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamChat = teamsSection.conversationEntryById(teamId);
  await h(t).withLog('Then I can find the 1 conversations in conversation list', async () => {
    await teamsSection.expand();
    await t.expect(teamChat.exists).ok(teamId, { timeout: 10e3 });
  }, true);


  await h(t).withLog(`When I click a team conversation profile button`, async () => {
    await teamChat.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  const profileDialog = app.homePage.profileDialog;
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

  await h(t).withLog(`Given I login Jupiter with ${users[6].company.number}#${users[6].extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, users[6]);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${teamName} in search input area`, async () => {
    await search.typeSearchKeyword(teamName);
  });

  let teamCount
  await h(t).withLog('Then I should find at least team result', async () => {
    await t.expect(search.teams.count).gte(1);
    teamCount = await search.teams.count;
  }, true);

  await h(t).withLog('Then I should not find this team', async () => {
    let hasSearch = false;

    if(teamCount) {
      for (let i = 0; i < teamCount; i++) {
        const searchId = await search.nthTeam(i).getId();
        if (searchId === teamId) {
          hasSearch = true;
        }
      }
    }
    await t.expect(hasSearch).eql(true);
  }, true);

});

test(formalName('Public/Private team icon is disabled for team member.', ['JPT-519', 'P1']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const adminUser = users[5];
  const app = new AppRoot(t);
  const teamName = uuid();
  const privateTeamName = uuid();
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).platform(adminUser).init();

  const otherUserName = await h(t).glip(loginUser).getPerson(users[5].rcId).then(res => res.data.display_name);

  const conversationSection = app.homePage.messageTab.conversationPage;

  let teamId, privateTeamId;
  await h(t).withLog(`Given I have a team, a group, a privateChat that all include user: ${otherUserName}`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      privacy: 'protected',
      isPublic: true,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    privateTeamId = await h(t).platform(adminUser).createAndGetGroupId({
      privacy: 'private',
      isPublic: false,
      name: privateTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const nameGroup = [teamName, privateTeamName];
  const idGroup = [teamId, privateTeamId];
  const teamsSection = app.homePage.messageTab.teamsSection;
  for (let i = 0; i < idGroup.length; i++) {
    const icon = ['lock_open', 'lock']
    await h(t).withLog(`When I open a ${nameGroup[i]} conversation and click private button icon in conversation header`, async () => {
      await teamsSection.conversationEntryById(idGroup[i]).enter();
      await conversationSection.clickPrivate();
    }, true);

    await h(t).withLog(`then should icon not update`, async () => {
      await t.expect(conversationSection.privateButton.find('.material-icons').withText(icon[i]).exists).ok();
    }, true);

  }

});


