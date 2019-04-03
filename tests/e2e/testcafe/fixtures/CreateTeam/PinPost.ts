/*
 * @Author: Potar.He 
 * @Date: 2019-02-15 16:37:06 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-18 17:15:17
 */


import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('TeamSetting/PinPost')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Restrict non admin team members from pinning posts in Create team dialog`, ['P2', 'JPT-1082', 'PinPost', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];

  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const teamName1 = uuid();
  const teamName2 = uuid();
  const teamName3 = uuid();

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

  await h(t).withLog(`Then Display Post& Pin toggle (Enable status)`, async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
    await t.expect(createTeamModal.mayPinPostToggle.checked).ok();
  });

  await h(t).withLog(`When I turn off Post Message toggle`, async () => {
    await createTeamModal.turnOffMayPostMessage();
  });

  await h(t).withLog(`Then The pinning toggle should disable automatically and unable to turn on.`, async () => {
    await t.expect(createTeamModal.mayPinPostToggle.checked).notOk();
    await t.expect(createTeamModal.mayPinPostToggle.hasAttribute('disabled')).ok();
  });

  await h(t).withLog(`When admin create team`, async () => {
    await createTeamModal.typeTeamName(teamName1);
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`Then The sending post and pinning post status in the team should disable (via API).`, async () => {
    await H.retryUntilPass(async () => {
      const teamId = await teamSection.conversationEntryByName(teamName1).groupId;
      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(!(1 << 0 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
      assert.ok(!(1 << 3 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
    });
  });

  await h(t).withLog('When I open Create Team in AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog(`Then Display Post& Pin toggle (Enable status)`, async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
    await t.expect(createTeamModal.mayPinPostToggle.checked).ok();
  });

  await h(t).withLog(`When I turn on Post Message toggle`, async () => {
    await createTeamModal.turnOnMayPostMessage();
  });

  await h(t).withLog(`Then The pinning toggle should be able to turn on/off.`, async () => {
    await t.expect(createTeamModal.mayPinPostToggle.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog(`When admin turn off the pinging toggle and create team`, async () => {
    await createTeamModal.typeTeamName(teamName2);
    await createTeamModal.turnOffMayPinPost();
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`Then The sending post status should on and pinning post should off (via API).`, async () => {
    await H.retryUntilPass(async () => {
      const teamId = await teamSection.conversationEntryByName(teamName2).groupId;
      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(1 << 0 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
      assert.ok(!(1 << 3 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
    });
  });

  await h(t).withLog('When I open Create Team in AddActionMenu', async () => {
    await app.homePage.openAddActionMenu();
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog(`Then Display Post& Pin toggle (Enable status)`, async () => {
    await t.expect(createTeamModal.mayPostMessageToggle.checked).ok();
    await t.expect(createTeamModal.mayPinPostToggle.checked).ok();
  });

  await h(t).withLog(`When I turn on Post Message toggle`, async () => {
    await createTeamModal.turnOnMayPostMessage();
  });

  await h(t).withLog(`Then The pinning toggle should be able to turn on/off.`, async () => {
    await t.expect(createTeamModal.mayPinPostToggle.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog(`When admin turn on the pinging toggle and create team`, async () => {
    await createTeamModal.typeTeamName(teamName3);
    await createTeamModal.turnOnMayPinPost();
    await createTeamModal.clickCreateButton();
  });

  await h(t).withLog(`Then The sending post and pinning post status should on (via API).`, async () => {
    await H.retryUntilPass(async () => {
      const teamId = await teamSection.conversationEntryByName(teamName3).groupId;
      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(1 << 0 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
      assert.ok(1 << 3 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
    });
  });
});
