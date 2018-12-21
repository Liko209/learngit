/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-13 13:26:25
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('AtMention/AtMention')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Data in mention page should be dynamically sync', ['P2', 'JPT-311']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const postListPage = app.homePage.messageTab.postListPage;
    let group;
    await h(t).withLog('Given I have an extension with 2 at-mention posts', async () => {
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      await user5Platform.sendTextPost(
        `Hi, ![:Person](${user.rcId})`,
        group.data.id,
      );
      await user5Platform.sendTextPost(
        `Hi again, ![:Person](${user.rcId})`,
        group.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(2);
    }, true);

    let newPost;
    await h(t).withLog('Then I send a new post to user with mention', async () => {
      newPost = await user5Platform.sendTextPost(
        `Test add a mention, ![:Person](${user.rcId})`,
        group.data.id,
      );
    });

    await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(3);
    }, true);

    await h(t).withLog('Then I delete the new post', async () => {
      const user5Glip = await h(t).getGlip(users[5]);
      await user5Glip.deletePost(newPost.data.id, group.data.id);
    });

    await h(t).withLog('Then I can find 2 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(2);
    }, true);
  },
);

test(formalName('Jump to conversation bottom when click name and conversation show in the top of conversation list', ['P2', 'JPT-314', 'JPT-463']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const postListPage = app.homePage.messageTab.mentionPage;
    const conversationPage = app.homePage.messageTab.conversationPage;
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;
    const teamsSection = app.homePage.messageTab.teamsSection;

    let chat, group, team;
    let chatPost, groupPost, teamPost;
    await h(t).withLog('Given I have an extension with 3 different types of conversations and each has a post with mention', async () => {
      chat = await userPlatform.createGroup({
        type: 'PrivateChat', members: [user.rcId, users[5].rcId],
      });
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      team = await userPlatform.createGroup({
        type: 'Team',
        name: `Team ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
      chatPost = await user5Platform.sendTextPost(
        `Hi, ![:Person](${user.rcId})`,
        chat.data.id,
      );
      groupPost = await user5Platform.sendTextPost(
        `Hi, ![:Person](${user.rcId})`,
        group.data.id,
      );
      teamPost = await user5Platform.sendTextPost(
        `Hi, ![:Person](${user.rcId})`,
        team.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 3 posts in the mentions page', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.posts.count).eql(3);
    }, true);

    await h(t).withLog('Then I click the conversation name in the chat\'s conversation card', async () => {
      await postListPage.postItemById(chatPost.data.id).jumpToConversationByClickName();
    });

    await h(t).withLog('Should jump to the chat page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(chat.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('And conversation should display in the top of conversation list', async () => {
      await directMessagesSection.nthConversationEntry(0).groupIdShouldBe(chat.data.id);
    });

    await h(t).withLog('Then I click the conversation name in the group\'s conversation card', async () => {
      await mentionsEntry.enter();
      await postListPage.postItemById(groupPost.data.id).jumpToConversationByClickName();
    });

    await h(t).withLog('Should jump to the group page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(group.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('And conversation should display in the top of conversation list', async () => {
      await directMessagesSection.nthConversationEntry(0).groupIdShouldBe(group.data.id);
    });

    await h(t).withLog('Then I click the conversation name in the team\'s conversation card', async () => {
      await mentionsEntry.enter();
      await postListPage.postItemById(teamPost.data.id).jumpToConversationByClickName();
    });

    await h(t).withLog('Should jump to the team page and scroll to bottom', async () => {
      await conversationPage.groupIdShouldBe(team.data.id);
      await conversationPage.expectStreamScrollToBottom();
    });

    await h(t).withLog('And conversation should display in the top of conversation list', async () => {
      await teamsSection.nthConversationEntry(0).groupIdShouldBe(team.data.id);
    });
  },
);

test(formalName('Remove UMI when jump to conversation which have unread messages.', ['P2', 'JPT-380', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    await h(t).resetGlipAccount(user);
    const userPlatform = await h(t).getPlatform(user);
    const user5Platform = await h(t).getPlatform(users[5]);
    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const postListPage = app.homePage.messageTab.postListPage;
    const postMentionPage = app.homePage.messageTab.mentionPage;
    user.sdk = await h(t).getSdk(user);
    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let group;
    await h(t).withLog('Given I have an only one group and the group should not be hidden', async () => {
      group = await userPlatform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId],
      });
      await user.sdk.glip.showGroups(user.rcId, group.data.id);
    });

    let newPost;
    await h(t).withLog('And I have an AtMention post', async () => {
      newPost = await user5Platform.sendTextPost(
        `Hi AtMention, ![:Person](${user.rcId})`,
        group.data.id,
      );
    }, true);

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I enter AtMention page and find the AtMention posts', async () => {
      await mentionsEntry.enter();
      await t.expect(postListPage.find('[data-name="conversation-card"]').count).eql(1);
    }, true);

    await h(t).withLog('Then the UMI should exist', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.expectHeaderUmi(1);
    })

    await h(t).withLog('When I click the post and jump to the conversation', async () => {
      await postMentionPage.postItemById(newPost.data.id).jumpToConversationByClickPost();
    });

    await h(t).withLog('And the UMI should dismiss', async () => {
      await directMessagesSection.expectHeaderUmi(0);
    }, true);

    await h(t).withLog('Then I nagivate away from conversation and refresh browser', async () => {
      await mentionsEntry.enter();
      await h(t).refresh();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the UMI count should still no UMI', async () => {
      await directMessagesSection.fold();
      await directMessagesSection.expectHeaderUmi(0);
    }, true);
  }
);

//Feature bug: FIJI-2135
test.skip(formalName('Show UMI when receive new messages after jump to conversation.', ['P2', 'JPT-384', 'zack']), async (t: TestController) => {
  if (await H.isEdge()) {
    await h(t).log('Skip: This case is not working on Edge due to a Testcafe bug (FIJI-1758)');
    return;
  }

  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).resetGlipAccount(user);
  const userPlatform = await h(t).getPlatform(user);
  const user5Platform = await h(t).getPlatform(users[5]);
  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const postMentionPage = app.homePage.messageTab.mentionPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  user.sdk = await h(t).getSdk(user);
  const msgList = _.range(20).map(i => `${i} ${uuid()}`);

  let group;
  let newPost;
  await h(t).withLog('Given I have an AtMention message from the conversation', async () => {
    group = await userPlatform.createGroup({
      type: 'Group', members: [user.rcId, users[5].rcId],
    });
    await user.sdk.glip.showGroups(user.rcId, group.data.id);
    newPost = await user5Platform.sendTextPost(
      `First AtMention, ![:Person](${user.rcId})`,
      group.data.id,
    );
  });

  await h(t).withLog('And I also have 20 non AtMention messages in conversation', async () => {
    for (const msg of msgList) {
      await userPlatform.sendTextPost(msg, group.data.id);
      await t.wait(1e3);
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('And I jump to conversation from AtMentions page should no UMI', async () => {
    await mentionsEntry.enter();
    await postMentionPage.postItemById(newPost.data.id).jumpToConversationByClickPost();
    await directMessagesSection.expectHeaderUmi(0);
  }, true);

  await h(t).withLog('Then I received new AtMention post should 1 UMI', async () => {
    await user5Platform.sendTextPost(
      `Just for UMI, ![:Person](${user.rcId})`,
      group.data.id,
    );
    await directMessagesSection.fold();
    await directMessagesSection.expectHeaderUmi(1);
  });

  await h(t).withLog('And I scroll to middle should still 1 UMI', async () => {
    await conversationPage.scrollToMiddle();
    await directMessagesSection.expectHeaderUmi(1);
  }, true);

  await h(t).withLog('When I scroll to conversation bottom should remove UMI', async () => {
    await conversationPage.scrollToBottom();
    await directMessagesSection.expectHeaderUmi(0);
  });
});


test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-315', 'zack']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const user5Platform = await h(t).getPlatform(users[5]);
    user.sdk = await h(t).getSdk(user);

    const mentionsEntry = app.homePage.messageTab.mentionsEntry;
    const postMentionPage = app.homePage.messageTab.mentionPage;
    const conversationPage = app.homePage.messageTab.conversationPage;

    let verifyTextTeam = 'First AtMention in Team';
    let verifyTextChat = 'First AtMention in pvChat';

    let teamId, pvChatId, atMentionPostTeam, atMentionPostChat;
    await h(t).withLog('Given I have 1 AtMention post in team ,one in group', async () => {
      teamId = (await user.sdk.platform.createGroup({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
      pvChatId = (await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId],
      })).data.id;

      await user.sdk.glip.showGroups(user.rcId, [teamId, pvChatId]);
      await user.sdk.glip.clearFavoriteGroupsRemainMeChat();

      atMentionPostTeam = await user5Platform.sendTextPost(
        verifyTextTeam + `, ![:Person](${user.rcId})`,
        teamId,
      );
      atMentionPostChat = await user5Platform.sendTextPost(
        verifyTextChat + `, ![:Person](${user.rcId})`,
        pvChatId,
      );

    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I enter AtMentions page', async () => {
      await mentionsEntry.enter();
    });

    await h(t).withLog('And I click the post item', async () => {
      await postMentionPage.postItemById(atMentionPostTeam.data.id).jumpToConversationByClickPost();
    });

    await h(t).withLog('Then I can see the AtMention post in the team', async () => {
      await t
        .expect(conversationPage.postItemById(atMentionPostTeam.data.id).body.withText(verifyTextTeam).exists)
        .ok({ timeout: 5e3 });
    }, true);

    await h(t).withLog('When I back to AtMention page', async () => {
      await mentionsEntry.enter();
    });

    await h(t).withLog('And I click AtMention post item from pvChat', async () => {
      await postMentionPage.postItemById(atMentionPostChat.data.id).clickConversationByButton();
    });

    await h(t).withLog('Then I can see the AtMention post in the pvChat', async () => {
      await t
        .expect(conversationPage.postItemById(atMentionPostChat.data.id).body.withText(verifyTextChat).exists)
        .ok({ timeout: 5e3 });
    });
  });
