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

test(formalName('The posts in the conversation should be displayed in the order of recency (date/time)',
  ['P1', 'JPT-52', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const msgList = _.range(3).map(i => `${i} ${uuid()}`);
    const userPlatform = await h(t).getPlatform(user);

    let teamId;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      });

    await h(t).withLog('Then I enter the conversation', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await teamsSection.conversationEntryById(teamId).enter();
    });

    await h(t).withLog('When I send 3 posts in order via API', async () => {
      for (const msg of msgList) {
        await userPlatform.createPost({ text: msg }, teamId);
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
  }
);

test(formalName('No post in conversation when the conversation', ['P2', 'JPT-53', 'ConversationStream']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    let teamId;
    const userPlatform = await h(t).getPlatform(user);

    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
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
    const user = users[4];
    const userPlatform = await h(t).getPlatform(user);

    const msgBeforeLogin = `send before login ${uuid()}`;
    const msgAfterLogin = `send after login ${uuid()}`;

    let teamId;
    await h(t).withLog('Given I have an extension with 1 team chat', async () => {
      teamId = (await userPlatform.createGroup({
        isPublic: true,
        name: `Team ${uuid()}`,
        type: 'Team',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      })).data.id;
    });

    await h(t).withLog(`And a post "${msgBeforeLogin}" is sent before login`, async () => {
      await userPlatform.createPost({ text: msgBeforeLogin }, teamId);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
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
      await userPlatform.createPost({ text: msgAfterLogin }, teamId);
    });

    await h(t).withLog(`Then I should find this post "${msgAfterLogin}" at the end of conversation`, async () => {
      const posts = await app.homePage.messageTab.conversationPage.posts;
      await t.expect(posts.nth(-1).withText(msgAfterLogin).exists).ok();
    });
  }
);
