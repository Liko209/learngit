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
import { ITestMeta, IGroup } from '../../v2/models';

fixture('TeamSetting/NameAndDescription')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-874'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Show team settings page when admin clicks settings button in the profile`, async t => {
  const adminUser = h(t).rcData.mainCompany.users[4];

  const teamName = uuid();
  const description = uuid();

  let team = <IGroup>{
    type: "Team",
    name: teamName,
    owner: adminUser,
    members: [adminUser],
    description,
  }

  await h(t).withLog(`Given I am admin of team named "{teamName}" and its description "{description}" `, async (step) => {
    step.initMetadata({ teamName, description });
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has team mention post`, async (step) => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}, ![:team](${team.glipId})`, team, adminUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When I open my team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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

  await h(t).withLog(`When I open the the team profile from post @team_mention`, async () => {
    await settingDialog.cancel();
    await teamSection.conversationEntryById(team.glipId).enter();
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
  const adminUser = h(t).rcData.mainCompany.users[4];

  const teamName = uuid();
  const description = "Hello";
  const newTeamName = uuid();
  const newDescription = "Hello, every one."

  let team = <IGroup>{
    type: "Team",
    name: teamName,
    owner: adminUser,
    members: [adminUser],
    description,
  }

  await h(t).withLog(`Given I am admin of team named "{teamName}" and its description "{description}" `, async (step) => {
    step.initMetadata({ teamName, description });
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`When I open my team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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

  await h(t).withLog(`When I update team name to "{newTeamName}" and description to "{newDescription}"`, async (step) => {
    step.initMetadata({ newTeamName, newDescription })
    await settingDialog.updateTeamName(newTeamName, { replace: true });
    await settingDialog.updateDescription(newDescription, { replace: true });
  });

  await h(t).withLog(`And I click Cancel button`, async () => {
    await settingDialog.cancel();
  });

  await h(t).withLog(`Then The dialog dismissed and team name should be not changed on section list `, async () => {
    await t.expect(settingDialog.exists).notOk();
    await teamSection.conversationEntryById(team.glipId).nameShouldBe(teamName);
  });

  await h(t).withLog(`When I open team profile dialog again`, async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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
  const adminUser = h(t).rcData.mainCompany.users[4];
  const loginUser = h(t).rcData.mainCompany.users[5];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: adminUser,
    members: [adminUser, loginUser]
  }

  await h(t).withLog(`Given I am member of a team named "{name}"`, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When I open the team profile from conversation list`, async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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
    await t.expect(settingDialog.allowAddTeamMemberToggle.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-919'],
  keywords: ['TeamSetting'],
  maintainers: ['Potar.He']
})(`Team name and description can be updated successfully`, async t => {
  const adminUser = h(t).rcData.mainCompany.users[4];

  const teamName = uuid();
  const description = "Hello";
  const newTeamName = uuid();
  const newDescription = "Hello, every one."

  let team = <IGroup>{
    type: "Team",
    name: teamName,
    owner: adminUser,
    members: [adminUser],
    description
  }

  await h(t).withLog(`Given I am admin of team named "{teamName}" and its description "{description}" `, async (step) => {
    step.initMetadata({ teamName, description });
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });;

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When I open my team {name} profile from conversation list`, async (step) => {
    step.setMetadata('name', team.name);
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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

  await h(t).withLog(`When I update team name to "{newTeamName}" and description to "{newDescription}"`, async (step) => {
    step.initMetadata({ newTeamName, newDescription })
    await settingDialog.updateTeamName(newTeamName, { replace: true });
    await settingDialog.updateDescription(newDescription, { replace: true });
  });

  await h(t).withLog(`And I click Save button`, async () => {
    await settingDialog.save();
  });

  await h(t).withLog(`Then The dialog dismissed and team name should be changed to {newTeamName} on section list `, async (step) => {
    step.setMetadata('newTeamName', newTeamName);
    await t.expect(settingDialog.exists).notOk();
    await teamSection.conversationEntryById(team.glipId).nameShouldBe(newTeamName);
  });

  await h(t).withLog(`When I open team profile dialog again`, async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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
  const adminUser = h(t).rcData.mainCompany.users[4];

  const blankString = " ";

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: adminUser,
    members: [adminUser]
  }

  await h(t).withLog(`Given I am admin of team named {name}`, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When I open my team {name} profile from conversation list`, async (step) => {
    step.setMetadata('name', team.name);
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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
  const adminUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(adminUser).init();

  const teamName = uuid();
  const anotherTeamName = uuid();
  const inlineError = 'This name is already taken, try choosing another one.';

  let team = <IGroup>{
    type: "Team",
    name: teamName,
    owner: adminUser,
    members: [adminUser]
  }

  let antherTeam = <IGroup>{
    type: "Team",
    name: anotherTeamName,
    owner: otherUser,
    members: [otherUser]
  }

  await h(t).withLog(`Given I am admin of team "{teamName}", a exists team {anotherTeamName}`, async (step) => {
    step.initMetadata({
      teamName, anotherTeamName
    });
    await h(t).scenarioHelper.createTeams([team, antherTeam]);
  });

  const app = new AppRoot(t);

  const teamSection = app.homePage.messageTab.teamsSection;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`And I login Jupiter with this extension: {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: adminUser.company.number,
      extension: adminUser.extension
    });
    await h(t).directLoginWithUser(SITE_URL, adminUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When I open my team {teamName} profile from conversation list`, async (step) => {
    step.setMetadata('teamName', teamName);
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
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

  await h(t).withLog(`When I update team name to {anotherTeamName}`, async (step) => {
    step.setMetadata('teamName', teamName);
    await settingDialog.updateTeamName(anotherTeamName, { replace: true });
  });

  await h(t).withLog(`And I click Save button`, async () => {
    await settingDialog.save();
  });

  await h(t).withLog(`Then the inline error shows: {inlineError}`, async (step) => {
    step.setMetadata('inlineError', inlineError);
    await t.expect(settingDialog.teamNameInlineError.textContent).eql(inlineError);
  });
});
