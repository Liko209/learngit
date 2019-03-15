/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-17 14:12:50
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Send message for link and display on the right rail', ['Skye', 'Devin', 'P1', 'JPT-818']), async t => {
  const message = ['http://www.google.com', 'http://google.com'];
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and send a link', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.sendMessage(message[0]);
  });

  const linkTab = rightRail.linksTab;
  await h(t).withLog('And I click Links Tab', async () => {
    await rightRail.openMore();
    await rightRail.linksEntry.enter();
    await rightRail.linksEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The links number is correct: 1', async () => {
    // await linkTab.countOnSubTitleShouldBe(1);
    await linkTab.countInListShouldBe(1);
  });

  await h(t).withLog('When I send second link', async () => {
    await conversationPage.sendMessage(message[1]);
  });

  await h(t).withLog('Then The links number is correct: 2', async () => {
    // await linkTab.countOnSubTitleShouldBe(2);
    await linkTab.countInListShouldBe(2);
  });

  const deletePostDialog = app.homePage.messageTab.deletePostModal;
  await h(t).withLog('When I delete the last post', async () => {
    await conversationPage.nthPostItem(-1).clickMoreItemOnActionBar();
    await conversationPage.nthPostItem(-1).actionBarMoreMenu.deletePost.enter();
    await deletePostDialog.delete();
  });

  await h(t).withLog('Then The links number is correct: 1', async () => {
    // await linkTab.countOnSubTitleShouldBe(1);
    await linkTab.countInListShouldBe(1);
  });
});


test(formalName('Deleted link will NOT show under Links tab', ['P1', 'JPT-1342', 'Potar.He', 'RightRail']), async t => {

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const url = `http://${uuid()}.com`;
  const textWithUrl = `${uuid()} ${url}`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open a team and send post with a link ${textWithUrl}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.sendMessage(textWithUrl);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const linkTab = rightRail.linksTab;
  await h(t).withLog('And I click Links Tab', async () => {
    await rightRail.openMore();
    await rightRail.linksEntry.enter();
    await rightRail.linksEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The links number is correct: 1', async () => {
    // await linkTab.countOnSubTitleShouldBe(1);
    await linkTab.countInListShouldBe(1);
    await linkTab.nthItemTitleShouldBe(0, url);
  });

  await h(t).withLog('When I delete the link (via api)', async () => {
    const postId = await conversationPage.nthPostItem(-1).postId;
    const linkIds = await h(t).glip(loginUser).getLinksIdsFromPostId(postId);
    await h(t).glip(loginUser).deleteLink(linkIds[0]);
  });

  await h(t).withLog('Then the link is removed from Files tab immediately', async () => {
    await linkTab.countInListShouldBe(0);
  });
});
