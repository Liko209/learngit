import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { SITE_URL } from '../../config';
import { AppRoot } from '../../v2/page-models/AppRoot';

declare var test: TestFn;
fixture('ConversationStream/ConversationStream')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName(
    'The posts in the conversation should be displayed in the order of recency (date/time)',
    ['P1', 'JPT-52', 'ConversationStream'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const msgList = ['First post','Second post','Third post']
    let teamId;
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);

    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `My Team ${Math.random().toString(10)} `,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I enter the conversation', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation)
    });

    await h(t).withLog('When I send 3 posts in order via API', async () => {
      await msgList.forEach(async (msg) => {
        await userPlatform.createPost({ text: msg }, teamId);
        await t.wait(2e3)
      })
    });

    await h(t).withLog('Then the conversation must display the 3 posts in order.', async () => {
      await t.wait(3e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      const length = await posts.count
      for (let i = 0; i < length; i = i + 1) {
        await t.expect(posts.nth(i).child('div').nth(1)
        .child('div').nth(1).textContent)
        .eql(msgList[i]);
      }
    });
  }
);

test(
  formalName('No post in conversation when the conversation', 
  ['P2','JPT-53','ConversationStream',]
),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    let teamId;
    const userPlatform = await h(t).getPlatform(user);
    
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `My Team ${Math.random().toString(10)} `,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can enter the conversation', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation);
    });

    await h(t).withLog('And I can not find  any post in the new created conversation', async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.exists).notOk("no post");
    });
  }
);

test(
  formalName(
    'Should be able to read the newest posts once open a conversation',
    ['P0', 'JPT-65', 'ConversationStream'],
  ),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    let teamId;
    const lastPost = "last post";
    const newPost = "new post";


    const userPlatform = await h(t).getPlatform(user);
    
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `My Team ${Math.random().toString(10)}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    }); 

    await h(t).withLog(`Then I send a post "${lastPost}" to the team before login`, async () => {
        await userPlatform.createPost({ text: lastPost }, teamId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can enter the team conversation', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation);
    });

    await h(t).withLog(`And I can find post "${lastPost}"  in the conversation posts history`, async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.nth(-1).textContent).contains(lastPost);
    })

    await h(t).withLog(`When I receive a post: "${newPost}"`, async () => {
      await userPlatform.createPost({ text: newPost }, teamId);
    });

    await h(t).withLog(`Then I can check the newest post is "${newPost}"`, async () => {
      await t.wait(1e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.nth(-1).textContent).contains(newPost);
    });
  }
);