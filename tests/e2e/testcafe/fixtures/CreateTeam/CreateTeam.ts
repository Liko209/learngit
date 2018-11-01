/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-31 13:37:43
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { CreateTeamModal } from '../../v2/page-models/AppRoot/HomePage/CreateTeamModal';
import { SITE_URL } from '../../config';

fixture('CreateTeam')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('CreateTeam', ['P1', 'JPT-38']), async t => {
  const app = new AppRoot(t);
  const createTeam = new CreateTeamModal(t);
  const user = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(
    `Given I login Jupiter with ${user.company.number}#${user.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    },
    true,
  );

  // case 1 can be open and close
  await app.homePage.openAddActionMenu();
  await app.homePage.addActionMenu.createTeamEntry.enter();
  await createTeam.clickCancelButton();

  // case 2
  await app.homePage.openAddActionMenu();
  await app.homePage.addActionMenu.createTeamEntry.enter();
  await createTeam.inputTeamNameMax();
  const teamNameValue = await createTeam.teamNameInput.value;
  await t.expect(teamNameValue.length).eql(200);
  await createTeam.clickCancelButton();

  // case 3
  await app.homePage.openAddActionMenu();
  await app.homePage.addActionMenu.createTeamEntry.enter();
  const uid = uuid();
  await createTeam.inputTeamNameRandom(uid);
  await createTeam.clickPublicTeamButton();
  await createTeam.clickMayPostButton();
  await createTeam.clickCreateButton();
  const teamSection = app.homePage.messagePanel.teamsSection;
  await teamSection.expand();
  await t.expect(teamSection.conversations.withText(`${uid}`).exists).ok();
});
