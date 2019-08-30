/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-25 14:41:39
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../init';
import { h } from '../v2/helpers';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta, IGroup } from '../v2/models';

fixture('ConversationStream/AudioConference')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2544'],
  maintainers: ['alessia.li'],
  keywords: ['Unsent Messages', 'Network']
})('Display tooltip when hover on progressActions of unsent messages.', async (t: TestController) => {
  const app = new AppRoot(t);
  const postContent = `some random text post`;
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const messageTab = app.homePage.messageTab;

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog('Given team T1 initial member only login user.', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog(`And I enter the team conversation`, async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  let postData;
  await h(t).withLog(`When I disconnect network and send one post to current conversation`, async () => {
    await h(t).turnOffNetwork();
    postData = await h(t).platform(loginUser).sendTextPost(postContent, team.glipId).then(res => res.data);
  });

  let targetPost;
  await h(t).withLog(`Then I can see an unsent post in conversation stream`, async () => {
    targetPost = messageTab.conversationPage.postItemById(postData.id);
    await t.expect(targetPost.exists).ok();
    // TODO: 判断 post 为未发送类型
  });

  await h(t).withLog(`When I hover "reload" icon`, async () => {
    await t.hover(targetPost.progressActions.resendPost);
  });

  const resendTooltip = 'Resend post';
  const editTooltip = 'Edit post';
  const deleteTooltip = 'Delete post';
  await h(t).withLog(`Then there should be tooltip displayed '${resendTooltip}`, async () => {
    await targetPost.showTooltip(resendTooltip);
  });

  await h(t).withLog(`When I hover "edit" icon`, async () => {
    await t.hover(targetPost.progressActions.editPost);
  });

  await h(t).withLog(`Then there should be tooltip displayed '${editTooltip}`, async () => {
    await targetPost.showTooltip(editTooltip);
  });

  await h(t).withLog(`When I hover "delete" icon`, async () => {
    await t.click(targetPost.progressActions.deletePost);
  });

  await h(t).withLog(`Then there should be tooltip displayed '${deleteTooltip}`, async () => {
    await targetPost.showTooltip(deleteTooltip);
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2549'],
  maintainers: ['alessia.li'],
  keywords: ['Unsent Messages', 'Network']
})('Can resent the failed post success with new edited content.', async (t: TestController) => {
  const app = new AppRoot(t);
  const postContent = `some random text post`;
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const messageTab = app.homePage.messageTab;
  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog('Given team T1 initial member only login user.', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  await h(t).withLog(`And I enter the team conversation`, async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  let postData;
  await h(t).withLog(`When I disconnect network and send one post to current conversation`, async () => {
    await h(t).turnOffNetwork();
    postData = await h(t).platform(loginUser).sendTextPost(postContent, team.glipId).then(res => res.data);
  });

  let targetPost;
  await h(t).withLog(`Then I can see an unsent post in conversation stream`, async () => {
    targetPost = messageTab.conversationPage.postItemById(postData.id);
    await t.expect(targetPost.exists).ok();
    // TODO: 判断 post 为未发送类型
  });

  await h(t).withLog(`When I click the [Edit post] button`, async () => {
    await t.click(targetPost.progressActions.editPost);
  });

  await h(t).withLog(`Then the post should enter editing mode`, async () => {
    await t.expect(targetPost.editTextArea.exists).ok();
  });

  const newText = `${postContent} more content`;
  await h(t).withLog(`When I edit content and click 'Enter' key`, async () => {
    await h(t).turnOnNetwork();
    await targetPost.editMessage(newText);
  });

  await h(t).withLog(`Then it should resend the failed post successfully with new edited content.`, async () => {
    await t.expect(targetPost.text.withText(newText).exists).ok();
    // TODO: 判断为正常 post
  });
});

