/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-17 14:12:50
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Send message for link and display on the right rail', ['Skye', 'Devin', 'P1', 'JPT-818']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const rightRail = app.homePage.messageTab.rightRail;
  const message = ['http://www.google.com', 'http://google.com'];
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open a team and send a link', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.sendMessage(message[0]);
  });

  const linkTab = rightRail.linkTab;
  await h(t).withLog('And I click Links Tab', async () => {
    await rightRail.openMore();
    await rightRail.linksEntry.enter();
    await rightRail.linksEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The links number is correct: 1', async () => {
    await linkTab.countOnSubTitleShouldBe(1);
    await linkTab.countInListShouldBe(1);
  });

  await h(t).withLog('When I send second link', async () => {
    await conversationPage.sendMessage(message[1]);
  });

  await h(t).withLog('Then The links number is correct: 2', async () => {
    await linkTab.countOnSubTitleShouldBe(2);
    await linkTab.countInListShouldBe(2);
  });

  const deletePostDialog = app.homePage.messageTab.deletePostModal;
  await h(t).withLog('When I delete the last post', async () => {
    await conversationPage.nthPostItem(-1).clickMoreItemOnActionBar();
    await conversationPage.nthPostItem(-1).actionBarMoreMenu.deletePost.enter();
    await deletePostDialog.delete();
  });

  await h(t).withLog('Then The links number is correct: 1', async () => {
    await linkTab.countOnSubTitleShouldBe(1);
    await linkTab.countInListShouldBe(1);
  });
});
