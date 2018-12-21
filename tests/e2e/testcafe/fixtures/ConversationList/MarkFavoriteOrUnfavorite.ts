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
import { SITE_URL } from '../../config';

fixture('ConversationList/MarkFavoriteOrUnfavorite')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Display Favorite button when user tap more button of a conversation in DM/Teams & When user mark a conversation as favorite, move the conversation to favorite section.',
    ['P1', 'P2', 'JPT-181', 'JPT-183', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;

    let groupId, teamId;
    await h(t).withLog('Given I have an extension with a group and a team conversation', async () => {
      groupId = (await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
      teamId = (await user.sdk.platform.createGroup({
        type: 'Team',
        name: uuid(),
        members: [user.rcId, users[5].rcId],
      })).data.id;
    });

    await h(t).withLog('And the conversations should not be hidden and unfavorited before login', async () => {
      await user.sdk.glip.showGroups(user.rcId, [groupId, teamId]);
      await user.sdk.glip.clearFavoriteGroups();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
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
    ['P1', 'P2', 'JPT-182', 'JPT-184', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);
   
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;

    let groupId, teamId;
    await h(t).withLog('Given I have an extension with a group and a team conversation', async () => {
      groupId = (await user.sdk.platform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
      teamId = (await user.sdk.platform.createGroup({
        type: 'Team',
        name: uuid(),
        members: [user.rcId, users[5].rcId],
      })).data.id;
    });

    await h(t).withLog('Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
        await user.sdk.glip.showGroups(user.rcId, [groupId, teamId]);
        await user.sdk.glip.favoriteGroups(user.rcId, [+groupId, +teamId]);
      },
    );

    await h(t).withLog( `When I login Jupiter with this extension: ${user.company.number}#${ user.extension }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
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
  },
);

test(formalName('When Me conversation is removed favorite mark, it should be displayed in DM section.',
    ['P2', 'JPT-185', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    let meChatId;
    await h(t).withLog('Given I have an extension with a me conversation', async () => {
      meChatId = (await user.sdk.glip.getPerson(user.rcId)).data.me_group_id;
    });

    await h(t).withLog('Before login, the conversations should not be hidden and should have been marked as favorite already',
      async () => {
        await user.sdk.glip.showGroups(user.rcId, [meChatId]);
        await user.sdk.glip.favoriteGroups(user.rcId, [+meChatId]);
 
      },
    );

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
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
