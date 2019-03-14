import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { SITE_URL, BrandTire } from '../../config';
import { AppRoot } from '../../v2/page-models/AppRoot';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check the posts display and the order', ['P1', 'JPT-52', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();

    const msgList = _.range(3).map(i => `${i} ${uuid()}`);

    let teamId;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      });

    const posts = app.homePage.messageTab.conversationPage.posts;
    await h(t).withLog('And I enter the conversation', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    await h(t).withLog('And I send 3 posts in order via API', async () => {
      for (const msg of msgList) {
        await h(t).platform(loginUser).createPost({ text: msg }, teamId);
        await t.wait(1e3)
      }
    });

    await h(t).withLog('Then I will receive those 3 posts', async () => {
      await t.expect(posts.withText(new RegExp(msgList.join('|'))).count).eql(3, { timeout: 5e3 });
    }, true);

    await h(t).withLog('And the 3 posts must be in correct order', async () => {
      for (let i = 0; i < msgList.length; i++) {
        await t.expect(posts.nth(-msgList.length + i).withText(msgList[i]).exists).ok();
      }
    });

    await h(t).withLog('And the posts is at the bottom of conversationStream', async () => {
      await app.homePage.messageTab.conversationPage.expectStreamScrollToBottom();
    })
  }
);

test(formalName('No post in conversation when the conversation', ['P2', 'JPT-53', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();

    let teamId;

    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      });

    await h(t).withLog('Then I can enter the conversation', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    await h(t).withLog('And I should not find any post in the new created conversation', async () => {
      const postsSelector = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(postsSelector.exists).notOk();
    });
  }
);

test(formalName('Should be able to read the newest posts once open a conversation',
  ['P0', 'JPT-65', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();

    const msgBeforeLogin = `send before login ${uuid()}`;
    const msgAfterLogin = `send after login ${uuid()}`;

    let teamId;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    });

    await h(t).withLog(`And a post "${msgBeforeLogin}" is sent before login`, async () => {
      await h(t).platform(loginUser).createPost({ text: msgBeforeLogin }, teamId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      });

    await h(t).withLog('And enter the team conversation', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    const posts = app.homePage.messageTab.conversationPage.posts;
    await h(t).withLog(`Then I should find post "${msgBeforeLogin}" in the conversation posts history`, async () => {
      await t.expect(posts.nth(-1).withText(msgBeforeLogin).exists).ok();
    })

    await h(t).withLog(`When I send another post: "${msgAfterLogin}"`, async () => {
      await h(t).platform(loginUser).createPost({ text: msgAfterLogin }, teamId);
    });

    await h(t).withLog(`Then I should find this post "${msgAfterLogin}" at the end of conversation`, async () => {
      await t.expect(posts.nth(-1).withText(msgAfterLogin).exists).ok();
    });

    await h(t).withLog('And the post is at the bottom of conversationStream', async () => {
      await conversationPage.expectStreamScrollToBottom();
    });
  }
);

// skip by a bug: https://jira.ringcentral.com/browse/FIJI-3309
test.skip(formalName('Conversation list scrolling when sending massage', ['JPT-106', 'P2', 'Wayne.Zhou', 'Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser= users[6];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();
  const meChatId = await h(t).glip(loginUser).getPersonPartialData('me_group_id');

  const imagePaths = ['../../sources/1.png','../../sources/2.png'];
  const imageNames = ['1.png','2.png'];

  let conversationId;
  await h(t).withLog('Given I have an extension with a conversation', async () => {
    conversationId = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('And this conversation 20 message', async () => {
    for (let i of _.range(20)) {
      await h(t).platform(loginUser).createPost({ text: `${i} ${uuid()}` }, conversationId);
    }
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const favoriteSection = app.homePage.messageTab.favoritesSection;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And enter the team conversation', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversationId).enter();
  });

  await h(t).withLog('And scroll to middle of page', async () => {
    await conversationPage.scrollToMiddle();
  });

  const message = `${uuid()}`;
  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message, { paste: true });
  });

  await h(t).withLog('Then I should see the newest post in bottom of stream section', async () => {
    await t.wait(1e3);
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.nthPostItem(-1).body.withText(message).exists).ok();
  });

  const anotherMessage = `${uuid()}`;
  await h(t).withLog('When I send another message to this conversation', async () => {
    await conversationPage.sendMessage(anotherMessage, { paste: true });
  });

  await h(t).withLog('Then I should see the newest post in bottom of stream section', async () => {
    await t.wait(1e3);
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.nthPostItem(-1).body.withText(anotherMessage).exists).ok();
  });

  await h(t).withLog('When I scroll to middle of page and send a image A post', async () => {
    await conversationPage.scrollToMiddle();
    await conversationPage.uploadFilesToMessageAttachment(imagePaths[0]);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.nthPostItem(-1).waitImageVisible();
  });

  await h(t).withLog('Then I should see the post with image A in bottom of stream section', async () => {
    await t.wait(1e3);
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.nthPostItem(-1).fileNames.withText(imageNames[0]).exists).ok();
  });

  await h(t).withLog('When I send a image B post', async () => {
    await conversationPage.uploadFilesToMessageAttachment(imagePaths[1]);
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    await conversationPage.nthPostItem(-1).waitImageVisible();
  });

  await h(t).withLog('Then I should see the post with image B in bottom of stream section', async () => {
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.nthPostItem(-1).fileNames.withText(imageNames[1]).exists).ok();
  });

  await h(t).withLog('When I enter other conversation and come bask  post', async () => {
    await favoriteSection.conversationEntryById(meChatId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await teamsSection.conversationEntryById(conversationId).enter();
  });

  await h(t).withLog('Then I should see the post with image B in bottom of stream section', async () => {
    await conversationPage.expectStreamScrollToBottom();
    await t.expect(conversationPage.nthPostItem(-1).fileNames.withText(imageNames[1]).exists).ok();
  });
});