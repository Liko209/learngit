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

  let teamId
  await h(t).withLog('Given I have a team.', async () => {
    teamId = (await loginUser.sdk.platform.createGroup({
      privacy: 'protected',
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

  const dialog = app.homePage.messageTab.profileModal;
  await h(t).withLog(`Then a team conversation profile dialog should be popup`, async () => {
    await t.expect(dialog.getSelector('hr').exists).ok();
    await t.expect(dialog.getSelector('div').withText('Profile').exists).ok();
  });

  await h(t).withLog(`When I click a team conversation profile dialog message button`, async () => {
    await t.wait(2e3);
    await dialog.clickPrivacy();
    await t.wait(2e3);
    await dialog.close();
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
    await h(t).refresh();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${teamName} in search input area`, async () => {
    await search.typeText(teamName);
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
      privacy: 'private',
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

  const dialog = app.homePage.messageTab.profileModal;
  await h(t).withLog(`Then a team conversation profile dialog should be popup`, async () => {
    await t.expect(dialog.getSelector('hr').exists).ok();
    await t.expect(dialog.getSelector('div').withText('Profile').exists).ok();
  });

  await h(t).withLog(`When I click a team conversation profile dialog message button`, async () => {
    await t.wait(2e3);
    await dialog.clickPrivacy();
    await t.wait(2e3);
    await dialog.close();
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
    await h(t).refresh();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${teamName} in search input area`, async () => {
    await search.typeText(teamName);
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
  loginUser.sdk = await h(t).getSdk(loginUser);
  adminUser.sdk = await h(t).getSdk(adminUser);
  const app = new AppRoot(t);
  const teamName = uuid();
  const privateTeamName = uuid();
  const otherUserName = await loginUser.sdk.glip.getPerson(users[5].rcId)
    .then(res => {
      return res.data.display_name;
    });

  const conversationSection = app.homePage.messageTab.conversationPage;
  const steps = async (i: number, count: number, searchItem, type: string) => {
    const id = await searchItem.getId();
    const icon = ['lock_open', 'lock']
    await h(t).withLog(`When I click the avatar of ${i + 1}/${count}  ${type} result`, async () => {
      await searchItem.clickAvatar();
    });
    await h(t).withLog(`And the mini profile id should be ${id}`, async () => {
      const miniProfileId = await miniProfile.getId();
      await t.expect(miniProfileId).eql(id);
    });
    await h(t).withLog(`when i click private button icon in mini profile`, async () => {
      await miniProfile.clickPrivate();
    });

    await h(t).withLog(`Then should icon not update`, async () => {
      await t.expect(miniProfile.privateButton.find('.material-icons').withText(icon[i]).exists).ok();
      await miniProfile.goToMessages();
    });

    await h(t).withLog(`when i click private button icon in conversation header`, async () => {
      await conversationSection.clickPrivate();
    }, true);

    await h(t).withLog(`then should icon not update`, async () => {
      await t.expect(conversationSection.privateButton.find('.material-icons').withText(icon[i]).exists).ok();
    }, true);

  }

  let teamId, privateTeamId;
  await h(t).withLog(`Given I have a team, a group, a privateChat that all include user: ${otherUserName}`, async () => {
    teamId = (await adminUser.sdk.platform.createGroup({
      privacy: 'protected',
      isPublic: true,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    })).data.id;
    privateTeamId = (await adminUser.sdk.platform.createGroup({
      privacy: 'private',
      isPublic: true,
      name: privateTeamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    })).data.id;
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const nameGroup = [teamName, privateTeamName];
  const idGroup = [teamId, privateTeamId];
  const miniProfile = app.homePage.miniProfile;
  for (let i = 0; i < idGroup.length; i++) {
    const search = app.homePage.header.search;
    await h(t).withLog(`When I type people keyword ${teamName} in search input area`, async () => {
      await search.typeText(nameGroup[i], {replace: true});
    });

    let teamCount
    await h(t).withLog('Then I should find at least team result', async () => {
      await t.expect(search.teams.count).gte(1);
      teamCount = await search.teams.count;
    }, true);

    for (let i = 0; i < teamCount; i++) {
      await steps(i, teamCount, search.nthTeam(i), "Team")
    }
  }

});


