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
import { SITE_URL, BrandTire } from '../../config';
import { ClientFunction } from 'testcafe';
import * as assert from 'assert';

fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('UMI should be added received messages count in conversations', ['JPT-107', 'P0', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  const otherUser = users[5];
  await h(t).platform(otherUser).init();
  await h(t).glip(loginUser).resetProfile();

  let pvtChatId, groupId, teamId, groupConversation, teamConversation;
  await h(t).withLog('Given I have an extension with certain conversations', async () => {
    pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId]
    });
    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Group',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `My Team ${uuid()}`,
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  await h(t).withLog('And I click a private chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(pvtChatId).enter();

  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`And make preconditions: group ${groupId} and team ${teamId} both with UMI=1`, async () => {
    await h(t).platform(otherUser).sendTextPost(`![:Person](${loginUser.rcId}), ${uuid()}`, groupId);
    await h(t).platform(otherUser).sendTextPost(`![:Person](${loginUser.rcId}), ${uuid()}`, teamId);
    await t.wait(3e3);
    await directMessagesSection.expand();
    groupConversation = directMessagesSection.conversationEntryById(groupId);
    await teamsSection.expand();
    teamConversation = teamsSection.conversationEntryById(teamId);
    await groupConversation.umi.shouldBeNumber(1);
    await teamConversation.umi.shouldBeNumber(1);
  });

  await h(t).withLog('When other user send a post with @mention to the group', async () => {
    await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, groupId);
    await t.wait(3e3);
  });

  await h(t).withLog(`The group should have 2 umi`, async () => {
    await groupConversation.umi.shouldBeNumber(2);
  });

  await h(t).withLog('When other user send a post with @mention to the team', async () => {
    await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, teamId);
    await t.wait(3e3);
  });

  await h(t).withLog(`Then the team should have 2 umi`, async () => {
    await teamConversation.umi.shouldBeNumber(2);
  });

  await h(t).withLog('When other user send a post without @mention to the group', async () => {
    await h(t).platform(otherUser).sendTextPost(`${uuid()}`, groupId);
    await t.wait(3e3);
  });

  await h(t).withLog(`Then the group should have 3 umi`, async () => {
    await groupConversation.umi.shouldBeNumber(3);
  });

  await h(t).withLog('When other user send a post without @mention to the team', async () => {
    await h(t).platform(otherUser).sendTextPost(`${uuid()}`, teamId);
    await t.wait(3e3);
  });

  await h(t).withLog(`Then the team should have 2 umi, no change`, async () => {
    await teamConversation.umi.shouldBeNumber(2);
  });
},
);

test(formalName('Remove UMI when open conversation', ['JPT-103', 'P0', 'ConversationList']), async (t: TestController) => {
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const otherUser = users[5];
  await h(t).platform(otherUser).init();


  let pvtChatId, teamId;
  await h(t).withLog('Given I have an extension with a team and a private chat',
    async () => {
      pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId],
      });
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
    },
  );

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog('Have other user send a post with mention to the team before I login', async () => {
    await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, teamId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const team = teamsSection.conversationEntryById(teamId);
  await h(t).withLog('Then I click private chat to make sure the group is not selected', async () => {
    await directMessagesSection.conversationEntryById(pvtChatId).enter()
  });

  await h(t).withLog('And I can find the UMI on the team', async () => {
    await team.umi.shouldBeNumber(1);
    await team.umi.shouldBeAtMentionStyle();
    await team.shouldBeUmiStyle();
  });

  await h(t).withLog('Then I click the team to open the team conversation', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('And I can no longer find the UMI on the team', async () => {
    const text = team.self.find('p');
    await team.umi.shouldBeNumber(0);
    await team.shouldBeNormalStyle();
  });

});

test(formalName('Current opened conversation should not display UMI', ['JPT-105', 'P1', 'ConversationList']), async (t: TestController) => {
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;

  let pvtChatId, teamId, pvtChat, team;
  await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
    pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `My Team ${uuid()}`,
      members: [loginUser.rcId, users[5].rcId],
    });
   });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  await h(t).withLog('Then I can open the private chat', async () => {
    pvtChat = directMessagesSection.conversationEntryById(pvtChatId);
    await pvtChat.enter();
  });

  await h(t).withLog('When I receive a new message from other user in the private chat ', async () => {
    await h(t).platform(otherUser).sendTextPost('TestGroupUMI', pvtChatId)
  });

  // FIXME: When run cases concurrently, current browser will be lost focus, and fail.
  await h(t).withLog('Then I should not have UMI in the private chat', async () => {
    await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    await pvtChat.umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I open other conversation and reload web page', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
    await t.wait(3e3);
    await app.reload();
  });

  await h(t).withLog('Then I should not have UMI in the private chat too', async () => {
    await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    await pvtChat.umi.shouldBeNumber(0);
  });
},
);

test(formalName('Should not display UMI when section is expended & Should display UMI when section is collapsed',
  ['JPT-98', 'JPT-99', 'P2', 'P1', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfile();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const teamsSection = app.homePage.messageTab.teamsSection;
    const favoritesSection = app.homePage.messageTab.favoritesSection;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let favPrivateChatId, favTeamId, groupId1, groupId2, groupId3, teamId1, teamId2;
    await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
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

    await h(t).withLog('And favorite 2 conversation before login', async () => {
      await h(t).glip(loginUser).favoriteGroups([+favPrivateChatId, +favTeamId]);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I click groupId3 to make sure other conversations are not selected', async () => {
      await directMessagesSection.conversationEntryById(groupId3).enter();
    });


    await h(t).withLog('When other user send normal posts to all other conversations', async () => {
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', favPrivateChatId);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', favTeamId);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', groupId1);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', groupId2);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', teamId1);
      await h(t).platform(otherUser).sendTextPost('TestGroupUMI', teamId2);
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should not be any umi in header of favorite sections', async () => {
      await favoritesSection.headerUmi.shouldBeNumber(0);
    });

    await h(t).withLog('and there should not be any umi in header of direct message sections', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(0);
    });

    await h(t).withLog('and there should not be any umi in header of team sections', async () => {
      await teamsSection.headerUmi.shouldBeNumber(0);
    });

    await h(t).withLog('When I fold the sections', async () => {
      await favoritesSection.fold();
      await directMessagesSection.fold();
      await teamsSection.fold();
    })

    await h(t).withLog('Then there should be 1 umi in header of favorite sections', async () => {
      await favoritesSection.headerUmi.shouldBeNumber(1);
    });

    await h(t).withLog('and there should be 2 umi in header of direct messages sections', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(2);
    });

    await h(t).withLog('and there should not be any umi in header of team sections', async () => {
      await teamsSection.headerUmi.shouldBeNumber(0);
    });

    await h(t).withLog('When other user send posts with mention to specified conversations', async () => {
      await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, favPrivateChatId);
      await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, groupId1);
      await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, teamId1);
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should be 2 umi in header of favorite sections', async () => {
      await favoritesSection.headerUmi.shouldBeNumber(2);
    });

    await h(t).withLog('and there should be 3 umi in header of direct messages sections', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(3);

    });

    await h(t).withLog('and there should be 1 umi in header of team sections', async () => {
      await teamsSection.headerUmi.shouldBeNumber(1);
    });

    await h(t).withLog('When other user send normal posts to specified conversations', async () => {
      await h(t).platform(otherUser).sendTextPost('test', favPrivateChatId);
      await h(t).platform(otherUser).sendTextPost('test', favTeamId);
      await h(t).platform(otherUser).sendTextPost('test', groupId1);
      await h(t).platform(otherUser).sendTextPost('test', teamId1);
      await t.wait(3e3);
    });

    await h(t).withLog('Then there should be 3 umi in header of favorite sections', async () => {
      await favoritesSection.headerUmi.shouldBeNumber(3);
    });

    await h(t).withLog('and there should be 4 umi in header of direct messages sections', async () => {
      await directMessagesSection.headerUmi.shouldBeNumber(4);
    });

    await h(t).withLog('and there should be 1 umi in header of team sections', async () => {
      await teamsSection.headerUmi.shouldBeNumber(1);
    });
  },
);

test(formalName('UMI should be updated when fav/unfav conversation', ['JPT-123', 'P1', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const otherUser = users[5];
  await h(t).platform(otherUser).init();


  let groupId1, groupId2, groupId3, teamId1, teamId2;
  await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
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

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('Then I click groupId3 to make sure other conversations are not selected',
    async () => {
      await directMessagesSection.conversationEntryById(groupId3).enter();
    },
  );

  await h(t).withLog('Send posts to conversations', async () => {
    await h(t).platform(otherUser).sendTextPost('TestGroupUMI', groupId1);
    await h(t).platform(otherUser).sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, teamId1);
    await t.wait(1e3);
  });

  await h(t).withLog('Fold favorite section', async () => {
    await favoritesSection.fold();
    await t.wait(1e3);
  });

  const favoriteButton = app.homePage.messageTab.moreMenu.favoriteToggler;
  await h(t).withLog('Favorite the two groups with UMI', async () => {
    await directMessagesSection.conversationEntryById(groupId1).openMoreMenu();
    await favoriteButton.enter();

    await teamsSection.conversationEntryById(teamId1).openMoreMenu();
    await favoriteButton.enter();
  });

  await h(t).withLog('Should have 2 umi in header of favorite sections', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(2);
  });

  await h(t).withLog('Fold direct messages and teams section', async () => {
    await directMessagesSection.fold();
    await teamsSection.fold();
    await t.wait(1e3);
  });

  await h(t).withLog('Should not have umi in header of team sections', async () => {
    await teamsSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('Should not have umi in header of direct messages sections', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('Expand favorite section', async () => {
    await favoritesSection.expand();
    await t.wait(1e3);
  });

  await h(t).withLog('Remove the two groups with UMI from Favorites', async () => {
    await favoritesSection.conversationEntryById(groupId1).openMoreMenu();
    await favoriteButton.enter();

    await favoritesSection.conversationEntryById(teamId1).openMoreMenu();
    await favoriteButton.enter();
  });

  await h(t).withLog('Fold favorite section', async () => {
    await favoritesSection.fold();
    await t.wait(1e3);
  });

  await h(t).withLog('Should not have umi in header of favorite sections', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('Should have 1 umi in header of direct messages sections', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  });

  await h(t).withLog('Should have 1 umi in header of team sections', async () => {
    await teamsSection.headerUmi.shouldBeNumber(1);
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
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfile();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let pvtChatId;
    await h(t).withLog('Given Open a conversation with post more than one screen', async () => {
      pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId]
      });
      for (var i = 0; i < 15; i++) {
        await h(t).platform(otherUser).sendTextPost('test', pvtChatId);
      }
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    await h(t).withLog('When I scroll up content page and receive new messages', async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
      await conversationPage.scrollToMiddle();
      await h(t).platform(otherUser).sendTextPost('test again', pvtChatId);
    });

    await h(t).withLog('Then show UMI', async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).umi.shouldBeNumber(1);
    });

    await h(t).withLog('When I scroll down content page', async () => {
      const focus = ClientFunction(() => window.focus());
      await focus();
      await conversationPage.scrollToBottom();
    });

    await h(t).withLog('Then UMI dismiss', async () => {
      await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
      await directMessagesSection.conversationEntryById(pvtChatId).umi.shouldBeNumber(0);
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
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfile();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const postContent = `JPT-191, ${uuid()}`;

    let pvtChatId;
    await h(t).withLog('Given have a conversation', async () => {
      pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId]
      });
      await h(t).platform(otherUser).sendTextPost('test', pvtChatId);
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog(`Given I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When Open a conversation and receive new messages', async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).enter();
      await h(t).platform(otherUser).sendTextPost(postContent, pvtChatId);
      await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    });

    await h(t).withLog(`Then should not show UMI and scroll up automatically`, async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).umi.shouldBeNumber(0);
      const conversationPage = await app.homePage.messageTab.conversationPage;
      await t.expect(conversationPage.nthPostItem(-1).body.withText(postContent).exists).ok();
      await t.expect(conversationPage.nthPostItem(-1).body.withText(postContent).visible).ok();
    });
  },
);

//Need investigate how to unfocus page.
test.skip(formalName('Show UMI when does not focus then receive post', ['JPT-246', 'P2', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let pvtChatId;
    await h(t).withLog('Given have a conversation', async () => {
      pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId]
      });
      await h(t).platform(otherUser).sendTextPost('test', pvtChatId);
      await h(t).glip(loginUser).resetProfile();
    });

    await h(t).withLog(`Given I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Given Open a conversation then does not focus on the page', async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).enter();
      await t.wait(3000);
      const noFocus = ClientFunction(() => window.blur());
      await noFocus();
    });

    await h(t).withLog('When receive messages',
      async () => {
        await h(t).platform(otherUser).sendTextPost('test', pvtChatId);
      },
    );

    await h(t).withLog(`Then show UMI`, async () => {
      await directMessagesSection.conversationEntryById(pvtChatId).umi.shouldBeNumber(1);
    });
  },
);

test(formalName(`Shouldn't show UMI when login then open last conversation with UMI`, ['JPT-110', 'P2', 'ConversationList', 'Potar.He']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    let teamId;
    await h(t).withLog('Given I have an extension with one conversation', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `My Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
    });

    await h(t).withLog(`And set the conversation (id:${teamId}) is the last open conversation with 1 umi`, async () => {
      await h(t).glip(loginUser).setLastGroupId(teamId);
      await h(t).platform(otherUser).sendTextPost(`This is a unRead message ${uuid()}`, teamId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then the conversation should be opened and not has any UMI', async () => {
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(teamId);
      await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).umi.shouldBeNumber(0);
    });
  },
);

// bug https://jira.ringcentral.com/browse/FIJI-2766 so skip the checkpoint
test(formalName('JPT- 743 Should be unread when closed conversation received new unread', ['JPT-743', 'P1', 'ConversationList', 'Mia.Cai']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const post = uuid();

    let privateChatId;
    await h(t).withLog('Given closed one conversation', async () => {
      privateChatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, otherUser.rcId]
      });
      await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
      await h(t).glip(loginUser).hideGroups(privateChatId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And the conversation received one unread post from other members', async () => {
      await h(t).platform(otherUser).sendTextPost(post, privateChatId);
    });

    await h(t).withLog('Then the conversation should not be opened automatically', async () => {
      await t.expect(h(t).href).notContains(privateChatId);
    });

    await h(t).withLog('And the conversation should show in the conversation list', async () => {
      await t.expect(directMessagesSection.conversationEntryById(privateChatId).exists).ok();
    });

    // bug https://jira.ringcentral.com/browse/FIJI-2766
    // await h(t).withLog('And the conversation should be unread', async () => {
    //   await directMessagesSection.conversationEntryById(pvtChatId).expectUmi(1);
    // });
  });
