/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-14 15:05:21
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check the upload file and display on the right rail', ['Allen', 'Isaac', 'P1', 'JPT-907']), async t => {
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const rightRail = app.homePage.messageTab.rightRail;
  const filesPath = ['../../sources/1.txt', '../../sources/3.txt'];
  const message = uuid();
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

  await h(t).withLog('When I open a team and  upload a text file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const filesTab = rightRail.filesTab;
  await h(t).withLog('And I click Files Tab', async () => {
    await rightRail.filesEntry.enter();
    await rightRail.filesEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The files number is correct: 1', async () => {
    await filesTab.waitUntilItemsListExist();
    // await filesTab.countOnSubTitleShouldBe(1);
    await filesTab.countInListShouldBe(1);
    await filesTab.nthItem(0).nameShouldBe('1.txt');
  });

  await h(t).withLog('When I  upload another text file', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath[1]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('And I click Files Tab', async () => {
    await rightRail.filesEntry.enter();
    await rightRail.filesEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The files number is correct: 2', async () => {
    await filesTab.waitUntilItemsListExist();
    // await filesTab.countOnSubTitleShouldBe(2);
    await filesTab.countInListShouldBe(2);
  });

  await h(t).withLog('The new item is on the top of list', async () => {
    await filesTab.nthItem(0).nameShouldBe('3.txt');
  });
});
