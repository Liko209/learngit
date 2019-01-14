/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-14 15:05:21
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

test(formalName('Check the upload file and display on the right rail', ['P1', 'JPT-127']), async t => {
  const app = new AppRoot(t);
  const homePage = app.homePage;
  const conversationPage = homePage.messageTab.conversationPage;
  const rightRail = homePage.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[0];
  const teamName = `Team ${uuid()}`;
  const filesPath = ['../../sources/1.txt'];
  const message = uuid();

  // step 1 create team
  await h(t).directLoginWithUser(SITE_URL, loginUser);
  await homePage.ensureLoaded();
  await homePage.openAddActionMenu();
  const createTeamModal = homePage.createTeamModal;
  await homePage.addActionMenu.createTeamEntry.enter();
  await createTeamModal.ensureLoaded();
  await createTeamModal.setTeamName(teamName);
  await createTeamModal.clickCreateButton();
  await conversationPage.waitUntilVisible(conversationPage.getSelectorByAutomationId('conversation-page-header').withText(teamName));
  // step 2 upload one file
  await conversationPage.uploadFilesToMessageAttachment(filesPath);
  await conversationPage.sendMessage(message);

  await rightRail.clickTab('Files');
  await rightRail.waitUntilVisible(rightRail.listSubTitle.withText('Files'));
  await t.expect(rightRail.listSubTitle.textContent).contains('1');
  await t.expect(rightRail.nthListItem('rightRail-file-item', 0).find('span').withText('1.txt').exists).ok();

  // upload one file again
  await conversationPage.uploadFilesToMessageAttachment(['../../sources/3.txt']);
  await conversationPage.sendMessage(message);

  await t.expect(rightRail.listSubTitle.textContent).contains('2');
  await rightRail.waitUntilVisible(rightRail.nthListItem('rightRail-file-item', 1));
  // last upload will on the top
  await t.expect(rightRail.nthListItem('rightRail-file-item', 0).find('span').withText('3.txt').exists).ok();
});
