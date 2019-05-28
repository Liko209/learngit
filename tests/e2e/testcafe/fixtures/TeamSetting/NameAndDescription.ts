/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-18 13:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('TeamSetting/NameAndDescription')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-874'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Show team settings page when admin clicks settings button in the profile`, async t => {
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
    await profileDialog.ensureLoaded();
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
    await profileDialog.ensureLoaded();
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

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-923'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Can cancel the update when update some field then click cancel`, async t => {
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
    await profileDialog.ensureLoaded();
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

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-883'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`No team name,description and add team member field in settings page for non-admin roles`, async t => {
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
    await profileDialog.ensureLoaded();
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


test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-919'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Team name and description can be updated successfully`, async t => {
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
    await profileDialog.ensureLoaded();
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

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-895'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Save button should be disabled when entering only blanks or clear team name in the Team name field`, async t => {
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
    await profileDialog.ensureLoaded();
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

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-890'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`The inline error should be displayed if the team is failed to be created due to the name is taken`, async t => {
  const app = new AppRoot(t);
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const teamName = uuid();
  const anotherTeamName = uuid();
  const inlineError = 'The name is already taken, try choose another one.';

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
    await profileDialog.ensureLoaded();
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
