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
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(posts.withText(new RegExp(msgList.join('|'))).count).eql(3, { timeout: 5e3 });
    }, true);

    await h(t).withLog('And the 3 posts must be in correct order', async () => {
      const posts = await app.homePage.messageTab.conversationPage.posts;
      for (let i = 0; i < msgList.length; i++) {
        await t.expect(posts.nth(-msgList.length + i).withText(msgList[i]).exists).ok();
      }
    });

    await h(t).withLog('And the posts is at the bottom of conversationStream',async ()=>{
       await app.homePage.messageTab.conversationPage.expectStreamScrollToBottom()
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
      await t.wait(2e3);
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

    await h(t).withLog(`Then I should find post "${msgBeforeLogin}" in the conversation posts history`, async () => {
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(posts.nth(-1).withText(msgBeforeLogin).exists).ok();
    })

    await h(t).withLog(`When I send another post: "${msgAfterLogin}"`, async () => {
      await h(t).platform(loginUser).createPost({ text: msgAfterLogin }, teamId);
    });

    await h(t).withLog(`Then I should find this post "${msgAfterLogin}" at the end of conversation`, async () => {
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(posts.nth(-1).withText(msgAfterLogin).exists).ok();
    });

    await h(t).withLog('And the post is at the bottom of conversationStream',async ()=>{
       await app.homePage.messageTab.conversationPage.expectStreamScrollToBottom()
    })

  }
);

test(formalName('Conversation list scrolling when sending massage', ['JPT-106', 'P2','Wayne.Zhou', 'Stream']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[6];
  const userPlatform = await h(t).getPlatform(user);

  let conversation;
  await h(t).withLog('Given I have an extension with a conversation', async () => {
    conversation = (await userPlatform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;
  });

  await h(t).withLog('And this conversation 20 message',
    async () => {
      for (let i of _.range(20)) {
         await userPlatform.createPost({ text: `${i} ${uuid()}` }, conversation)
      }
    }
  )

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('And enter the team conversation',
    async () => {
      await teamsSection.expand();
      await teamsSection.conversationEntryById(conversation).enter();
      await teamsSection.ensureLoaded();
    }
  );

  await h(t).withLog('And scroll to middle of page',
    async () => {
      await t.wait(3e3)
      await app.homePage.messageTab.conversationPage.scrollToY(0)
    }
  )

  const conversationPage = app.homePage.messageTab.conversationPage;
  const message = `${uuid()}`
  await h(t).withLog('When I send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
  });

  await h(t).withLog('Then I should see the newest post in bottom of stream section',
    async () => {
      await t.wait(3e1)
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await conversationPage.expectStreamScrollToBottom()
      console.log(await posts.nth(-1)())
      await t.expect(posts.nth(-1).withText(message).exists).ok()
    }
  )


  const anotherMessage = `${uuid()}`
  await h(t).withLog('When I send another message to this conversation', async () => {
    await t.wait(3e1)
    await conversationPage.sendMessage(anotherMessage);
  });

  await h(t).withLog('Then I should see the newest post in bottom of stream section',
    async () => {
      await t.wait(3e1)
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await conversationPage.expectStreamScrollToBottom()
      console.log(await posts.nth(-1)())
      await t.expect(posts.nth(-1).withText(anotherMessage).exists).ok()
    }
  )
})

