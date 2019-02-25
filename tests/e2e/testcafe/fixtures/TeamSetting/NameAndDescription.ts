/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-18 13:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('TeamSetting/NameAndDescription')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName(`Show team settings page when admin clicks settings button in the profile`, ['P1', 'JPT-874', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).platform(otherUser).init();

  const teamName = uuid();
  const description = uuid();

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId, postId;
  await h(t).withLog(`Given I am admin of new team "${teamName}" and its description "${description}"`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: teamName,
      description: description,
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });
    postId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `${uuid()}, ![:team](${teamId})`,
      teamId,
    );
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await settingDialog.teamNameShouldBe(teamName);
    await settingDialog.descriptionShouldBe(description);
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I open the the team profile from post @team_mention`, async () => {
    await settingDialog.cancel();
    await teamSection.conversationEntryById(teamId).enter();
    await conversationPage.postItemById(postId).clickNthMentions();
    await app.homePage.miniProfile.openProfile();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await settingDialog.teamNameShouldBe(teamName);
    await settingDialog.descriptionShouldBe(description);
  });
});

test(formalName(`Can cancel the update when update some field then click cancel`, ['P2', 'JPT-923', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();
  await h(t).platform(otherUser).init();

  const teamName = uuid();
  const description = "Hello";
  const newTeamName = uuid();
  const newDescription = "Hello, every one."


  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I am admin of team "${teamName}" and its description "${description}"`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: teamName,
      description: description,
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await settingDialog.teamNameShouldBe(teamName);
    await settingDialog.descriptionShouldBe(description);
  });

  await h(t).withLog(`When I update team name to ${newTeamName} and description to ${newDescription}`, async () => {
    await settingDialog.updateTeamName(newTeamName, { replace: true });
    await settingDialog.updateDescription(newDescription, { replace: true });
  });

  await h(t).withLog(`And I click Cancel button`, async () => {
    await settingDialog.cancel();
  });

  await h(t).withLog(`Then The dialog dismissed and team name should be not changed on section list `, async () => {
    await t.expect(settingDialog.exists).notOk();
    await teamSection.conversationEntryById(teamId).nameShouldBe(teamName);
  });

  await h(t).withLog(`When I open team profile dialog again`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team name and description should be not changed on profile`, async () => {
    await t.expect(profileDialog.name.textContent).eql(teamName);
    await t.expect(profileDialog.description.textContent).eql(description);
  });

  await h(t).withLog(`When I open team setting dialog again`, async () => {
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then the team name and description are not changed`, async () => {
    await settingDialog.teamNameShouldBe(teamName);
    await settingDialog.descriptionShouldBe(description);
  });
});

test(formalName(`No team name,description and add team member field in settings page for non-admin roles`, ['P1', 'JPT-883', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I am member of new team`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${otherUser.company.number}#${otherUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, otherUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button to open Settings page`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`No team name,description and add team members field in Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await t.expect(settingDialog.teamNameDiv.exists).notOk();
    await t.expect(settingDialog.descriptionDiv.exists).notOk();
    // TODO: check  add team members field

  });

});


test(formalName(`Team name and description can be updated successfully`, ['P0', 'JPT-919', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const teamName = uuid();
  const description = "Hello";
  const newTeamName = uuid();
  const newDescription = "Hello, every one."


  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I am admin of team "${teamName}" and its description "${description}"`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: teamName,
      description: description,
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await settingDialog.teamNameShouldBe(teamName);
    await settingDialog.descriptionShouldBe(description);
  });

  await h(t).withLog(`When I update team name to ${newTeamName} and description to "${newDescription}"`, async () => {
    await settingDialog.updateTeamName(newTeamName, { replace: true });
    await settingDialog.updateDescription(newDescription, { replace: true });
  });

  await h(t).withLog(`And I click Save button`, async () => {
    await settingDialog.save();
  });

  await h(t).withLog(`Then The dialog dismissed and team name should be changed to ${newTeamName} on section list `, async () => {
    await t.expect(settingDialog.exists).notOk();
    await teamSection.conversationEntryById(teamId).nameShouldBe(newTeamName);
  });

  await h(t).withLog(`When I open team profile dialog again`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team name and description should be updated on profile`, async () => {
    await t.expect(profileDialog.name.textContent).eql(newTeamName);
    await t.expect(profileDialog.description.textContent).eql(newDescription);
  });

  await h(t).withLog(`When I open team setting dialog again`, async () => {
    await profileDialog.clickSetting();
  });

  await h(t).withLog(`Then the team name and description should be updated`, async () => {
    await settingDialog.teamNameShouldBe(newTeamName);
    await settingDialog.descriptionShouldBe(newDescription);
  });

});

test(formalName(`Save button should be disabled when entering only blanks or clear team name in the Team name field`, ['P2', 'JPT-895', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const blankString = " ";

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I am admin of team`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: uuid(),
      description: uuid(),
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
  });

  await h(t).withLog(`When I clear team name field`, async () => {
    await settingDialog.clearTeamName();
  });

  await h(t).withLog(`Then the Save button should be disabled`, async () => {
    await settingDialog.saveButtonShouldBeDisabled();
  });

  await h(t).withLog(`When I clear team name field`, async () => {
    await settingDialog.updateTeamName(blankString);
  });

  await h(t).withLog(`Then the Save button should be disabled`, async () => {
    await settingDialog.saveButtonShouldBeDisabled();
  });
});

test(formalName(`The inline error should be displayed if the team is failed to be created due to the name is taken`, ['P2', 'JPT-890', 'TeamSetting', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const teamName = uuid();
  const anotherTeamName = uuid();
  const inlineError = 'The name is already taken, choose another one.';

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog(`Given I am admin of team "${teamName}" and other team ${anotherTeamName} ,`, async () => {
    teamId = await h(t).platform(adminUser).createAndGetGroupId({
      name: teamName,
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    });

    await h(t).platform(adminUser).createGroup({
      name: anotherTeamName,
      type: 'Team',
      members: [adminUser.rcId, otherUser.rcId],
    })
  });

  await h(t).withLog(`And I login Jupiter with ${adminUser.company.number}#${adminUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then team profile dialog should be showed`, async () => {
    await profileDialog.shouldBePopUp();
  });

  await h(t).withLog(`When I Click settings button`, async () => {
    await profileDialog.clickSetting();
  });

  const settingDialog = app.homePage.teamSettingDialog;
  await h(t).withLog(`Then the team profile popup navigates to Settings page`, async () => {
    await settingDialog.shouldBePopup();
    await settingDialog.teamNameShouldBe(teamName);
  });

  await h(t).withLog(`When I update team name to ${anotherTeamName}`, async () => {
    await settingDialog.updateTeamName(anotherTeamName, { replace: true });
  });

  await h(t).withLog(`And I click Save button`, async () => {
    await settingDialog.save();
  });

  await h(t).withLog(`Then the inline error shows: ${inlineError}`, async () => {
    await t.expect(settingDialog.teamNameInlineError.textContent).eql(inlineError);
  });
});
