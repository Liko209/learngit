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


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2269'],
  maintainers: ['chris.zhan'],
  keywords: ['message', 'url', 'AtMentions'],
})('Check @Team mention message display correctly', async (t) => {
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
  await h(t).withLog(`And the team has a post with @Team`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi all, <a class='at_mention_compose' rel='{"id":-1}'>@Team</a>`, team, loginUser);
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

  const post = conversationPage.postItemById(postId)
  const atMention = post.mentions.nth(0);
  await h(t).withLog(`And the post render the @Team`, async () => {
    await t.expect(atMention.exists).ok();
    await t.expect(atMention.textContent).eql('Team'); // inner text is 'Team'
    await t.expect(atMention.hasClass('current')).ok(); // @ current user highlight
  });

  await h(t).withLog(`When I click the @Team`, async () => {
    await t.click(atMention);
  });

  await h(t).withLog(`Then I can see mini profile of current team`, async () => {
    await t.expect(app.homePage.miniProfile.groupName.textContent).eql(team.name);
  });

  await h(t).withLog(`When I quote the post with @Team`, async () => {
    await post.clickMoreItemOnActionBar();
    await post.actionBarMoreMenu.quoteItem.enter();
  });

  await h(t).withLog(`And the input box message should be correct`, async () => {
    const userName = await post.name.textContent;
    const reg = new RegExp(`@${userName}.*wrote:.*>.*@Team`, 'gm');
    await t.expect(conversationPage.messageInputArea.textContent).match(reg);
  });

  await h(t).withLog('And the cursor should keep in input box', async () => {
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  await h(t).withLog(`When I press enter`, async () => {
    await t.pressKey('enter');
  });

  await h(t).withLog(`Then the post with quote should be sent`, async () => {
    await t.expect(conversationPage.lastPostItem.quote.textContent).contains('@Team');
  });
});
