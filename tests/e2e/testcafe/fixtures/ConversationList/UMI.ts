/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-25 13:44:44
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('UMI should be added received messages count in conversations', ['JPT-107', 'P0', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChat.data.id}`]: false,
        [`hide_group_${group.data.id}`]: false,
        [`hide_group_${team.data.id}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      const unreadGroupIds = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(
        user.rcId,
      );
      await user.sdk.glip.markAsRead(user.rcId, unreadGroupIds);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('And I click a private chat', async () => {
      await app.homePage.messagePanel.directMessagesSection.conversationByIdEntry(pvtChat.data.id).enter();

    });

    const directMessagesSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
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
      groupConversation = directMessagesSection.conversationByIdEntry(group.data.id);
      await teamsSection.expand();
      teamConversation = teamsSection.conversationByIdEntry(team.data.id);
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
      await t.expect(await groupConversation.getUmi()).eql(2);
    });

    await h(t).withLog('When other user send a post with @mention to the team', async () => {
      await user5Platform.createPost(
        { text: `Hi, ![:Person](${user.rcId})` },
        team.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the team should have 2 umi`, async () => {
      await t.expect(await teamConversation.getUmi()).eql(2);
    });

    await h(t).withLog('When other user send a post without @mention to the group', async () => {
      await user5Platform.createPost(
        { text: `${uuid()}` },
        group.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the group should have 3 umi`, async () => {
      await t.expect(await groupConversation.getUmi()).eql(3);
    });

    await h(t).withLog('When other user send a post without @mention to the team', async () => {
      await user5Platform.createPost(
        { text: `${uuid()}` },
        team.data.id,
      );
      await t.wait(3e3);
    });

    await h(t).withLog(`Then the team should have 2 umi, no change`, async () => {
      await t.expect(await teamConversation.getUmi()).eql(2);
    });
  },
);

test.skip(formalName('Remove UMI when open conversation', ['JPT-103', 'P0', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${pvtChat.data.id}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      const unreadGroupIds = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(user.rcId);
      await user.sdk.glip.markAsRead(user.rcId, unreadGroupIds);
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

    const directMessagesSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    await h(t).withLog('Then I click private chat to make sure the group is not selected', async () => {
      await directMessagesSection.conversationByIdEntry(pvtChat.data.id).enter()
    });

    await h(t).withLog('And I can find the UMI on the team', async () => {
      const item = teamsSection.conversationByIdEntry(team.data.id);
      const umi = item.self.find('.umi');
      const text = item.self.find('p');
      const count = await item.getUmi();
      await t.expect(count).eql(1);
      const umiBgColor = (await umi.style)['background-color'];
      await t.expect(umiBgColor).eql('rgb(255, 136, 0)');
      const textFontWeight = (await text.style)['font-weight'];
      await t.expect(textFontWeight).match(/700|bold/);
    });

    await h(t).withLog('Then I click the team to open the team conversation', async () => {
      await teamsSection.conversationByIdEntry(team.data.id).enter();
      await t.wait(1e3);
    });

    await h(t).withLog('And I can no longer find the UMI on the team', async () => {
      const item = teamsSection.conversationByIdEntry(team.data.id);
      const text = item.self.find('p');
      const count = await item.getUmi();
      await t.expect(count).eql(0);
      const textFontWeight = (await text.style)['font-weight'];
      await t.expect(textFontWeight).match(/400|normal/);
    });
  },
);

test.skip(formalName('Current opened conversation should not display UMI', ['JPT-105', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection = app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
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
        await user.sdk.glip.updateProfile(user.rcId, {
          [`hide_group_${pvtChatId}`]: false,
          favorite_group_ids: [],
        });
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can open the private chat', async () => {
      pvtChat = directMessagesSection.conversationByIdEntry(pvtChatId);
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
      const umi = await pvtChat.getUmi();
      await t.expect(umi).eql(0);
    });

    await h(t).withLog('When I open other conversation and reload web page', async () => {
      await teamsSection.conversationByIdEntry(teamId).enter();
      await t.wait(3e3);
      await app.reload();
    });

    await h(t).withLog('Then I should not have UMI in the private chat too', async () => {
      const umi = await pvtChat.getUmi();
      await t.expect(umi).eql(0);
    });
  },
);

test(formalName('Should not display UMI when section is expended & Should display UMI when section is collapsed',
    ['JPT-98', 'JPT-99', 'P2', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;
    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);

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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${favPrivateChat.data.id}`]: false,
        [`hide_group_${favTeam.data.id}`]: false,
        [`hide_group_${group1.data.id}`]: false,
        [`hide_group_${group2.data.id}`]: false,
        [`hide_group_${group3.data.id}`]: false,
        [`hide_group_${team1.data.id}`]: false,
        [`hide_group_${team2.data.id}`]: false,
        favorite_group_ids: [+favPrivateChat.data.id, +favTeam.data.id],
        });
      },
    );

    await h(t).withLog('Clear all UMIs before login', async () => {
      const unreadGroupIds = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(
        user.rcId,
      );

      await user.sdk.glip.markAsRead(user.rcId, unreadGroupIds);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I click group3 to make sure other conversations are not selected',
      async () => {
        await t.click(directMessagesSection.conversations.filter(`[data-group-id="${group3.data.id}"]`));
      },
    );

    await h(t).withLog('Send posts to conversations', async () => {
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
      await t.wait(2e3);
    });

    await h(t).withLog('Should not have umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Should not have umi in header of direct message sections', async () => {
      const header = directMessagesSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Should not have umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
        }
      },
    );

    await h(t).withLog('Fold the sections', async () => {
      await favoritesSection.fold();
      await directMessagesSection.fold();
      await teamsSection.fold();
      await t.wait(1e3);
    });

    await h(t).withLog('Should have 1 umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });
  
    await h(t).withLog('Should have 2 umi in header of direct messages sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });
    
    await h(t).withLog('Should not have umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Send posts with mention to conversations', async () => {
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
      await t.wait(1e3);
    });

    await h(t).withLog('Should have 2 umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('2');
    });
    
    await h(t).withLog('Should have 3 umi in header of direct messages sections', async () => {
      const header = directMessagesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('3');
    });

    await h(t).withLog('Should have 1 umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });

    await h(t).withLog('Send normal posts to conversations', async () => {
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
      await t.wait(1e3);
    });

    await h(t).withLog('Should have 3 umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('3');
    });

    await h(t).withLog('Should have 4 umi in header of direct messages sections', async () => {
      const header = directMessagesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('4');
    });

    await h(t).withLog('Should have 1 umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });
  },
);

test(formalName('UMI should be updated when fav/unfav conversation', ['JPT-123', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);


    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;
    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);

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
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${group1.data.id}`]: false,
        [`hide_group_${group2.data.id}`]: false,
        [`hide_group_${group3.data.id}`]: false,
        [`hide_group_${team1.data.id}`]: false,
        [`hide_group_${team2.data.id}`]: false,
        favorite_group_ids: [],
      });
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      const unreadGroupIds = await user.sdk.glip.getIdsOfGroupsWithUnreadMessages(
        user.rcId,
      );
      await user.sdk.glip.markAsRead(user.rcId, unreadGroupIds);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I click group3 to make sure other conversations are not selected',
      async () => {
        await t.click(directMessagesSection.conversations.filter(`[data-group-id="${group3.data.id}"]`));
      },
    );

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

    await h(t).withLog('Favorite the two groups with UMI', async () => {
      const item = directMessagesSection.conversations.filter(`[data-group-id="${group1.data.id}"]`);
      const moreIcon = item.find('span').withText('more_vert');
      await t.click(moreIcon);
      const favoriteButton = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.click(favoriteButton);

      const item2 = teamsSection.conversations.filter(`[data-group-id="${team1.data.id}"]`);
      const moreIcon2 = item2.find('span').withText('more_vert');
      await t.click(moreIcon2);
      const favoriteButton2 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.click(favoriteButton2);
    });

    await h(t).withLog('Should have 2 umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('2');
    });

    await h(t).withLog('Fold direct messages and teams section', async () => {
      await directMessagesSection.fold();
      await teamsSection.fold();
      await t.wait(1e3);
    });

    await h(t).withLog('Should not have umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Should not have umi in header of direct messages sections', async () => {
      const header = directMessagesSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Expand favorite section', async () => {
      await favoritesSection.expand();
      await t.wait(1e3);
    });

    await h(t).withLog('Remove the two groups with UMI from Favorites', async () => {
      const item = favoritesSection.conversations.filter(
        `[data-group-id="${group1.data.id}"]`,
      );
      const moreIcon = item.find('span').withText('more_vert');
      await t.click(moreIcon);
      const favoriteButton = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.click(favoriteButton);

      const item2 = favoritesSection.conversations.filter(
        `[data-group-id="${team1.data.id}"]`,
      );
      const moreIcon2 = item2.find('span').withText('more_vert');
      await t.click(moreIcon2);
      const favoriteButton2 = app.homePage
        .getSelector('#render-props-menu')
        .find('li[data-test-automation-id="favToggler"]');
      await t.click(favoriteButton2);
    });

    await h(t).withLog('Fold favorite section', async () => {
      await favoritesSection.fold();
      await t.wait(1e3);
    });

    await h(t).withLog('Should not have umi in header of favorite sections', async () => {
      const header = favoritesSection.header;
      const umi = header.child('.umi');
      const count = await umi.count;
      if (count === 1) {
        await t.expect(umi.textContent).eql('');
      } else {
        await t.expect(umi.count).eql(0);
      }
    });

    await h(t).withLog('Should have 1 umi in header of direct messages sections', async () => {
      const header = directMessagesSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });

    await h(t).withLog('Should have 1 umi in header of team sections', async () => {
      const header = teamsSection.header;
      const umi = header.child('.umi');
      await t.expect(umi.textContent).eql('1');
    });
  },
);
