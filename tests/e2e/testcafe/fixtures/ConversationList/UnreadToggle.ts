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

fixture('ConversationList/UnreadToggle')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName(
    `Display a toggle that controls whether to show only new messages on the conversation list &
    The conversation list is refreshed when the toggle status is changed &
    The conversation should be hidden from the list when turn unread toggle on and navigates from a conversation &
    The opened conversation remain opened, and it should be displayed on the conversation list when turn unread toggle on`,
    ['JPT-193', 'JPT-194', 'JPT-198', 'JPT-201', 'JPT-202', 'P2', 'P1', 'ConversationList'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user)


    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const unreadToggler = app.homePage.messageTab.getSelectorByAutomationId('unreadOnlyToggler');
    const user5Platform = await h(t).getPlatform(users[5]);
    
    let favPrivateChatId, favTeamId, groupId1, groupId2, groupId3, teamId1, teamId2;
    await h(t).withLog(
      'Given I have an extension with some conversations',
      async () => {
        favPrivateChatId = (await user.sdk.platform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        })).data.id;
        favTeamId = (await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        })).data.id;
        groupId1 = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        })).data.id;
        groupId2 = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[1].rcId],
        })).data.id;
        groupId3 = (await user.sdk.platform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[2].rcId],
        })).data.id;
        teamId1 = (await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        })).data.id;
        teamId2 = (await user.sdk.platform.createGroup({
          type: 'Team',
          name: `My Team ${uuid()}`,
          members: [user.rcId, users[5].rcId],
        })).data.id;
      },
    );

    await h(t).withLog(
      'And the conversations should not be hidden before login',
      async () => {
        await user.sdk.glip.showAllGroups();
        // await glipSDK.updateProfile(user.rcId, {
        //   [`hide_group_${favPrivateChatId}`]: false,
        //   [`hide_group_${favTeamId}`]: false,
        //   [`hide_group_${groupId1}`]: false,
        //   [`hide_group_${groupId2}`]: false,
        //   [`hide_group_${groupId3}`]: false,
        //   [`hide_group_${teamId1}`]: false,
        //   [`hide_group_${teamId2}`]: false,
        //   // favorite_group_ids: [+favPrivateChatId, +favTeamId],
        // });
        await user.sdk.glip.favoriteGroups(user.rcId, [+favPrivateChatId, +favTeamId]);
      },
    );

    await h(t).withLog('And clear all UMIs before login', async () => {
      await user.sdk.glip.clearAllUmi();
      // const unreadGroupIds = await glipSDK.getIdsOfGroupsWithUnreadMessages(
      //   user.rcId,
      // );
      // await glipSDK.markAsRead(user.rcId, unreadGroupIds);
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
      'And click group3 to make sure other conversations are not selected',
      async () => {
        await directMessagesSection.conversationEntryById(groupId3).enter();
      },
    );

    // JPT-194 
    await h(t).withLog('Then I Should find unread toggle and the default state is off', async () => {
      await t.expect(unreadToggler.exists).ok();
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).notOk();
    }, true);

    await h(t).withLog('And All prepared conversation should be visible', async () => {
      await t.expect(favoritesSection.conversationEntryById(favPrivateChatId).self.visible).ok();
      await t.expect(favoritesSection.conversationEntryById(favTeamId).self.visible).ok();
      await t.expect(directMessagesSection.conversationEntryById(groupId1).self.visible).ok();
      await t.expect(directMessagesSection.conversationEntryById(groupId2).self.visible).ok();
      await t.expect(teamsSection.conversationEntryById(teamId1).self.visible).ok();
      await t.expect(teamsSection.conversationEntryById(teamId2).self.visible).ok();
    }, true);

    await h(t).withLog('When other user send posts to some specific conversations', async () => {
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        favPrivateChatId,
      );
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        groupId1,
      );

      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        teamId1,
      );
      await t.wait(2e3);
    });

    await h(t).withLog('And I click the unread  to turn it on', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
    });

    // JPT-198,JPT-202
    await h(t).withLog('Then the state of the toggle should be on and conversations without unread messages should be hidden, except  conversations with UMI and the currently opened one', async () => {
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).ok();
      await t.expect(favoritesSection.conversationEntryById(favPrivateChatId).self.visible).ok();
      await t.expect(favoritesSection.conversationEntryById(favTeamId).self.visible).notOk();
      await t.expect(directMessagesSection.conversationEntryById(groupId1).self.visible).ok();
      await t.expect(directMessagesSection.conversationEntryById(groupId2).self.visible).notOk();
      await t.expect(teamsSection.conversationEntryById(teamId1).self.visible).ok();
      await t.expect(teamsSection.conversationEntryById(teamId2).self.visible).notOk();

      // currently opened groupId3 should remain visible on the list and the conversation remained opened
      await t.expect(directMessagesSection.conversationEntryById(groupId3).self.visible).ok();
      await t.expect(app.homePage.messageTab.conversationPage.self.getAttribute('data-group-id')).eql(groupId3);
    }, true);

    await h(t).withLog('When I click the unread toggle to turn it off', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
    });

    await h(t).withLog('Then the state of the toggle should be off and all prepared conversations should be visible', async () => {
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).notOk();
      await t.expect(favoritesSection.conversationEntryById(favPrivateChatId).self.visible).ok();
      await t.expect(favoritesSection.conversationEntryById(favTeamId).self.visible).ok();
      await t.expect(directMessagesSection.conversationEntryById(groupId1).self.visible).ok();
      await t.expect(directMessagesSection.conversationEntryById(groupId2).self.visible).ok();
      await t.expect(teamsSection.conversationEntryById(teamId1).self.visible).ok();
      await t.expect(teamsSection.conversationEntryById(teamId2).self.visible).ok();
    }, true);

    // JPT-201
    await h(t).withLog('When I click the unread toggle to turn it on again and open another conversation', async () => {
      await t.click(unreadToggler.find('.toggle-button'));
      await t.expect(unreadToggler.find('input[type="checkbox"]').checked).ok();
      await directMessagesSection.conversationEntryById(groupId1).enter();
    });

    await h(t).withLog('GroupId3 should be hidden', async () => {
      await t.expect(directMessagesSection.conversationEntryById(groupId3).self.visible).notOk();
    }, true);

    await h(t).withLog('Then groupId3 received a new message', async () => {
      await user5Platform.createPost(
        { text: 'TestGroupUMI' },
        groupId3,
      );
    });

    await h(t).withLog('GroupId3 should be visible again', async () => {
      await t.expect(directMessagesSection.conversationEntryById(groupId3).self.visible).ok();
    }, true);
  },
);
