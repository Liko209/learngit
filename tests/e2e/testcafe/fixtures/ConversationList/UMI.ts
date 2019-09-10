/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-25 13:44:44
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import * as assert from 'assert';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, IUser, ITestMeta } from '../../v2/models';

fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('UMI should be added received messages count in conversations', ['JPT-107', 'P0', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  let privateChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let groupChat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser, users[7]]
  }

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given I have an extension with certain conversations', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([privateChat, groupChat, team]);
  });

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).scenarioHelper.resetProfile(loginUser);
    await h(t).scenarioHelper.clearAllUmi(loginUser);
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And I click a private chat', async () => {
    await directMessagesSection.conversationEntryById(privateChat.glipId).enter();
  });

  const groupConversation = directMessagesSection.conversationEntryById(groupChat.glipId);
  const teamConversation = teamsSection.conversationEntryById(team.glipId);
  await h(t).withLog(`And make preconditions: group ${groupChat.name} and team ${team.name} both with UMI=1`, async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, groupChat, otherUser);
    await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, team, otherUser);
    await directMessagesSection.expand();
    await groupConversation.umi.shouldBeNumber(1);
    await teamsSection.expand();

    await teamConversation.umi.shouldBeNumber(1);
  });

  await h(t).withLog('When other user send a post with @mention to the group', async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, groupChat, otherUser);
  });

  await h(t).withLog(`The group should have 2 umi`, async () => {
    await groupConversation.umi.shouldBeNumber(2);
  });

  await h(t).withLog('When other user send a post with @mention to the team', async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, team, otherUser);
  });

  await h(t).withLog(`Then the team should have 2 umi`, async () => {
    await teamConversation.umi.shouldBeNumber(2);
  });

  await h(t).withLog('When other user send a post without @mention to the group', async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId}), ${uuid()}`, groupChat, otherUser);
  });

  await h(t).withLog(`Then the group should have 3 umi`, async () => {
    await groupConversation.umi.shouldBeNumber(3);
  });

  await h(t).withLog('When other user send a post without @mention to the team', async () => {
    await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}`, team, otherUser);
  });

  await h(t).withLog(`Then the team should have 2 umi, no change`, async () => {
    await teamConversation.umi.shouldBeNumber(2);
  });
});

test(formalName('Remove UMI when open conversation', ['JPT-103', 'P0', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given I have an extension with a team', async () => {
    await h(t).scenarioHelper.createTeam(team)
  });

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog('Have other user send a post with mention to the team before I login', async () => {
    await h(t).scenarioHelper.sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, team, otherUser);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamEntry = teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog('And I can find the UMI on the team', async () => {
    await teamEntry.umi.shouldBeNumber(1);
    await teamEntry.umi.shouldBeAtMentionStyle();
    await teamEntry.shouldBeUmiStyle();
  });

  await h(t).withLog('Then I click the team to open the team conversation', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('And I can no longer find the UMI on the team', async () => {
    await teamEntry.umi.shouldBeNumber(0);
  });

});

test(formalName('Current opened conversation should not display UMI', ['JPT-105', 'P1', 'ConversationList']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const otherUser = users[5];

  const chat = <IGroup>{
    type: 'DirectMessage',
    members: [loginUser, otherUser],
    owner: loginUser
  }

  const team = <IGroup>{
    type: 'Team',
    members: [loginUser, otherUser],
    owner: loginUser,
    name: uuid()
  }

  await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, team]);
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
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


  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const pvtChat = directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I can open the private chat', async () => {
    await pvtChat.enter();
  });

  await h(t).withLog('When I receive a new message from other user in the private chat ', async () => {
    const postId = await h(t).scenarioHelper.sentAndGetTextPostId('TestGroupUMI', chat, otherUser);
    await app.homePage.messageTab.conversationPage.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog('Then I should not have UMI in the private chat', async () => {
    await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
    await pvtChat.umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I open other conversation and reload web page', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
    await t.wait(3e3);
    await app.reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I should not have UMI in the private chat too', async () => {
    await pvtChat.umi.shouldBeNumber(0);
  });
});

test.meta(<ITestMeta>{
  priority: ['P1', 'P2'],
  caseIds: ['JPT-98', 'JPT-99'],
  maintainers: ['potar.he'],
  keywords: ['ConversationList', 'UMI']
})('Should not display UMI when section is expended & Should display UMI when section is collapsed', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  const otherUser = users[3];

  const favChat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  const favTeam = <IGroup>{
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser],
    name: uuid()
  }

  const group1 = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [otherUser, otherUser, users[0]]
  }

  const group2 = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [otherUser, otherUser, users[1]]
  }

  const team1 = <IGroup>{
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser],
    name: uuid()
  }
  const team2 = <IGroup>{
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser],
    name: uuid()
  }

  const conversations = [favChat, favTeam, group1, group2, team1, team2]

  let meChatId;
  await h(t).withLog('Given I have an extension and reset its profile and state', async () => {
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).platform(otherUser).init();
    meChatId = await h(t).glip(loginUser).getMeChatId();
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog('And this extension with some conversations', async () => {
    await h(t).scenarioHelper.createTeamsOrChats(conversations);
  });

  await h(t).withLog('And favorite 2 conversations and mechat before login', async () => {
    await h(t).glip(loginUser).favoriteGroups([favChat.glipId, favTeam.glipId, meChatId]);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('And I click meChat to make sure other conversations are not selected', async () => {
    await favoritesSection.conversationEntryById(meChatId).enter();
  });

  await h(t).withLog('When I expand Favorite/Team/DirectMessage section', async () => {
    await favoritesSection.expand();
    await directMessagesSection.expand();
    await teamsSection.expand();
  });


  await h(t).withLog('When other user send normal posts to all other conversations', async () => {
    for (let conversation of conversations) {
      await h(t).scenarioHelper.sendTextPost(uuid(), conversation, otherUser);
    }
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
    for (let conversation of [favChat, group1, team1]) {
      await h(t).scenarioHelper.sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, conversation, otherUser);
    }
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
    for (let conversation of [favChat, favTeam, group1, team1]) {
      await h(t).scenarioHelper.sendTextPost(uuid(), conversation, otherUser);
    }
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
});

test(formalName('UMI should be updated when fav/unfav conversation', ['JPT-123', 'P1', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const otherUser = users[5];

  const chat = <IGroup>{
    type: 'DirectMessage',
    members: [loginUser, otherUser],
    owner: loginUser
  }

  const team = <IGroup>{
    type: 'Team',
    members: [loginUser, otherUser],
    owner: loginUser,
    name: uuid()
  }


  await h(t).withLog('Given I have an extension with a team and a private chat', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, chat]);
  });

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog('And receive a post in each conversation', async () => {
    await h(t).scenarioHelper.sendTextPost('TestGroupUMI', chat, otherUser);
    await h(t).scenarioHelper.sendTextPost(`Hi, ![:Person](${loginUser.rcId})`, team, otherUser);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  await h(t).withLog('And Fold favorite section', async () => {
    await favoritesSection.fold();
  });

  const favoriteButton = app.homePage.messageTab.moreMenu.favoriteToggler;
  await h(t).withLog('And Favorite the two groups with UMI', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).openMoreMenu();
    await favoriteButton.enter();

    await teamsSection.conversationEntryById(team.glipId).openMoreMenu();
    await favoriteButton.enter();
  });

  await h(t).withLog('Then Should have 2 umi in header of favorite sections', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(2);
  });

  await h(t).withLog('When Fold direct messages and teams section', async () => {
    await directMessagesSection.fold();
    await teamsSection.fold();
    await t.wait(1e3);
  });

  await h(t).withLog('Then Should not have umi in header of team sections', async () => {
    await teamsSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('And Should not have umi in header of direct messages sections', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('When Expand favorite section', async () => {
    await favoritesSection.expand();
    await t.wait(1e3);
  });

  await h(t).withLog('And Remove the two groups with UMI from Favorites', async () => {
    await favoritesSection.conversationEntryById(chat.glipId).openMoreMenu();
    await favoriteButton.enter();

    await favoritesSection.conversationEntryById(team.glipId).openMoreMenu();
    await favoriteButton.enter();
  });

  await h(t).withLog('And Fold favorite section', async () => {
    await favoritesSection.fold();
    await t.wait(1e3);
  });

  await h(t).withLog('Then Should not have umi in header of favorite sections', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('And Should have 1 umi in header of direct messages sections', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  });

  await h(t).withLog('And Should have 1 umi in header of team sections', async () => {
    await teamsSection.headerUmi.shouldBeNumber(1);
  });
});

test(formalName('Show UMI when scroll up to old post then receive new messages', ['JPT-189', 'P1', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let group = <IGroup>{
      type: "Group",
      members: [loginUser, otherUser, users[1]],
      owner: loginUser
    }

    await h(t).withLog('Given Open a conversation with post more than one screen', async () => {
      await h(t).scenarioHelper.createOrOpenChat(group);
      for (var i = 0; i < 5; i++) {
        await h(t).platform(otherUser).sendTextPost(H.multilineString(), group.glipId);
      }
    });

    await h(t).withLog('Clear all UMIs before login', async () => {
      await h(t).glip(loginUser).clearAllUmi();
    });

    await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
      await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
    });

    await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      })
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    await h(t).withLog('When I scroll up content page and receive new messages', async () => {
      await directMessagesSection.conversationEntryById(group.glipId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
      await t.wait(2e3);
      await conversationPage.scrollToMiddle();
      await h(t).platform(otherUser).sendTextPost('test again', group.glipId);
    });

    await h(t).withLog('Then show UMI', async () => {
      await directMessagesSection.conversationEntryById(group.glipId).umi.shouldBeNumber(0);
    });

    await h(t).withLog('When I scroll down content page', async () => {
      await conversationPage.scrollToBottom();
    });

    await h(t).withLog('Then UMI dismiss', async () => {
      await h(t).waitUmiDismiss();  // temporary: need time to wait back-end and front-end sync umi data.
      await directMessagesSection.conversationEntryById(group.glipId).umi.shouldBeNumber(0);
    });
  },
);

test(formalName('Should not show UMI and scroll up automatically when receive post', ['JPT-191', 'P2', 'ConversationList', 'Yilia.Hong']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const postContent = `JPT-191, ${uuid()}`;

  let chat = <IGroup>{
    type: "DirectMessage",
    members: [loginUser, otherUser, users[1]],
    owner: loginUser
  }

  await h(t).withLog('Given have a conversation', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).scenarioHelper.sendTextPost('for in list', chat, loginUser);
  });

  await h(t).withLog('Clear all UMIs before login', async () => {
    await h(t).glip(loginUser).clearAllUmi();
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const conversationPage = await app.homePage.messageTab.conversationPage;

  await h(t).withLog('When Open a conversation and receive new messages', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).enter();
    const postId = await h(t).scenarioHelper.sentAndGetTextPostId(postContent, chat, otherUser);
    await conversationPage.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`Then should not show UMI and scroll up automatically`, async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).umi.shouldBeNumber(0);
    await t.expect(conversationPage.nthPostItem(-1).body.withText(postContent).exists).ok();
    await t.expect(conversationPage.nthPostItem(-1).body.withText(postContent).visible).ok();
  });

  await h(t).withLog('When I open another conversation', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter();
  });

  await h(t).withLog('Then the origin conversation should not have UMI', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).umi.shouldBeNumber(0);
  });
});

test(formalName('Show UMI when does not focus then receive post', ['JPT-246', 'P2', 'ConversationList', 'Yilia.Hong']),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;

    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    let chat = <IGroup>{
      type: "DirectMessage",
      members: [loginUser, otherUser],
      owner: loginUser
    }
    await h(t).withLog('Given I have an extension with at least one conversation', async () => {
      await h(t).scenarioHelper.createOrOpenChat(chat);
    });

    await h(t).withLog('And send a post to ensure the conversation in list', async () => {
      await h(t).scenarioHelper.sendTextPost(uuid(), chat, loginUser);
    });

    await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
      await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
    });

    const app = new AppRoot(t);
    await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      })
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    await h(t).withLog('And Open the conversation', async () => {
      await directMessagesSection.conversationEntryById(chat.glipId).enter();
    });

    await h(t).withLog('And Enter the mentions', async () => {
      await app.homePage.messageTab.mentionsEntry.enter();
    });

    await h(t).withLog('WHen leave browser window', async () => {
      await h(t).interceptHasFocus(false);
    });

    await h(t).withLog('And receive a messages in this conversation', async () => {
      await h(t).platform(otherUser).sendTextPost('test', chat.glipId);
    });

    await h(t).withLog('Then I should find UMI of this conversation is 1', async () => {
      await directMessagesSection.conversationEntryById(chat.glipId).umi.shouldBeNumber(1);
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

    let team = <IGroup>{
      type: "Team",
      members: [loginUser, otherUser],
      owner: loginUser,
      name: uuid()
    }

    await h(t).withLog('Given I have an extension with one conversation', async () => {
      await h(t).scenarioHelper.createTeam(team);
    });

    await h(t).withLog(`And set the conversation is the last open conversation with 1 umi`, async () => {
      await h(t).glip(loginUser).setLastGroupId(team.glipId);
      await h(t).platform(otherUser).sendTextPost(`This is a unRead message ${uuid()}`, team.glipId);
    });

    await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
      await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
    });

    await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      })
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation should be opened and not has any UMI', async () => {
      await app.homePage.messageTab.conversationPage.groupIdShouldBe(team.glipId);
      await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).umi.shouldBeNumber(0);
    });
  },
);

test.meta(<ITestMeta>{
  priority: ['p1'],
  caseIds: ['JPT-743'],
  keywords: ['ConversationList', 'umi'],
  maintainers: ['Mia.Cai']
})('Should be unread when closed conversation received new unread', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog('Given closed one DirectMessage conversation', async () => {
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).glip(loginUser).hideGroups(chat.glipId);
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And the conversation received one unread post from other members', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
  });

  await h(t).withLog('Then the conversation should not be opened automatically', async () => {
    await t.expect(h(t).href).notContains(chat.glipId);
  });

  const conversation = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And the conversation should show in the conversation list', async () => {
    await conversation.ensureLoaded();
  });

  await h(t).withLog('And the conversation should be unread', async () => {
    await conversation.umi.shouldBeNumber(1);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-197'],
  maintainers: ['potar.he'],
  keywords: ['UMI'],
})('UMI badge in the left navigation panel can be updated when I change to other tab.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];

  const chat = <IGroup>{
    owner: loginUser,
    members: [loginUser, anotherUser],
    type: 'DirectMessage',
  }

  await h(t).withLog(`Given loginUser total umi is 1`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser);
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find 1 UMI in the left navigation panel Messages Entry', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(1);
  });

  await h(t).withLog('When I receive a new message in a directMessage conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, anotherUser);
  });

  await h(t).withLog('Then I can find 2 UMI in the left navigation panel Messages Entry', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(2);
  });

  await h(t).withLog('When I receive a new message in a directMessage conversation', async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find keep 2 UMI in the left navigation panel Messages Entry', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(2);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1273'],
  maintainers: ['potar.he'],
  keywords: ['moreMenu'],
})('Should not change its position in the conversation list when mark conversation as read/unread', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  const anotherUsers = users.filter(user => user.rcId !== loginUser.rcId);
  const chatsLength = 3;

  const chats = Array.from({ length: chatsLength }, (x, i) => <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUsers[i]]
  })

  await h(t).withLog(`Given I have  some 1:1 chat with at least 1 post`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats(chats);
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    for (let i = 0; i < chats.length; i++) {
      const anotherUser = chats[i].members.filter(user => user.rcId !== loginUser.rcId)[0];
      await h(t).scenarioHelper.sendTextPost(uuid(), chats[i], anotherUser);
    }
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const moreMenu = app.homePage.messageTab.moreMenu;

  for (let i = 0; i < chats.length; i++) {
    let chatId: string
    await h(t).withLog(`When I open moreMenu of nth({i}) conversation (id: {chatId}) of direct message section`, async (step) => {
      chatId = await directMessagesSection.nthConversationEntry(i).groupId;
      step.initMetadata({ i: i.toString(), chatId });
      await directMessagesSection.nthConversationEntry(i).openMoreMenu();
    });

    await h(t).withLog(`And click 'Mark as read' button`, async () => {
      await moreMenu.markAsReadOrUnread.enter();
    });

    await h(t).withLog(`Then The position is not changed in the conversation list`, async () => {
      await directMessagesSection.nthConversationEntry(i).groupIdShouldBe(chatId);
    });

    await h(t).withLog(`When I open moreMenu of nth({i}) conversation (id: {chatId}) of direct message section`, async (step) => {
      chatId = await directMessagesSection.nthConversationEntry(i).groupId;
      step.initMetadata({ i: i.toString(), chatId });
      await directMessagesSection.nthConversationEntry(i).openMoreMenu();
    });

    await h(t).withLog(`And click 'Mark as unread' button`, async () => {
      await moreMenu.markAsReadOrUnread.enter();
    });

    await h(t).withLog(`Then The position is not changed in the conversation list`, async () => {
      await directMessagesSection.nthConversationEntry(i).groupIdShouldBe(chatId);
    });
  }
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-126'],
  maintainers: ['ali.naffaa'],
  keywords: ['UMI'],
})('UMI should sync', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const chats = [
    { name: 'F1', umi: 2, type: 'DirectMessage' }, { name: 'F2', umi: 3, type: 'DirectMessage' },
    { name: 'DM1', umi: 2, type: 'DirectMessage' }, { name: 'DM2', umi: 3, type: 'DirectMessage' },
    { name: 'TM1', umi: 2, type: 'Team' }, { name: 'TM2', umi: 3, type: 'Team' },
  ];

  await h(t).withLog('Given user has F1(2) F2(3) T1(2) T2(3) DM1(2) DM2(3)', async () => {
    await createChats(t, chats, loginUser);
  });

  await h(t).withLog('And I set new_message_badges is groups_and_mentions', async () => {
    await h(t).glip(loginUser).setNewMessageBadges('groups_and_mentions');
  });

  await h(t).withLog('When I Tap conversation \'F1/DM1/T1\' in other clients', async () => {
    await h(t).glip(loginUser).markAsRead([getChatByName(chats, 'F1').id, getChatByName(chats, 'DM1').id, getChatByName(chats, 'TM1').id]);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;

  await h(t).withLog('Then No UMI in conversation \'F1/DM1/T1\' ', async () => {
    await favoritesSection.conversationEntryById(getChatByName(chats, 'F1').id).umi.shouldBeNumber(0);
    await directMessagesSection.conversationEntryById(getChatByName(chats, 'DM1').id).umi.shouldBeNumber(0);
    await teamsSection.conversationEntryById(getChatByName(chats, 'TM1').id).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I Collapsed Fav/DM/Teams section in Jupiter app', async () => {
    await directMessagesSection.fold();
    await teamsSection.fold();
    await favoritesSection.fold();
  });

  await h(t).withLog('And check UMI in Fav/DM/Teams section in Jupiter app', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(3);
    await directMessagesSection.headerUmi.shouldBeNumber(3);
    await teamsSection.headerUmi.shouldBeNumber(3);
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-161'],
  maintainers: ['ali.naffaa'],
  keywords: ['UMI'],
})('Jupiter navigation panel Messages should show the sum of messages UMI', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const chats = [
    { name: 'F1', umi: 1, type: 'DirectMessage' }, { name: 'F2', umi: 1, type: 'DirectMessage' },
    { name: 'DM1', umi: 1, type: 'DirectMessage' }, { name: 'DM2', umi: 2, type: 'DirectMessage' },
    { name: 'TM1', umi: 1, type: 'Team' }, { name: 'TM2', umi: 3, type: 'Team' },
  ];

  await h(t).withLog('Given user has F1(1) F2(1) T1(1) T2(3) DM1(1) DM2(2)', async () => {
    await createChats(t, chats, loginUser);
  });

  await h(t).withLog(`WHen I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog('Then check UMI in Messages UMI=2+3+4=9 ', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(9)
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-128'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['UMI']
})('should update UMI in the sections/conversations when mark conversations as read/unread.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).platform(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;


  let favoriteDirectMessageWithUmiId;
  let favoriteTeamWithUmiId;
  let directMessageWithUmiId;
  let teamWithUmiId;

  await h(t).withLog('Given I login Jupiter with {number}#{extension}', async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And Fav/DM/Team section is expanded', async () => {
    await t.expect(directMessagesSection.isExpand).ok();
    await t.expect(teamsSection.isExpand).ok();
    await t.expect(favoritesSection.isExpand).ok();
  });

  await h(t).withLog('And Fav/DM/Team section has multiple conversations with UMI and without UMI', async () => {

    const chats = [
      { name: 'F1', umi: 1, type: 'DirectMessage' }, { name: 'F2', umi: 1, type: 'Team' }, { name: 'F3', umi: 0, type: 'DirectMessage' }, { name: 'F4', umi: 0, type: 'Team' },
      { name: 'DM1', umi: 1, type: 'DirectMessage' },
      { name: 'TM1', umi: 1, type: 'Team' },
    ];
    await createChats(t, chats, loginUser);
    favoriteDirectMessageWithUmiId = getChatByName(chats, 'F1').id;
    favoriteTeamWithUmiId = getChatByName(chats, 'F2').id;
    directMessageWithUmiId = getChatByName(chats, 'DM1').id;
    teamWithUmiId = getChatByName(chats, 'TM1').id;

    await favoritesSection.conversationEntryById(favoriteDirectMessageWithUmiId).umi.shouldBeNumber(1);
    await favoritesSection.conversationEntryById(favoriteTeamWithUmiId).umi.shouldBeNumber(1);
    await directMessagesSection.conversationEntryById(directMessageWithUmiId).umi.shouldBeNumber(1);
    await teamsSection.conversationEntryById(teamWithUmiId).umi.shouldBeNumber(1);

    await favoritesSection.fold();
    await directMessagesSection.fold();
    await teamsSection.fold();

    await favoritesSection.headerUmi.shouldBeNumber(2);
    await directMessagesSection.headerUmi.shouldBeNumber(1);
    await directMessagesSection.headerUmi.shouldBeNumber(1);

    await favoritesSection.expand();
    await directMessagesSection.expand();
    await teamsSection.expand();
  });

  // Fav entry
  await h(t).withLog('When I mark DM Fav conversation as read', async () => {
    await favoritesSection.conversationEntryById(favoriteDirectMessageWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
    await favoritesSection.conversationEntryById(favoriteTeamWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then no UMI in the Fav conversation', async () => {
    await favoritesSection.conversationEntryById(favoriteDirectMessageWithUmiId).umi.shouldBeNumber(0);
    await teamsSection.conversationEntryById(favoriteTeamWithUmiId).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I collapsed Fav section', async () => {
    await favoritesSection.fold();
  });

  await h(t).withLog('Then UMI sum minus 1 for Fav section', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('When I mark DM/TM Fav conversations as unread', async () => {
    await favoritesSection.expand();
    await favoritesSection.conversationEntryById(favoriteDirectMessageWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
    await favoritesSection.conversationEntryById(favoriteTeamWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then UMI=1 for DM in Fav conversation', async () => {
    await favoritesSection.conversationEntryById(favoriteDirectMessageWithUmiId).umi.shouldBeNumber(1);
  });

  await h(t).withLog('And no change for TM in Fav conversation', async () => {
    await favoritesSection.conversationEntryById(favoriteTeamWithUmiId).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I collapsed Fav section', async () => {
    await favoritesSection.fold();
  });

  await h(t).withLog('Then UMI=1 for DM  and no UMI change for TM in Fav section', async () => {
    await favoritesSection.headerUmi.shouldBeNumber(1);
  });

  // DM entry
  await h(t).withLog('When I mark DM conversation as read', async () => {
    await directMessagesSection.conversationEntryById(directMessageWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then no UMI in the DM conversation', async () => {
    await directMessagesSection.conversationEntryById(directMessageWithUmiId).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I collapsed DM section', async () => {
    await directMessagesSection.fold();
  });

  await h(t).withLog('Then DM section UMI sum minus 1', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('When I mark DM conversation as unread', async () => {
    await directMessagesSection.expand();
    await directMessagesSection.conversationEntryById(directMessageWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then UMI=1 for DM conversation', async () => {
    await directMessagesSection.conversationEntryById(directMessageWithUmiId).umi.shouldBeNumber(1);
  });

  await h(t).withLog('When I collapsed DM section', async () => {
    await directMessagesSection.fold();
  });

  await h(t).withLog('Then UMI=1 for DM conversation', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(1);
  });

  // Team entry
  await h(t).withLog('When I mark Team conversation as read', async () => {
    await teamsSection.conversationEntryById(teamWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then no UMI in the Team conversation', async () => {
    await teamsSection.conversationEntryById(teamWithUmiId).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I collapsed Team section', async () => {
    await teamsSection.fold();
  });

  await h(t).withLog('Then Team section UMI sum minus 1', async () => {
    await teamsSection.headerUmi.shouldBeNumber(0);
  });

  await h(t).withLog('When I mark Team conversation as unread', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamWithUmiId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.enter();
  });

  await h(t).withLog('Then no change for UMI sum for Team conversation', async () => {
    await teamsSection.conversationEntryById(teamWithUmiId).umi.shouldBeNumber(0);
  });

  await h(t).withLog('When I collapsed Team section', async () => {
    await teamsSection.fold();
  });

  await h(t).withLog('Then no change for UMI sum for Team conversation', async () => {
    await teamsSection.headerUmi.shouldBeNumber(0);
  });
});

const createChats = async (t: TestController, chats: any, loginUser: IUser) => {
  const users = h(t).rcData.mainCompany.users.filter(user => user.rcId !== loginUser.rcId);
  for (let chatIndex = 0; chatIndex < chats.length; chatIndex++) {
    let post, team;
    if (chats[chatIndex].type.includes('Team')) {
      post = `![:Person](${loginUser.rcId}), ${uuid()}`; // mention for team
      team = <IGroup>{ type: 'Team', name: uuid(), owner: loginUser, members: [loginUser, users[chatIndex]] };
    } else {
      post = ` post:${uuid()}`;
      team = <IGroup>{ type: 'DirectMessage', owner: loginUser, members: [loginUser, users[chatIndex]] };
    }
    await h(t).scenarioHelper.createTeamsOrChats([team]).then(() => chats[chatIndex].id = team.glipId);
    for (const i of _.range(chats[chatIndex].umi)) {
      await h(t).scenarioHelper.sendTextPost(post + i, team, team.members[1]);
    }
  }
  const favoriteChats = chats.filter(chat => chat.name.includes('F'));
  await h(t).glip(loginUser).favoriteGroups(favoriteChats.map(chat => chat.id));
};

const getChatByName = (chats: any, name: string) => {
  return chats.filter(chat => chat.name === name)[0];
};
