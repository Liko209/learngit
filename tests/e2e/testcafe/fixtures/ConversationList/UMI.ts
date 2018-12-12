/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-25 13:44:44
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { ClientFunction } from 'testcafe';

fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('UMI should be added received messages count in conversations', ['JPT-107', 'P0', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user)
    const user5Platform = await h(t).getPlatform(users[5]);

    let pvtChat, group, team, groupConversation, teamConversation;
    await h(t).withLog('Given I have an extension with certain conversations', async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId]
      });
      group = await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      team = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('And the conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [pvtChat.data.id, group.data.id, team.data.id]);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('And I click a private chat', async () => {
      await app.homePage.messageTab.directMessagesSection.conversationEntryById(pvtChat.data.id).enter();

    });

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog(`And make preconditions: group ${group.data.id} and team ${team.data.id} both with UMI=1`, async () => {
      await user5Platform.createPost(
        { text: `![:Person](${user.rcId}), ${uuid()}` },
        group.data.id,
      );
      await user5Platform.createPost(
        { text: `![:Person](${user.rcId}), ${uuid()}` },
        team.data.id,
      );
      await t.wait(3e3);
      await directMessagesSection.expand();
      groupConversation = directMessagesSection.conversationEntryById(group.data.id);
      await teamsSection.expand();
      teamConversation = teamsSection.conversationEntryById(team.data.id);
      await t.expect(await groupConversation.getUmi()).eql(1);
      await t.expect(await teamConversation.getUmi()).eql(1);
    });

    await h(t).withLog('When other user send a post with @mention to the group', async () => {
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        group.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`The group should have 2 umi`, async () => {
      await groupConversation.expectUmi(2);
    });

    await h(t).withLog('When other user send a post with @mention to the team', async () => {
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the team should have 2 umi`, async () => {
      await teamConversation.expectUmi(2);
    });

    await h(t).withLog('When other user send a post without @mention to the group', async () => {
      await user5Platform.createPost(
        { text: `${uuid()}` },
        group.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the group should have 3 umi`, async () => {
      await groupConversation.expectUmi(3);
    });

    await h(t).withLog('When other user send a post without @mention to the team', async () => {
      await user5Platform.createPost(
        { text: `${uuid()}` },
        team.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the team should have 2 umi, no change`, async () => {
      await teamConversation.expectUmi(2);
    });
  },
);

test(formalName('Remove UMI when open conversation', ['JPT-103', 'P0', 'ConversationList']),
  async (t: TestController) => {
    if (await H.isEdge()) {
      await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    let pvtChat, team;
    await h(t).withLog('Given I have an extension with a team and a private chat',
      async () => {
        pvtChat = await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        });
        team = await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog('And the conversations should not be hidden before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, pvtChat.data.id);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);
    await h(t).withLog('Have other user send a post with mention to the team before I login', async () => {
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I click private chat to make sure the group is not selected', async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).enter()
    });

    await h(t).withLog('And I can find the UMI on the team', async () => {
      const item = teamsSection.conversationEntryById(team.data.id);
      const umi = item.self.find('.umi');
      const text = item.self.find('p');
      await item.expectUmi(1);
      const umiBgColor = (await umi.style)['background-color'];
      await t.expect(umiBgColor).eql('rgb(255, 136, 0)');
      const textFontWeight = (await text.style)['font-weight'];
      await t.expect(textFontWeight).match(/700|bold/);
    });

    await h(t).withLog('Then I click the team to open the team conversation', async () => {
      await teamsSection.conversationEntryById(team.data.id).enter();
      await t.wait(3e3);
    });

    await h(t).withLog('And I can no longer find the UMI on the team', async () => {
      const item = teamsSection.conversationEntryById(team.data.id);
      const text = item.self.find('p');

      await item.expectUmi(0, 20);
      const textFontWeight = (await text.style)['font-weight'];
      await t.expect(textFontWeight).match(/400|normal/);
    });
  },
);

test(formalName('Current opened conversation should not display UMI', ['JPT-105', 'P1', 'ConversationList']),
  async (t: TestController) => {
    if (await H.isEdge()) {
      await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);

    let pvtChatId, teamId, pvtChat, team;
    await h(t).withLog('Given I have an extension with a team and a private chat',
      async () => {
        pvtChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId = (await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        })).data.id;
      },
    );

    await h(t).withLog('And the conversations should not be hidden and not favorite before login',
      async () => {
        await user.sdk.glip.showGroups(user.rcId, pvtChatId);
        await user.sdk.glip.clearFavoriteGroups();
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can open the private chat', async () => {
      pvtChat = directMessagesSection.conversationEntryById(pvtChatId);
      await pvtChat.enter();
    });

    await h(t).withLog('When I receive a new message from other user in the private chat ', async () => {
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        pvtChatId,
      )
    });

    // FIXME: When run cases concurrently, current browser will be lost focus, and fail.
    await h(t).withLog('Then I should not have UMI in the private chat', async () => {
      await pvtChat.expectUmi(0);
    });

    await h(t).withLog('When I open other conversation and reload web page', async () => {
      await teamsSection.conversationEntryById(teamId).enter();
      await t.wait(3e3);
      await app.reload();
    });

    await h(t).withLog('Then I should not have UMI in the private chat too', async () => {
      await pvtChat.expectUmi(0);
    });
  },
);

test(formalName('Should not display UMI when section is expended & Should display UMI when section is collapsed',
  ['JPT-98', 'JPT-99', 'P2', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection =
      app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;

    let favPrivateChat, favTeam, group1, group2, group3, team1, team2;
    await h(t).withLog('Given I have an extension with a team and a private chat',
      async () => {
        favPrivateChat = await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        });
        favTeam = await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
        group1 = await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        });
        group2 = await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[1].rcId],
        });
        group3 = await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[2].rcId],
        });
        team1 = await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
        team2 = await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog('And the conversations should not be hidden before login', async () => {
      const groups = [
        favPrivateChat.data.id,
        favTeam.data.id,
        group1.data.id,
        group2.data.id,
        group3.data.id,
        team1.data.id,
        team2.data.id
      ]
      await user.sdk.glip.showGroups(user.rcId, groups);
      await user.sdk.glip.favoriteGroups(user.rcId, [+favPrivateChat.data.id, +favTeam.data.id]);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I click group3 to make sure other conversations are not selected',
      async () => {
        await directMessagesSection.conversationEntryById(group3.data.id).enter();
      },
    );

    const user5Platform = await h(t).getPlatform(users[5]);
    await h(t).withLog('When other user send normal posts to all other conversations', async () => {
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        favPrivateChat.data.id,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        favTeam.data.id,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        group1.data.id,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        group2.data.id,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        team1.data.id,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        team2.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should not be any umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(0);
    });

    await h(t).withLog('and there should not be any umi in header of direct message sections', async () => {
      await directMessagesSection.expectHeaderUmi(0);
    });

    await h(t).withLog('and there should not be any umi in header of team sections', async () => {
      await teamsSection.expectHeaderUmi(0);
    });

    await h(t).withLog('When I fold the sections', async () => {
      await favoritesSection.fold();
      await directMessagesSection.fold();
      await teamsSection.fold();
    })

    await h(t).withLog('Then there should be 1 umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(1);
    });

    await h(t).withLog('and there should be 2 umi in header of direct messages sections', async () => {
      await directMessagesSection.expectHeaderUmi(2);
    });

    await h(t).withLog('and there should not be any umi in header of team sections', async () => {
      await teamsSection.expectHeaderUmi(0);
    });

    await h(t).withLog('When other user send posts with mention to specified conversations', async () => {
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        favPrivateChat.data.id,
      );
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        group1.data.id,
      );
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team1.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should be 2 umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(2);
    });

    await h(t).withLog('and there should be 3 umi in header of direct messages sections', async () => {
      await directMessagesSection.expectHeaderUmi(3);

    });

    await h(t).withLog('and there should be 1 umi in header of team sections', async () => {
      const count = await teamsSection.getHeaderUmi();
      await t.expect(count).eql(1);
    });

    await h(t).withLog('When other user send normal posts to specified conversations', async () => {
      await user5Platform.createPost(
        { text: 'test' },
        favPrivateChat.data.id,
      );
      await user5Platform.createPost(
        { text: 'test' },
        favTeam.data.id,
      );
      await user5Platform.createPost(
        { text: 'test' },
        group1.data.id,
      );
      await user5Platform.createPost(
        { text: 'test' },
        team1.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should be 3 umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(3);
    });

    await h(t).withLog('and there should be 4 umi in header of direct messages sections', async () => {
      await directMessagesSection.expectHeaderUmi(4);
    });

    await h(t).withLog('and there should be 1 umi in header of team sections', async () => {
      await teamsSection.expectHeaderUmi(1);
    });
  },
);

test(formalName('UMI should be updated when fav/unfav conversation', ['JPT-123', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    let group1, group2, group3, team1, team2;
    await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
      group1 = await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      group2 = await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[1].rcId],
      });
      group3 = await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[2].rcId],
      });
      team1 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
      team2 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('And the conversations should not be hidden before login', async () => {
      const groups = [
        group1.data.id,
        group2.data.id,
        group3.data.id,
        team1.data.id,
        team2.data.id,
      ]
      await user.sdk.glip.showGroups(user.rcId, groups);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const directMessagesSection =
      app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    await h(t).withLog('Then I click group3 to make sure other conversations are not selected',
      async () => {
        await directMessagesSection.conversationEntryById(group3.data.id).enter();
      },
    );

    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);
    await h(t).withLog('Send posts to conversations', async () => {
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        group1.data.id,
      );
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team1.data.id,
      );
      await t.wait(1e3);
    });

    await h(t).withLog('Fold favorite section', async () => {
      await favoritesSection.fold();
      await t.wait(1e3);
    });

    const favoriteButton = app.homePage.messageTab.moreMenu.favoriteToggler;
    await h(t).withLog('Favorite the two groups with UMI', async () => {
      await directMessagesSection.conversationEntryById(group1.data.id).openMoreMenu();
      await favoriteButton.enter();

      await teamsSection.conversationEntryById(team1.data.id).openMoreMenu();
      await favoriteButton.enter();
    });

    await h(t).withLog('Should have 2 umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(2);
    });

    await h(t).withLog('Fold direct messages and teams section', async () => {
      await directMessagesSection.fold();
      await teamsSection.fold();
      await t.wait(1e3);
    });

    await h(t).withLog('Should not have umi in header of team sections', async () => {
      await teamsSection.expectHeaderUmi(0);
    });

    await h(t).withLog('Should not have umi in header of direct messages sections', async () => {
      await directMessagesSection.expectHeaderUmi(0);
    });

    await h(t).withLog('Expand favorite section', async () => {
      await favoritesSection.expand();
      await t.wait(1e3);
    });

    await h(t).withLog('Remove the two groups with UMI from Favorites', async () => {
      await favoritesSection.conversationEntryById(group1.data.id).openMoreMenu();
      await favoriteButton.enter();

      await favoritesSection.conversationEntryById(team1.data.id).openMoreMenu();
      await favoriteButton.enter();
    });

    await h(t).withLog('Fold favorite section', async () => {
      await favoritesSection.fold();
      await t.wait(1e3);
    });

    await h(t).withLog('Should not have umi in header of favorite sections', async () => {
      await favoritesSection.expectHeaderUmi(0);
    });

    await h(t).withLog('Should have 1 umi in header of direct messages sections', async () => {
      await directMessagesSection.expectHeaderUmi(1);
    });

    await h(t).withLog('Should have 1 umi in header of team sections', async () => {
      await teamsSection.expectHeaderUmi(1);
    });
  },
);

test(formalName('Show UMI when scroll up to old post then receive new messages', ['JPT-189', 'P1', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    if (await H.isEdge()) {
      await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user)
    const user5Platform = await h(t).getPlatform(users[5]);

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let pvtChat;
    await h(t).withLog('Given Open a conversation with post more than one screen', async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId]
      });
      for (var i = 0; i < 10; i++) {
        await user5Platform.createPost(
          { text: 'test' },
          pvtChat.data.id,
        );
      };
      await user.sdk.glip.showGroups(user.rcId, pvtChat.data.id);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
      await directMessagesSection.conversationEntryById(pvtChat.data.id).enter();
    });

    await h(t).withLog('When I scroll up content page and receive new messages', async () => {
      await t.wait(3e3);
      await app.homePage.messageTab.conversationPage.scrollToMiddle();
      await user5Platform.createPost(
        { text: 'test again' },
        pvtChat.data.id,
      );
    });

    await h(t).withLog('Then show UMI', async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).expectUmi(1);
    });

    await h(t).withLog('When I scroll down content page', async () => {
      await app.homePage.messageTab.conversationPage.scrollToBottom();
    });

    await h(t).withLog('Then UMI dismiss', async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).expectUmi(0);
    });
  },
);

test(formalName('Should not show UMI and scroll up automatically when receive post', ['JPT-191', 'P2', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    if (await H.isEdge()) {
      await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user)
    const user5Platform = await h(t).getPlatform(users[5]);

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const postContent = `JPT-191, ${uuid()}`;

    let pvtChat;
    await h(t).withLog('Given have a conversation', async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId]
      });
      await user5Platform.createPost(
        { text: 'test' },
        pvtChat.data.id
      );
      await user.sdk.glip.showGroups(user.rcId, pvtChat.data.id);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
    });

    await h(t).withLog(`Given I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When Open a conversation and receive new messages', async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).enter();
      await user5Platform.createPost(
        { text: postContent },
        pvtChat.data.id,
      );
    });

    await h(t).withLog(`Then should not show UMI and scroll up automatically`, async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).expectUmi(0);
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(posts.nth(-1).withText(postContent).exists).ok();
      await t.expect(posts.nth(-1).withText(postContent).visible).ok();
    });
  },
);

//Need investigate how to unfocus page.
test.skip(formalName('Show UMI when does not focus then receive post', ['JPT-246', 'P2', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user)
    const user5Platform = await h(t).getPlatform(users[5]);

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let pvtChat;
    await h(t).withLog('Given have a conversation', async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId]
      });
      await user5Platform.createPost(
        { text: 'test' },
        pvtChat.data.id
      );
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChat.data.id}`]: false,
      });
    });

    await h(t).withLog(`Given I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Given Open a conversation then does not focus on the page', async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId]
      });

      await directMessagesSection.conversationEntryById(pvtChat.data.id).enter();
      await t.wait(3000);
      const noFocus = ClientFunction(() => window.blur());
      await noFocus();
    });

    await h(t).withLog('When receive messages',
      async () => {
        await user5Platform.createPost(
          { text: 'test' },
          pvtChat.data.id,
        );
      },
    );

    await h(t).withLog(`Then show UMI`, async () => {
      await directMessagesSection.conversationEntryById(pvtChat.data.id).expectUmi(1);
    });
  },
);
