/*
 * @Author: Windy.Yao
 * @Date: 2019-07-24 13:30
 * @Last Modified by: Windy.Yao
 * @Last Modified time: 2019-07-24 13:30
 */

import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamSetting/AtTeamMention')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Admin can only turn on @team mention toggle if the allow members to post toggle is ON.`, ['P2', 'JPT-2541', 'AtTeamMention', 'Windy.Yao']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];

  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    name: uuid(),
    description: "need description??",
    type: 'Team',
    owner: adminUser,
    members: [adminUser, memberUser],
  }

  await h(t).withLog('Given I have team with 1 admin and 1 member', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with adminUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When admin open Team Setting Dialog of the team and turn Post Messages toggle off`, async () => {
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.notAllowMemberPostMessage();
  });

  await h(t).withLog(`Then The '@team mention' toggle is off and can't turn on.`, async () => {
    await t.expect(teamSettingDialog.allowPostMessageCheckbox.checked).notOk();
    await t.expect(teamSettingDialog.allowAtTeamMentionCheckbox.hasAttribute('disabled')).ok();
  });

  await h(t).withLog(`When admin turn 'Post messages' toggle on`, async () => {
    await teamSettingDialog.allowMemberPostMessage();
  });

  await h(t).withLog(`The '@team mention' toggle is still off and can turn on.`, async () => {
    await t.expect(teamSettingDialog.allowPostMessageCheckbox.checked).ok();
    await t.expect(teamSettingDialog.allowAtTeamMentionCheckbox.checked).notOk();
    await t.expect(teamSettingDialog.allowAtTeamMentionCheckbox.hasAttribute('disabled')).notOk();
  });
});
