/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-02-13 10:15:43
 * Copyright © RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('TeamSetting/PostMessage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Turn on/off Post message toggle should/shouldn't be able to post the message`, ['P2', 'JPT-1102', 'JPT-173', 'PostMessage', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];

  await h(t).glip(memberUser).init();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const postText = uuid();
  const readOnlyText = "This team is read-only";

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

  await h(t).withLog(`And I login Jupiter with adminUser: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId);

  await h(t).withLog(`When admin turn Post message toggle off and save`, async () => {
    await app.homePage.ensureLoaded();
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.notAllowMemberPostMessage();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then the member should not be able to post message in the team`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);

    await app.homePage.ensureLoaded();
    await teamEntry.enter();
    await conversationPage.shouldBeReadOnly();
    await t.expect(conversationPage.readOnlyDiv.withText(readOnlyText).exists).ok();
  });

  await h(t).withLog(`When admin turn Post message toggle on and save`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.allowMemberPostMessage();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then the member should be able to post message in the team`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, memberUser);
    await teamEntry.enter();
    await conversationPage.sendMessage(postText);
    await t.expect(conversationPage.nthPostItem(-1).text.withText(postText).exists).ok();
  });

});
