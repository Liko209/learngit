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
import { SITE_URL } from '../../config';

fixture('CreateTeam')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('new team popup can be open and closed', ['P1', 'JPT-86']),
  async t => {
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[0];
    await h(t).withLog(
      `When I login Jupiter with ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    // case 1
    await h(t).withLog('Then I can open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    const createTeamModal = app.homePage.createTeamModal;
    await h(t).withLog(
      'Then I can open Create Team in AddActionMenu',
      async () => {
        await app.homePage.addActionMenu.createTeamEntry.enter();
        await createTeamModal.ensureLoaded();
      },
      true,
    );
    await h(t).withLog('Then I can close the Create Team popup', async () => {
      await createTeamModal.clickCancelButton();
    });
  },
);

test(
  formalName('Check the maximum length of the Team Name input box', [
    'P1',
    'JPT-102',
  ]),
  async t => {
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(
      `When I login Jupiter with ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    // case 2
    await h(t).withLog('Then I can open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    const createTeamModal = app.homePage.createTeamModal;
    await h(t).withLog(
      'Then I can open Create Team in AddActionMenu',
      async () => {
        await app.homePage.addActionMenu.createTeamEntry.enter();
        await createTeamModal.ensureLoaded();
      },
    );
    await h(t).withLog(
      'Then I input team name with max character',
      async () => {
        await createTeamModal.inputTeamNameMax();
      },
    );

    await h(t).withLog(
      'Then I can input team name with 200 character',
      async () => {
        const teamNameValue = await createTeamModal.teamNameInput.value;
        await t.expect(teamNameValue.length).eql(200);
      },
    );
    const teamNameValue = await createTeamModal.teamNameInput.value;
    await t.expect(teamNameValue.length).eql(200);
    await createTeamModal.clickCancelButton();
  },
);

test.skip(formalName('Check the new team can be created successfully', ['P1', 'JPT-127']),
  async t => {
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[0];
    const uid = uuid();

    await h(t).withLog(`When I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    // case 3
    await h(t).withLog('Then I can open add menu in home page', async () => {
      await app.homePage.openAddActionMenu();
    });

    const createTeamModal = app.homePage.createTeamModal;
    await h(t).withLog('Then I can open Create Team in AddActionMenu', async () => {
      await app.homePage.addActionMenu.createTeamEntry.enter();
      await createTeamModal.ensureLoaded();
    });

    await h(t).withLog('Then I can input team name randomly', async () => {
      await createTeamModal.inputTeamNameRandom(uid);
    });

    await h(t).withLog('Then I can set the team as Public', async () => {
      await createTeamModal.clickPublicTeamButton();
    });

    await h(t).withLog('Then Turn off the toggle of "Members may post messages"', async () => {
      await createTeamModal.clickMayPostButton();
    });

    await h(t).withLog('Then Tap create team button', async () => {
      await createTeamModal.clickCreateButton();
    });

    await h(t).withLog('Then Check the created team', async () => {
      const teamSection = app.homePage.messagePanel.teamsSection;
      await teamSection.expand();
      await t.expect(teamSection.conversations.withText(`${uid}`).exists).ok();
    });
  },
);
