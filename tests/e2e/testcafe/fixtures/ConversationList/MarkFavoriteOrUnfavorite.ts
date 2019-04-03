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
import { IGroup } from '../../v2/models';

fixture('ConversationList/MarkFavoriteOrUnfavorite')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Display Favorite button when user tap more button of a conversation in DM/Teams & When user mark a conversation as favorite, move the conversation to favorite section.',
  ['P1', 'P2', 'JPT-181', 'JPT-183', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;

    let groupId, teamId;
    await h(t).withLog('Given I have an extension with a group and a team conversation', async () => {
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: uuid(),
        members: [loginUser.rcId, users[5].rcId],
      });
     });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    let groupItem, teamItem;
    await h(t).withLog('and I click more button of group', async () => {
      groupItem = app.homePage.messageTab.directMessagesSection.conversationEntryById(groupId);
      await groupItem.openMoreMenu();
    });

    await h(t).withLog('Then I can find the favorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql('Favorite');
    });

    await h(t).withLog('When I click the favorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then the group should be in favorite section but not in direct messages section', async () => {
      await t.expect(groupItem.exists).notOk();
      groupItem = favoritesSection.conversationEntryById(groupId);
      await t.expect(groupItem.exists).ok();
    });

    await h(t).withLog('When I click more button of team', async () => {
      teamItem = app.homePage.messageTab.teamsSection.conversationEntryById(teamId);
      await teamItem.openMoreMenu();
    });

    await h(t).withLog('Then I can find the favorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql('Favorite');
    });

    await h(t).withLog('When I click the favorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then the team should be in favorite section but not in team section', async () => {
      await t.expect(teamItem.exists).notOk();
      teamItem = favoritesSection.conversationEntryById(teamId);
      await t.expect(teamItem.exists).ok();
    });
  },
);

test(formalName('Display Unfavorite button when user tap more button of a conversation in favorite section. & When user mark a conversation as unfavorite, remove the conversation from favorite section.',
  ['P1', 'P2', 'JPT-182', 'JPT-184', 'ConversationList','Mia.Cai']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection= app.homePage.messageTab.teamsSection;

    let groupId, teamId, groupId1, teamId1;
    await h(t).withLog('Given I have an extension with 2 groups and 2 teams conversation', async () => {
      groupId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: uuid(),
        members: [loginUser.rcId, users[5].rcId],
      });
      groupId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[3].rcId, users[6].rcId],
      });
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: uuid(),
        members: [loginUser.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
        await h(t).glip(loginUser).favoriteGroups([+groupId, +teamId, +groupId1, +teamId1]);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    let groupItem, teamItem;
    await h(t).withLog('Then I click more button of group', async () => {
      groupItem = favoritesSection.conversationEntryById(groupId);
      await groupItem.openMoreMenu();
    });

    await h(t).withLog('I can find the unfavorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql('Remove from Favorites');
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then I can find the item in direct messages section but not in favorite section', async () => {
      await t.expect(groupItem.exists).notOk();
      groupItem = app.homePage.messageTab.directMessagesSection.conversationEntryById(groupId);
      await t.expect(groupItem.exists).ok();
    });

    await h(t).withLog('Then I click more button of team', async () => {
      teamItem = favoritesSection.conversationEntryById(teamId);
      await teamItem.openMoreMenu();
    });

    await h(t).withLog('I can find the unfavorite button', async () => {
      await t.expect(favoriteToggler.textContent).eql('Remove from Favorites');
    });

    await h(t).withLog('Then I click the unfavorite button', async () => {
      await favoriteToggler.enter();
      await t.wait(1e3);
    });

    await h(t).withLog('Then I can find the item in team section but not in favorite section', async () => {
      await t.expect(teamItem.exists).notOk();
      teamItem = app.homePage.messageTab.teamsSection.conversationEntryById(teamId);
      await t.expect(teamItem.exists).ok();
    });

    // JPT-184 page header entry(DM)
    await h(t).withLog('When I open the fav DM conversation', async () => {
      await favoritesSection.conversationEntryById(groupId1).enter();
    });

    await h(t).withLog('And I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should remove from Fav section', async () => {
      await t.expect(favoritesSection.conversationEntryById(groupId1).exists).notOk();
    });

    await h(t).withLog('And the conversation should show in DM section', async () => {
      await t.expect(directMessagesSection.conversationEntryById(groupId1).exists).ok();
    });

    await h(t).withLog('When I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should show in fav section', async () => {
      await t.expect(favoritesSection.conversationEntryById(groupId1).exists).ok();
    });

    await h(t).withLog('And the conversation should remove from DM section', async () => {
      await t.expect(directMessagesSection.conversationEntryById(groupId1).exists).notOk()
    });

    // JPT-184 page header entry(Team)
    await h(t).withLog('When I open the fav team conversation ', async () => {
      await favoritesSection.conversationEntryById(teamId1).enter();
    });

    await h(t).withLog('And I click unfav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should remove from Fav section', async () => {
      await t.expect(favoritesSection.conversationEntryById(teamId1).exists).notOk();
    });

    await h(t).withLog('And the conversation should show in Team section', async () => {
      await t.expect(teamsSection.conversationEntryById(teamId1).exists).ok();
    });

    await h(t).withLog('When I click fav icon in the conversation page header', async () => {
      await conversationPage.clickFavoriteButton();
    });

    await h(t).withLog('Then the conversation should show in Fav section', async () => {
      await t.expect(favoritesSection.conversationEntryById(teamId1).exists).ok();
    });

    await h(t).withLog('And the conversation should remove from Team section', async () => {
      await t.expect(teamsSection.conversationEntryById(teamId1).exists).notOk();
    });

  },
);

test(formalName('When Me conversation is removed favorite mark, it should be displayed in DM section.',
  ['P2', 'JPT-185', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    let meChatId;
    await h(t).withLog('Given I have an extension with a me conversation', async () => {
      meChatId = await h(t).glip(loginUser).getPerson().then(res => res.data.me_group_id);
    });

    await h(t).withLog('Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
         await h(t).glip(loginUser).favoriteGroups([+meChatId]);
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    let meChat;
    await h(t).withLog(`Then I can find Me Conversation in Favorite Section`, async () => {
      meChat = app.homePage.messageTab.favoritesSection.conversationEntryById(meChatId);
      await t.expect(meChat.exists).ok();
    });

    await h(t).withLog('When I click more button of me conversation item', async () => {
      await meChat.openMoreMenu();
    });

    await h(t).withLog('and I click the unfavorite button', async () => {
      await app.homePage.messageTab.moreMenu.favoriteToggler.enter();
    });

    await h(t).withLog('Then the Me Conversation should be in direct messages section but not in favorite section nor in team section',
      async () => {
        await t.expect(app.homePage.messageTab.directMessagesSection.conversationEntryById(meChatId).exists).ok();
        await t.expect(app.homePage.messageTab.favoritesSection.conversationEntryById(meChatId).exists).notOk();
        await t.expect(app.homePage.messageTab.teamsSection.conversationEntryById(meChatId).exists).notOk();
      },
    );
  },
);

test(formalName("The list of 'Favorite' section should order by the added time if user doesn't reorder.", ['MarkFavoriteOrUnfavorite', 'Aaron', 'P2', 'JPT-8']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const teamNames = Array(5).fill(null).map(() => uuid());
  const teams: IGroup[] = teamNames.map(name => ({
    name,
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  }));

  await h(t).withLog(`Given I have five teams named: ${teamNames.join()}`, async () => {
    await h(t).scenarioHelper.createTeams(teams);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

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
  await favoritesSection.ensureLoaded();

  await h(t).withLog('Then the favorite list order should be same as the teams', async () => {
    for (const [index, name] of teamNames.entries()) {
      await t.expect(favoritesSection.nthConversationEntry(index).self.withText(name)).ok();
    }
  });
});
