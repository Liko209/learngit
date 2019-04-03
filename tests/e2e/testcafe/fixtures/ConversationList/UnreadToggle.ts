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
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/UnreadToggle')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`Display a toggle that controls whether to show only new messages on the conversation list &
    The conversation list is refreshed when the toggle status is changed &
    The conversation should be hidden from the list when turn unread toggle on and navigates from a conversation &
    The opened conversation remain opened, and it should be displayed on the conversation list when turn unread toggle on`,
  ['JPT-193', 'JPT-194', 'JPT-198', 'JPT-201', 'JPT-202', 'P2', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
     const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const unreadToggler = app.homePage.messageTab.unReadToggler;

    let favPrivateChatId, favTeamId, groupId1, groupId2, groupId3, teamId1, teamId2;
    await h(t).withLog('Given I have an extension with some conversations', async () => {
      favPrivateChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId],
      });
      favTeamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
      groupId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
      groupId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[1].rcId],
      });
      groupId3 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group',
        members: [loginUser.rcId, users[5].rcId, users[2].rcId],
      });
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
    });
    await h(t).withLog('And clear all UMIs before login', async () => {
      await h(t).glip(loginUser).resetProfileAndState();
    });
    
    await h(t).withLog('And favorite 2 conversation before login', async () => {
      await h(t).glip(loginUser).favoriteGroups([+favPrivateChatId, +favTeamId]);
    });



    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And click group3 to make sure other conversations are not selected', async () => {
      await directMessagesSection.conversationEntryById(groupId3).enter();
    });

    // JPT-194
    await h(t).withLog('Then I Should find unread toggle and the default state is off', async () => {
      await t.expect(unreadToggler.exists).ok();
      await unreadToggler.shouldBeOff();
    }, true);

    await h(t).withLog('And All prepared conversation should be visible', async () => {
      await favoritesSection.conversationEntryById(favPrivateChatId).shouldBeVisible();
      await favoritesSection.conversationEntryById(favTeamId).shouldBeVisible();
      await directMessagesSection.conversationEntryById(groupId1).shouldBeVisible();
      await directMessagesSection.conversationEntryById(groupId2).shouldBeVisible();
      await teamsSection.conversationEntryById(teamId1).shouldBeVisible();
      await teamsSection.conversationEntryById(teamId2).shouldBeVisible();
    }, true);

    await h(t).withLog('When other user send posts to some specific conversations', async () => {
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', favPrivateChatId);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', groupId1);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', teamId1);
      await t.wait(2e3);
    });

    await h(t).withLog('And I click the unread  to turn it on', async () => {
      await unreadToggler.turnOn();
    });

    // JPT-198,JPT-202
    await h(t).withLog('Then the state of the toggle should be on and conversations without unread messages should be hidden, except  conversations with UMI and the currently opened one', async () => {
      await unreadToggler.shouldBeOn();
      await favoritesSection.conversationEntryById(favPrivateChatId).shouldBeVisible();
      await favoritesSection.conversationEntryById(favTeamId).shouldBeInvisible();
      await directMessagesSection.conversationEntryById(groupId1).shouldBeVisible();
      await directMessagesSection.conversationEntryById(groupId2).shouldBeInvisible();
      await teamsSection.conversationEntryById(teamId1).shouldBeVisible();
      await teamsSection.conversationEntryById(teamId2).shouldBeInvisible();

      // currently opened groupId3 should remain visible on the list and the conversation remained opened
      await directMessagesSection.conversationEntryById(groupId3).shouldBeVisible();
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(groupId3);
    }, true);

    await h(t).withLog('When I click the unread toggle to turn it off', async () => {
      await unreadToggler.turnOff();
    });

    await h(t).withLog('Then the state of the toggle should be off and all prepared conversations should be visible', async () => {
      await unreadToggler.shouldBeOff();
      await favoritesSection.conversationEntryById(favPrivateChatId).shouldBeVisible();
      await favoritesSection.conversationEntryById(favTeamId).shouldBeVisible();
      await directMessagesSection.conversationEntryById(groupId1).shouldBeVisible();
      await directMessagesSection.conversationEntryById(groupId2).shouldBeVisible();
      await teamsSection.conversationEntryById(teamId1).shouldBeVisible();
      await teamsSection.conversationEntryById(teamId2).shouldBeVisible();
    }, true);

    // JPT-201
    await h(t).withLog('When I click the unread toggle to turn it on again and open another conversation', async () => {
      await unreadToggler.turnOn();
      await unreadToggler.shouldBeOn();
      await directMessagesSection.conversationEntryById(groupId1).enter();
    });

    await h(t).withLog('GroupId3 should be hidden', async () => {
      await directMessagesSection.conversationEntryById(groupId3).shouldBeInvisible();
    }, true);

    await h(t).withLog('Then groupId3 received a new message', async () => {
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', groupId3);
    });

    await h(t).withLog('GroupId3 should be visible again', async () => {
      await directMessagesSection.conversationEntryById(groupId3).shouldBeVisible();
    }, true);
  },
);
