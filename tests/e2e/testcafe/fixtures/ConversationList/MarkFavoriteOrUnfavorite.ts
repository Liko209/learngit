/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-29 13:26:39
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ConversationList/MarkFavoriteOrUnfavorite')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


const FAVORITE_MENU_TEXT = 'Favorite';
const UN_FAVORITE_MENU_TEXT = 'Remove from Favorites';

test.meta(<ITestMeta>{
  priority: ['P1', 'P2'], caseIds: ['JPT-181', 'JPT-183'], keywords: ['ConversationList', 'Favorite'], maintainers: ['potar.he']
})('Display Favorite button when user tap more button of a conversation in DM/Teams & When user mark a conversation as favorite, move the conversation to favorite section.',
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const group = <IGroup>{
      type: 'Group',
      members: [loginUser, users[5], users[6]],
      owner: loginUser,
    }

    const team = <IGroup>{
      type: 'Team',
      members: [loginUser],
      owner: loginUser,
      name: uuid()
    }

    await h(t).withLog('Given I have an extension with a group and a team conversation', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([group, team]);
    });

    await h(t).withLog('And send a message to ensure group in list', async () => {
      await h(t).scenarioHelper.sendTextPost('for appear in section', group, loginUser);
    });

    const app = new AppRoot(t);

    await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;

    await h(t).withLog('and I click more button of group', async () => {
      await directMessagesSection.conversationEntryById(group.glipId).openMoreMenu();
    });

    await h(t).withLog('Then I can find the favorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql(FAVORITE_MENU_TEXT);
    });

    await h(t).withLog('When I click the favorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then the group should be in favorite section but not in direct messages section', async () => {
      await directMessagesSection.conversationEntryById(group.glipId).ensureDismiss();
      await favoritesSection.conversationEntryById(group.glipId).ensureLoaded();
    });

    await h(t).withLog('When I click more button of team', async () => {
      await teamsSection.conversationEntryById(team.glipId).openMoreMenu();
    });

    await h(t).withLog('Then I can find the favorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql(FAVORITE_MENU_TEXT);
    });

    await h(t).withLog('When I click the favorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then the team should be in favorite section but not in team section', async () => {
      await teamsSection.conversationEntryById(team.glipId).ensureDismiss();
      await favoritesSection.conversationEntryById(team.glipId).ensureLoaded();;
    });
  },
);

test.meta(<ITestMeta>{
  priority: ['P1', 'P2'], caseIds: ['JPT-182', 'JPT-184'], keywords: ['ConversationList', 'Favorite'], maintainers: ['Mia.Cai']
})('Display Unfavorite button when user tap more button of a conversation in favorite section. & When user mark a conversation as unfavorite, remove the conversation from favorite section.',
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const group1 = <IGroup>{
      type: 'Group',
      members: [loginUser, users[5], users[6]],
      owner: loginUser,
    }
    const group2 = <IGroup>{
      type: 'DirectMessage',
      members: [loginUser, users[5]],
      owner: loginUser,
    }

    const team1 = <IGroup>{
      type: 'Team',
      members: [loginUser],
      owner: loginUser,
      name: uuid()
    }

    const team2 = <IGroup>{
      type: 'Team',
      members: [loginUser],
      owner: loginUser,
      name: uuid()
    }

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    // let groupId, teamId, groupId1, teamId1;
    await h(t).withLog('Given I have an extension with 2 groups and 2 teams conversation', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([group1, group2, team1, team2]);
    });

    await h(t).withLog('And send a message to ensure group in list', async () => {
      await h(t).scenarioHelper.sendTextPost('for appear in section', group1, loginUser);
      await h(t).scenarioHelper.sendTextPost('for appear in section', group2, loginUser);
    });

    await h(t).withLog('Before login, the conversations should not be hidden and should have been marked as favorite already', async () => {
      await h(t).glip(loginUser).favoriteGroups([group1.glipId, group2.glipId, team1.glipId, team2.glipId]);
    },
    );

    await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    // let groupItem, teamItem;
    await h(t).withLog('Then I click more button of group', async () => {
      await favoritesSection.conversationEntryById(group1.glipId).openMoreMenu();
    });

    await h(t).withLog('I can find the unfavorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql(UN_FAVORITE_MENU_TEXT);
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then I can find the item in direct messages section but not in favorite section', async () => {
      await favoritesSection.conversationEntryById(group1.glipId).ensureDismiss();
      await directMessagesSection.conversationEntryById(group1.glipId).ensureLoaded();
    });

    await h(t).withLog('Then I click more button of team', async () => {
      await favoritesSection.conversationEntryById(team1.glipId).openMoreMenu();
    });

    await h(t).withLog('I can find the unfavorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql(UN_FAVORITE_MENU_TEXT);
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then I can find the item in team section but not in favorite section', async () => {
      await favoritesSection.conversationEntryById(team1.glipId).ensureDismiss();
      await teamsSection.conversationEntryById(team1.glipId).ensureLoaded();
    });

    // JPT-184 page header entry(DM)
    await h(t).withLog('When I open the fav DM conversation', async () => {
      await favoritesSection.conversationEntryById(group2.glipId).enter();
    });

    await h(t).withLog('And I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should remove from Fav section', async () => {
      await favoritesSection.conversationEntryById(group2.glipId).ensureDismiss()
    });

    await h(t).withLog('And the conversation should show in DM section', async () => {
      await directMessagesSection.conversationEntryById(group2.glipId).ensureLoaded();
    });

    await h(t).withLog('When I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should show in fav section', async () => {
      await favoritesSection.conversationEntryById(group2.glipId).ensureLoaded();
    });

    await h(t).withLog('And the conversation should remove from DM section', async () => {
      await directMessagesSection.conversationEntryById(group2.glipId).ensureDismiss();
    });

    // JPT-184 page header entry(Team)
    await h(t).withLog('When I open the fav team conversation ', async () => {
      await favoritesSection.conversationEntryById(team2.glipId).enter();
    });

    await h(t).withLog('And I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should remove from Fav section', async () => {
      await favoritesSection.conversationEntryById(team2.glipId).ensureDismiss()
    });

    await h(t).withLog('And the conversation should show in Team section', async () => {
      await teamsSection.conversationEntryById(team2.glipId).ensureLoaded();
    });

    await h(t).withLog('When I click fav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should show in Fav section', async () => {
      await favoritesSection.conversationEntryById(team2.glipId).ensureLoaded();
    });

    await h(t).withLog('And the conversation should remove from Team section', async () => {
      await teamsSection.conversationEntryById(team2.glipId).ensureDismiss();
    });

  },
);

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-185'], keywords: ['ConversationList', 'Favorite'], maintainers: ['potar.he']
})('When Me conversation is removed favorite mark, it should be displayed in DM section.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  const meChatId = await h(t).glip(loginUser).getMeChatId();

  await h(t).withLog('Given I favorite meChat', async () => {
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
  })

  await h(t).withLog('And send a message to ensure meChat in list', async () => {
    await h(t).platform(loginUser).sendTextPost('for appear in section', meChatId);
  })

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });;

  const favoritesSection = app.homePage.messageTab.favoritesSection;

  await h(t).withLog(`Then I can find Me Conversation in Favorite Section`, async () => {
    await favoritesSection.conversationEntryById(meChatId).ensureLoaded();
  });

  await h(t).withLog('When I click more button of me conversation item', async () => {
    await favoritesSection.conversationEntryById(meChatId).openMoreMenu();
  });

  await h(t).withLog('and I click the unfavorite button', async () => {
    await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
  });

  await h(t).withLog('Then the Me Conversation should be in direct messages section but not in favorite section nor in team section', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(meChatId).ensureLoaded();
    await favoritesSection.conversationEntryById(meChatId).ensureDismiss()
    await app.homePage.messageTab.teamsSection.conversationEntryById(meChatId).ensureDismiss();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-8'], keywords: ['ConversationList', 'Favorite'], maintainers: ['aaron.huo']
})("The list of 'Favorite' section should order by the added time if user doesn't reorder.", async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const teamNames = Array(5).fill(null).map(() => uuid());
  const teams: IGroup[] = teamNames.map(name => ({
    name,
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }));

  await h(t).withLog(`Given I have five teams`, async () => {
    await h(t).scenarioHelper.createTeams(teams);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });;

  const teamsSection = app.homePage.messageTab.teamsSection;
  const moreMenu = app.homePage.messageTab.moreMenu;

  await h(t).withLog('And I enter teamSection favorite these five teams in reverse order', async () => {
    const teamsId = teams.map(({ glipId }) => glipId).reverse();
    await teamsSection.ensureLoaded();

    for (const index in teamsId) {
      await teamsSection.conversationEntryById(teamsId[index]).openMoreMenu();
      await moreMenu.favoriteToggler.enter();
    }
  });

  const favoritesSection = app.homePage.messageTab.favoritesSection;

  await h(t).withLog('Then the favorite list order should be same as the teams', async () => {
    await favoritesSection.ensureLoaded();
    for (const [index, name] of teamNames.entries()) {
      await t.expect(favoritesSection.nthConversationEntry(index).self.withText(name)).ok();
    }
  });
});