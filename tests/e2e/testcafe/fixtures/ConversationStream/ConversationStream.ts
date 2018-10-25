import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { GlipSdk } from '../../v2/sdk/glip';
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
    const user = users[0];
    const msgList = ["1","2","3"]
    let teamId;

    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    await h(t).withLog('Prepare I have one team', async () => {
      teamId = (await glipSDK.createTeam(
        `My Team ${Math.random().toString(10)}`, 
        [+user.glipId, +users[1].glipId, +users[2].glipId]
        )).data._id
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('check team in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${teamId}"]`).exists).ok();
    }, true);

    await h(t).withLog('send post messages by sequense', async () => {
      msgList.forEach(async msg=>{
        await glipSDK.sendPost(teamId, msg);
        await t.wait(1e3)
      })
    }, true);

    await h(t).withLog('entry team', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation)
    }, true);

    await h(t).withLog('Then I can read all posts in first teams section', async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      const length = posts.length;
      for (let i=0; i < length; i++) {
        await t.expect(posts.nth(i).child('div').nth(1)
        .child('div').nth(1).textContent)
        .eql(msgList[i].trim());
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
    const user = users[0];
    let teamId;

    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);
    await h(t).withLog('Prepare I have one team', async () => {
      teamId = (await glipSDK.createTeam(
        `My Team ${Math.random().toString(10)}`, 
        [+user.glipId, +users[1].glipId, +users[2].glipId]
        )).data._id
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('check team in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${teamId}"]`).exists).ok();
    }, true);

    await h(t).withLog('entry team', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation)
    },true);

    await h(t).withLog('check no post in new created team', async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.exists).notOk("no post");
    }, true);
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
    const user = users[0];
    let teamId;
    const lastPost = "lastPost"
    const newPost = "newPost"

    const glipSDK: GlipSdk = await h(t).sdkHelper.sdkManager.getGlip(user);

    await h(t).withLog('Prepare I have one team', async () => {
      teamId = (await glipSDK.createTeam(
        `My Team ${Math.random().toString(10)}`, 
        [+user.glipId, +users[1].glipId, +users[2].glipId]
        )).data._id
    });

    await h(t).withLog('send post messages "lastPost"', async () => {
        await glipSDK.sendPost(teamId, "lastPost");
        await t.wait(1e3)
    }, true);

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('check team in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t.expect(teamsSection.conversations.filter(`[data-group-id="${teamId}"]`).exists).ok();
    }, true);

    await h(t).withLog('entry team', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      const teamConversation =  teamsSection.conversations.filter(`[data-group-id="${teamId}"]`);
      await t.click(teamConversation)
    },true);

    await h(t).withLog('check last post at last one of conversation posts', async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.nth(-1).textContent)
        .contains(lastPost.trim());
    }, true);

    await h(t).withLog('send post messages "newPost"', async () => {
      await glipSDK.sendPost(teamId, "newPost");
    }, true);

    await h(t).withLog('check new post at last one of conversation posts', async () => {
      await t.wait(2e3);
      const posts = await app.homePage.messagePanel.conversationSection.posts;
      await t.expect(posts.nth(-1).textContent)
        .contains(newPost.trim());
    }, true);
})