/*
 * @Author: isaac.liu
 * @Date: 2019-01-17 18:37:36
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

test(formalName('Check the create note and display on the right rail', ['Isaac', 'P1','JPT-907']), async t => {
  const app = new AppRoot(t);
  const homePage = app.homePage;
  const rightRail = homePage.rightRail;
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];

  const noteItemAutomationID = 'rightRail-note-item';
  const teamName = `Team ${uuid()}`;
  const noteTitle = uuid();
  let groupId;

  // step 1 create team
  await h(t).withLog('Then I login & create a team & enter the conversation', async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);

    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId],
    });

    await homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(groupId).enter();
  });

  // step 2 create a note
  await h(t).withLog('Then User create a note', async () => {
    await h(t).glip(loginUser).createSimpleNote(groupId, noteTitle, uuid());
    await rightRail.clickMore();
    await rightRail.waitUntilVisible(rightRail.getMenu('rightRail-tab-notes'));
    await rightRail.clickMenu('rightRail-tab-notes');
    await rightRail.waitUntilVisible(rightRail.nthListItem(noteItemAutomationID, 0));
    await t.expect(rightRail.listSubTitle.textContent).contains('1');
    await t.expect(rightRail.nthListItem(noteItemAutomationID, 0).find('span').withText(noteTitle).exists).ok();
  });

  // create another note
  await h(t).withLog('Then User can upload another file again', async () => {
    const title2 = uuid();
    await h(t).glip(loginUser).createSimpleNote(groupId, title2, uuid());
    await rightRail.waitUntilVisible(rightRail.nthListItem(noteItemAutomationID, 1));
    await t.expect(rightRail.listSubTitle.textContent).contains('2');
    await t.expect(rightRail.nthListItem(noteItemAutomationID, 0).find('span').withText(title2).exists).ok();
  });
});
