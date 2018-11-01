/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-30 10:36:08
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { GlipSdk } from '../../v2/sdk/glip';

fixture('ConversationList/UnreadToggle')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName(
    `Display a toggle that controls whether to show only new messages on the conversation list &
    The conversation list is refreshed when the toggle status is changed &
    The conversation should be hidden from the list when turn unread toggle on and navigates from a conversation &
    The opened conversation remain opened, and it should be displayed on the conversation list when turn unread toggle on`,
    ['JPT-194', 'JPT-198', 'JPT-201', 'JPT-202', 'P2', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);

    const directMessagesSection =
      app.homePage.messagePanel.directMessagesSection;
    const teamsSection = app.homePage.messagePanel.teamsSection;
    const favoritesSection = app.homePage.messagePanel.favoritesSection;
    const unreadToggler = app.homePage.messagePanel.getSelectorByAutomationId('unreadOnlyToggler');
    const user5Platform = await h(t).sdkHelper.sdkManager.getPlatform(users[5]);
    let favPrivateChat, favTeam, group1, group2, group3, team1, team2;
    await h(t).withLog(
      'Given I have an extension with some conversations',
      async () => {
        favPrivateChat = await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        });
        favTeam = await userPlatform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
        group1 = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        });
        group2 = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[1].rcId],
        });
        group3 = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[2].rcId],
        });
        team1 = await userPlatform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
        team2 = await userPlatform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog(
      'And the conversations should not be hidden before login',
      async () => {
        await glipSDK.updateProfile(user.rcId, {
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
      const unreadGroupIds = await glipSDK.getIdsOfGroupsWithUnreadMessages(
        user.rcId,
      );

      await glipSDK.markAsRead(user.rcId, unreadGroupIds);
    });

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      'Then I click group3 to make sure other conversations are not selected',
      async () => {
        await t.click(
          directMessagesSection.conversations.filter(
            `[data-group-id="${group3.data.id}"]`,
          ),
        );
      },
    );

    await h(t).withLog('Send posts to conversations', async () => {
      await user5Platform.createPost(
        {
          text: 'TestGroupUMI',
        },
        favPrivateChat.data.id,
      );
      await user5Platform.createPost(
        {
          text: 'TestGroupUMI',
        },
        group1.data.id,
      );

      await user5Platform.createPost(
        {
          text: 'TestGroupUMI',
        },
        team1.data.id,
      );
      await t.wait(2e3);
    });

    await h(t).withLog('Should find unread toggle and the default state is off', async () => {
      await t.expect(unreadToggler.exists).ok();
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).notOk();
    }, true);

    await h(t).withLog('All prepared conversation should be visible', async () => {
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favPrivateChat.data.id}"]`).visible).ok();
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favTeam.data.id}"]`).visible).ok();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group1.data.id}"]`).visible).ok();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group2.data.id}"]`).visible).ok();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team1.data.id}"]`).visible).ok();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team2.data.id}"]`).visible).ok();
    }, true);

    await h(t).withLog('Then I click the unread toggle', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
    });

    await h(t).withLog('The state of the toggle should be on and conversations without unread messages should be hidden, except the currently opened one', async () => {
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).ok();
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favPrivateChat.data.id}"]`).visible).ok();
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favTeam.data.id}"]`).visible).notOk();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group1.data.id}"]`).visible).ok();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group2.data.id}"]`).visible).notOk();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team1.data.id}"]`).visible).ok();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team2.data.id}"]`).visible).notOk();

      // currently opened group3 should remain visible on the list and the conversation remained opened
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group3.data.id}"]`).visible).ok();
      await t.expect(app.homePage.messagePanel.conversationPage.getAttribute('data-group-id')).eql(group3.data.id);
    }, true);

    await h(t).withLog('Then I click the unread toggle', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
    });

    await h(t).withLog('The state of the toggle should be off and all prepared conversations should be visible', async () => {
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).notOk();
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favPrivateChat.data.id}"]`).visible).ok();
      await t.expect(favoritesSection.conversations.filter(`[data-group-id="${favTeam.data.id}"]`).visible).ok();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group1.data.id}"]`).visible).ok();
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group2.data.id}"]`).visible).ok();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team1.data.id}"]`).visible).ok();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${team2.data.id}"]`).visible).ok();
    }, true);

    await h(t).withLog('Then I click the unread toggle to turn it on again and open another conversation', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).ok();
      await t.click(directMessagesSection.conversations.filter(`[data-group-id="${group1.data.id}"]`));
    });

    await h(t).withLog('Group3 should be hidden', async () => {
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group3.data.id}"]`).visible).notOk();
    }, true);

    await h(t).withLog('Then group3 received a new message', async () => {
      await user5Platform.createPost(
        {
          text: 'TestGroupUMI',
        },
        group3.data.id,
      );
    });

    await h(t).withLog('Group3 should be visible again', async () => {
      await t.expect(directMessagesSection.conversations.filter(`[data-group-id="${group3.data.id}"]`).visible).ok();
    }, true);
  },
);
