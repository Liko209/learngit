/*
 * @Author: Potar.He 
 * @Date: 2019-02-15 16:37:06 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-15 16:41:41
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
  const memberUser = h(t).rcData.mainCompany.users[5];

  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const postText = uuid();
  const readOnlyText = "This team is read-only";

  await h(t).withLog(`Given I login Jupiter with ${adminUser.company.number}#${adminUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  
  const createTeamModal = app.homePage.createTeamModal;
  await h(t).withLog('When I open Create Team in AddActionMenu', async () => {
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await createTeamModal.ensureLoaded();
  });

  await h(t).withLog(`Then Display Post& Pin toggle (Enable status)`, async () => {

  });

  await h(t).withLog(`Then The pinning toggle should disable automatically and unable to turn on.`, async () => {
    await t.expect(teamSettingDialog.allowPostMessageCheckbox.checked).notOk();
    await t.expect(teamSettingDialog.allowPinPostCheckbox.hasAttribute('disabled')).ok();
  });

  await h(t).withLog(`When admin click Save Button`, async () => {
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then The sending post and pinning post status in the team should disable (via API).`, async () => {
    await H.retryUntilPass(async () => {
      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(!(1 << 0 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
      assert.ok(!(1 << 3 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
    });
  });

  await h(t).withLog(`When admin open Team Setting Dialog of the team and turn Post Messages toggle on`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
    await teamSettingDialog.allowMemberPostMessage();
  });

  await h(t).withLog(`Then The pinning toggle should be able to turn on/off.`, async () => {
    await t.expect(teamSettingDialog.allowPostMessageCheckbox.checked).ok();
    await t.expect(teamSettingDialog.allowPinPostCheckbox.hasAttribute('disabled')).notOk();
  });

  await h(t).withLog(`When admin turn The pining toggle off and click Save Button `, async () => {
    await teamSettingDialog.notAllowMemberPinPost();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then The sending post status should on and pinning post should off (via API).`, async () => {
    await H.retryUntilPass(async () => {

      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(1 << 0 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
      assert.ok(!(1 << 3 & Number(userPermissionsValue)), `permission value Error: ${userPermissionsValue}`);
    });
  });

  await h(t).withLog(`When admin open Team Setting Dialog of the team`, async () => {
    await teamEntry.openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`When admin turn The pining toggle on and click Save Button `, async () => {
    await teamSettingDialog.allowMemberPinPost();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then The sending post status should on and pinning post should on (via API).`, async () => {
    await H.retryUntilPass(async () => {
      const userPermissionsValue = await h(t).glip(adminUser).getGroup(teamId).then(res => res.data.permissions.user.level);
      assert.ok(1 << 0 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
      assert.ok(1 << 3 & Number(userPermissionsValue), `permission value Error: ${userPermissionsValue}`);
    });
  });
});
