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

fixture('TeamSetting/PostMessage')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Turn on/off Post message toggle should/shouldn't be able to post the message`, ['P2', 'JPT-1102', 'PostMessage', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const memberUser = h(t).rcData.mainCompany.users[5];

  await h(t).glip(memberUser).init();
  await h(t).glip(memberUser).resetProfileAndState();
  await h(t).platform(adminUser).init();
  await h(t).glip(adminUser).init();

  const roleAdmin = await h(t).userRole(adminUser);
  const roleMember = await h(t).userRole(memberUser);

  const postText = uuid();
  const readOnlyText = "This team is read-only";

  let teamId;
  await h(t).withLog('Given I have team with 1 admin and 1 member', async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      description: "need description??",
      type: 'Team',
      members: [adminUser.rcId, memberUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension} `, async () => {
    await t.useRole(roleAdmin);
  });

  const profileDialog = app.homePage.profileDialog;
  const teamSettingDialog = app.homePage.teamSettingDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamEntry = app.homePage.messageTab.teamsSection.conversationEntryById(teamId);

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
    await t.useRole(roleMember);
    await app.homePage.ensureLoaded();
    await teamEntry.enter();
    await conversationPage.shouldBeReadOnly();
    await t.expect(conversationPage.readOnlyDiv.withText(readOnlyText).exists).ok();
  });

  await h(t).withLog(`When admin turn Post message toggle on and save`, async () => {
    await t.useRole(roleAdmin);
    await app.homePage.ensureLoaded();
    await teamEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.clickSetting();
    await teamSettingDialog.allowMemberPostMessage();
    await teamSettingDialog.save();
  });

  await h(t).withLog(`Then the member should be able to post message in the team`, async () => {
    await t.useRole(roleMember);
    await teamEntry.enter();
    await conversationPage.sendMessage(postText);
    await t.expect(conversationPage.nthPostItem(-1).text.withText(postText).exists).ok();
  });

});
