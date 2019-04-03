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
import { IGroup } from '../../v2/models';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check the upload file and display on the right rail', ['Allen', 'Isaac', 'P1', 'JPT-907']), async t => {
  const filesPath = ['../../sources/1.txt', '../../sources/3.txt'];
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

  await h(t).withLog('When I open a team and  upload a text file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
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


test(formalName('Deleted file will NOT show under Files/Images tab', ['P1', 'JPT-1341', 'Potar', 'RightRail']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const filesPath = ['../../sources/1.txt', '../../sources/1.png'];
  const filesNames = ['1.txt', '1.png']

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

  const message1 = uuid();
  await h(t).withLog(`When I open the team and upload a text file with ${message1}`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message1);
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
    await filesTab.nthItem(0).nameShouldBe(filesNames[0]);
  }, true);

  await h(t).withLog('When I delete the file (via Api)', async () => {
    const postId = await conversationPage.nthPostItem(-1).postId;
    const fileIds = await h(t).glip(loginUser).getFilesIdsFromPostId(postId);
    await h(t).glip(loginUser).deleteFile(fileIds[0]);
  });

  await h(t).withLog('Then the file is removed from Files tab immediately', async () => {
    await filesTab.countInListShouldBe(0);
  });

  const message2 = uuid();
  await h(t).withLog(`When I  upload a image file with ${message2} `, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath[1]);
    await conversationPage.sendMessage(message2);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('And I click images Tab', async () => {
    await rightRail.imagesEntry.enter();
    await rightRail.imagesEntry.shouldBeOpened();
  })

  const imagesTab = rightRail.imagesTab;
  await h(t).withLog('Then The images number is correct: 1', async () => {
    await imagesTab.waitUntilItemsListExist();
    // await imagesTab.countOnSubTitleShouldBe(1);
    await imagesTab.countInListShouldBe(1);
    await imagesTab.nthItem(0).nameShouldBe(filesNames[1]);
  }, true);

  await h(t).withLog('When I delete the image (via Api)', async () => {
    const postId = await conversationPage.nthPostItem(-1).postId;
    const fileIds = await h(t).glip(loginUser).getFilesIdsFromPostId(postId);
    await h(t).glip(loginUser).deleteFile(fileIds[0]);
  })

  await h(t).withLog('Then the image is removed from Files tab immediately', async () => {
    await imagesTab.countInListShouldBe(0);
  });
});