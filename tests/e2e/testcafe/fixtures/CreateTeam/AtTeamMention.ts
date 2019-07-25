/*
 * @Author: Windy.Yao
 * @Date: 2019-07-24 10:00
 * @Last Modified by: Windy.Yao
 * @Last Modified time: 2019-07-24 10:00
 */

import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('CreateTeam/AtTeamMention')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`User can only turn on @team mention toggle if the allow members to post toggle is ON.`, ['P2', 'JPT-2653', 'AtTeamMention', 'Windy.Yao']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];

  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();


  await h(t).withLog(`Given I login Jupiter with ${adminUser.company.number}#${adminUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const createTeamModal = app.homePage.createTeamModal;
  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('When I open Create Team in AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });
  await h(t).withLog(`Then Display @team mention toggle (Disable status)`, async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
    await t.expect(createTeamModal.mayAtTeamMentionToggle.checked).notOk();
  });
  await h(t).withLog(`When turn 'Post messages' toggle off `, async () => {
    await createTeamModal.turnOffMayPostMessage();
  });
  await h(t).withLog(`Then the '@team mention' toggle is off and can't turn on`, async () => {
    await t.expect(createTeamModal.mayAtTeamMentionToggle.checked).notOk();
    await t.expect(createTeamModal.mayAtTeamMentionToggle.hasAttribute('disabled')).ok();
  });
  await h(t).withLog(`When turn 'Post messages' toggle on`, async () => {
    await createTeamModal.turnOnMayPostMessage();
  });
  await h(t).withLog(`Then the '@team mention' toggle is off and can turn on`, async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
    await t.expect(createTeamModal.mayAtTeamMentionToggle.checked).notOk();
    await t.expect(createTeamModal.mayAtTeamMentionToggle.hasAttribute('disabled')).notOk();
  });
});
