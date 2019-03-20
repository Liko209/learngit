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

test(formalName('Check the upload image file and display on the right rail', ['Skye', 'Devin', 'P2', 'JPT-752']), async t => {
  const filesPath = ['../../sources/1.png','../../sources/2.png'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];

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

  await h(t).withLog('When I open a team and upload a image file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const imagesTab = rightRail.imagesTab;
  await h(t).withLog('And I click Images Tab', async () => {
    await rightRail.imagesEntry.enter();
    await rightRail.imagesEntry.shouldBeOpened();
  })

  await h(t).withLog('Then The images number is correct: 1', async () => {
    await imagesTab.waitUntilItemsListExist();
    // await imagesTab.countOnSubTitleShouldBe(1);
    await imagesTab.countInListShouldBe(1);
    await imagesTab.nthItem(0).nameShouldBe('1.png');
  });

  await h(t).withLog('When I  upload another image file', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath[1]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('Then The images number is correct: 2', async () => {
    await imagesTab.waitUntilItemsListExist();
    // await imagesTab.countOnSubTitleShouldBe(2);
    await imagesTab.countInListShouldBe(2);
  });

  await h(t).withLog('The new item is on the top of list', async () => {
    await imagesTab.nthItem(0).nameShouldBe('2.png');
  });
});
