/*
*
* @Author: Zack Zheng
* @Date: 8/28/2019 16:34:14
* Copyright © RingCentral. All rights reserved.
*/

import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';


fixture('LeftNav/NavigationPanel')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2927'],
  maintainers: ['zack'],
  keywords: ['SwitchTab']
})('Should keep conversation position when switch back from other tab', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let postId: string;
  await h(t).withLog('Given I have 1 bookmark post in team(out of screen)', async () => {
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(
      `${uuid()}, ![:Person](${loginUser.rcId})`,
      team, otherUser
    );
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, otherUser);
    }

    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).bookmarkPosts(postId);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      name: loginUser.company.number,
      extension: loginUser.extension
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const bookmarkEntry = app.homePage.messageTab.bookmarksEntry;
  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I enter bookmark page', async () => {
    await bookmarkEntry.enter();
  });

  await h(t).withLog('When I hover the at bookmark post then click button - "Jump to conversation"', async () => {
    await bookmarkPage.postItemById(postId).hoverPostAndClickJumpToConversationButton();
  });

  await h(t).withLog(`Then I should jump to the bookmark post position in the team `, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.groupIdShouldBe(team.glipId);
    await conversationPage.postCardByIdShouldBeOnTheTop(postId);
  });
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const messageEntry = app.homePage.leftPanel.messagesEntry;
  await h(t).withLog(`When I swtich to another tab (Setting)`, async () => {
    await settingsEntry.enter();
  });
  await h(t).withLog(`And I back to Message tab`, async () => {
    await messageEntry.enter();
  });
  await h(t).withLog(`Then conversation should keep previous postion`, async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.groupIdShouldBe(team.glipId);
    await conversationPage.postCardByIdShouldBeOnTheTop(postId);
  });
});
