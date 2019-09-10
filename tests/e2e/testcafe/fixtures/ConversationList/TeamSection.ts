/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 16:11:54
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ConversationList/TeamSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-12'], keywords: ['Team section'],
})('Team section display the conversation which the login user as one of the team member', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const anotherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: `Team ${uuid()}`,
    owner: loginUser,
    members: [loginUser, anotherUser],
  }

  await h(t).withLog('Given I have an extension with certain team', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
    await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can find the team in Teams section', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(team.glipId).ensureLoaded();
  });

  await h(t).withLog('When I close the team', async () => {
    await teamsSection.conversationEntryById(team.glipId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog('Then I can find the team dismiss in Teams section', async () => {
    await teamsSection.conversationEntryById(team.glipId).ensureDismiss();
  });

  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog('When I search {teamName} and click the result', async (step) => {
    step.setMetadata('teamName', team.name)
    await app.homePage.header.searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
    await searchDialog.fullSearchPage.conversationEntryByCid(team.glipId).enter();
  });

  await h(t).withLog('Then I can find the team in Teams section', async () => {
    await teamsSection.conversationEntryById(team.glipId).ensureLoaded();
  });

  await h(t).withLog('When I close the team', async () => {
    await teamsSection.conversationEntryById(team.glipId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog('Then I can find the team dismiss in Teams section', async () => {
    await teamsSection.conversationEntryById(team.glipId).ensureDismiss();
  });

  await h(t).withLog('When I receive a post', async (step) => {
    step.setMetadata('teamName', team.name)
    await h(t).scenarioHelper.sendTextPost(uuid(), team, anotherUser);
  });

  await h(t).withLog('Then I can find the team in Teams section', async () => {
    await teamsSection.conversationEntryById(team.glipId).ensureLoaded();
  });
});

test.meta(<ITestMeta>{
  priority: ['P0'], caseIds: ['JPT-13'], keywords: ['Team section'],
})('Each conversation should be represented by the team name.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const teamName = `Team ${uuid()}`;
  const newName = `New Name ${uuid()}`;

  const team = <IGroup>{
    type: 'Team',
    name: teamName,
    owner: loginUser,
    members: [loginUser, users[5]],
  };

  await h(t).withLog(`Given I have an extension with certain team named {teamName}`, async (step) => {
    step.setMetadata('teamName', teamName)
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can find the team by name in Teams section', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryByName(teamName).ensureLoaded()
  }, true);

  await h(t).withLog('When I modify the team name', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, { set_abbreviation: newName });
  });

  await h(t).withLog('Then I should find the team by new name in Teams section', async () => {
    await teamsSection.conversationEntryByName(newName).ensureLoaded()
  }, true);
});

test.meta(<ITestMeta>{
  priority: ['JPT-47'], caseIds: ['P2'], maintainers: ['Chris.Zhan'], keywords: ['ConversationList']
})('Conversation that received post should be moved to top', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team1 = <IGroup>{
    type: 'Team',
    name: `Team 1 ${uuid()}`,
    owner: loginUser,
    members: [loginUser]
  }
  const team2 = <IGroup>{
    type: 'Team',
    name: `Team 2 ${uuid()}`,
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with two teams', async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
  });

  await h(t).withLog('Send a new post to team1', async () => {
    await h(t).scenarioHelper.sendTextPost('test move team to top', team1, loginUser);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can find team1 on the top of Team section', async () => {
    await teamsSection.expand();
    await teamsSection.nthConversationEntry(0).groupIdShouldBe(team1.glipId);
  }, true);

  await h(t).withLog('When send a new post to team2', async () => {
    await h(t).scenarioHelper.sendTextPost('test move team to top', team2, loginUser);
  });

  await h(t).withLog('Then I can find team2 on the top of Team section', async () => {
    await teamsSection.nthConversationEntry(0).groupIdShouldBe(team2.glipId);
  }, true);
});

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-11'], keywords: ['Team section'],
})('Can expand and collapse the team section by clicking the section name.', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  let teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then Team section should be expanded by default', async () => {
    await t.expect(teamSection.isExpand).ok();
  });

  const teamSectionName = teamSection.header.find('p')
  await h(t).withLog('When I click the team section name', async () => {
    await t.click(teamSectionName);
  });
  await h(t).withLog('Then the team section should be collapsed.', async () => {
    await t.expect(teamSection.isExpand).notOk();
  });

  await h(t).withLog('When I click the team section name again', async () => {
    await t.click(teamSectionName);
  });

  await h(t).withLog('Then the team section should be expanded.', async () => {
    await t.expect(teamSection.isExpand).ok();
  });
}
);