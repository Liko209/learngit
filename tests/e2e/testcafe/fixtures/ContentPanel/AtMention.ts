/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-06-05 13:57:26
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Link')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2268'],
  maintainers: ['chris.zhan'],
  keywords: ['message', 'url', 'AtMentions'],
})('Check "<XXX> text <XXX> @someone" show in message field', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId
  await h(t).withLog(`And the team has a post with '<XXX> text <XXX> @someone'`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`<user name> test <password> ![:Person](${otherUser.rcId})`, team, loginUser);
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`Then display the post`, async () => {
    await conversationPage.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post should be rendered correctly`, async () => {
    await t.expect(conversationPage.postItemById(postId).text.textContent).contains('<user name> test <password>');
    await t.expect(conversationPage.postItemById(postId).mentions.exists).ok();
  });

});
