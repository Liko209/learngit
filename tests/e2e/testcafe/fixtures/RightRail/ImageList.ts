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

test(formalName('Check the upload image file and display on the right rail', ['Skye', 'Devin', 'P2','JPT-752']), async t => {
  const app = new AppRoot(t);
  const homePage = app.homePage;
  const conversationPage = homePage.messageTab.conversationPage;
  const rightRail = homePage.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[0];
  const teamName = `Team ${uuid()}`;
  const filesPath = ['../../sources/1.png'];
  const message = uuid();
  const listItemId = 'rightRail-image-item';

  // step 1 create team
  await h(t).withLog('Then User can create a team', async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await homePage.ensureLoaded();
    await homePage.openAddActionMenu();
    const createTeamModal = homePage.createTeamModal;
    await homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
    await createTeamModal.setTeamName(teamName);
    await createTeamModal.clickCreateButton();
    await conversationPage.waitUntilVisible(conversationPage.getSelectorByAutomationId('conversation-page-header').withText(teamName));
  });

  // step 2 upload one file
  await h(t).withLog('Then User upload a image file', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
    await conversationPage.sendMessage(message);

    await rightRail.clickTab('Images');
    await rightRail.waitUntilVisible(rightRail.listSubTitle.withText('Images'));
    await t.expect(rightRail.listSubTitle.textContent).contains('1');
    await t.expect(rightRail.nthListItem(listItemId, 0).find('span').withText('1.png').exists).ok();
  });

  // upload one file again
  await h(t).withLog('Then User can upload another image file again', async () => {
    await conversationPage.uploadFilesToMessageAttachment(['../../sources/2.png']);
    await conversationPage.sendMessage(message);
    await t.expect(rightRail.listSubTitle.textContent).contains('2');
    await rightRail.waitUntilVisible(rightRail.nthListItem(listItemId, 1));
  });

  // last upload will on the top
  await h(t).withLog('The new item is on the top of list', async () => {
    await t.expect(rightRail.nthListItem(listItemId, 0).find('span').withText('2.png').exists).ok();
  });
});
