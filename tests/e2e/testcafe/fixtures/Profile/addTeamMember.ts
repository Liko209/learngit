/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-20 16:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('Profile/addTeamMember')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


const ADD_TEAM_DIALOG_TITLE = 'Add team members'

test(formalName(`The Add team members dialog display correctly after clicking 'Add team members' button`, ['P1', 'JPT-912', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();


  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: admin,
    members: [admin, otherUser]
  }

  await h(t).withLog('Given I have one team and I am admin', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: admin.company.number,
      extension: admin.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });


  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.title.textContent).eql(ADD_TEAM_DIALOG_TITLE);
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
    await t.expect(addTeamMemberDialog.inputArea.focused).ok()
  });
});


test(formalName(`Add team member successful after clicking Add button.`, ['P1', 'JPT-914', 'addTeamMember', 'Potar.He']), async t => {
  const [admin, nonMember1, nonMember2, nonMember3] = h(t).rcData.mainCompany.users;

  await h(t).platform(admin).init();
  await h(t).glip(admin).init();
  const adminName = await h(t).glip(admin).getPersonPartialData('display_name');
  const nonMemberName1 = await h(t).glip(admin).getPersonPartialData('display_name', nonMember1.rcId);
  const nonMemberName2 = await h(t).glip(admin).getPersonPartialData('display_name', nonMember2.rcId);
  const nonMemberName3 = await h(t).glip(admin).getPersonPartialData('display_name', nonMember3.rcId);

  const addSuccessMessage = (memberName) => `${adminName} added ${memberName} to the team`

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: admin,
    members: [admin]
  }
  await h(t).withLog('Given I have one team and I am admin', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: admin.company.number,
      extension: admin.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.title.textContent).eql(ADD_TEAM_DIALOG_TITLE);
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  let newMemberName = nonMemberName1;
  let memberCount = 2;
  await h(t).withLog(`When admin type non-member {newMemberName} and enter in input field`, async (step) => {
    step.setMetadata('newMemberName', newMemberName);
    await memberInput.typeText(newMemberName);
    await memberInput.selectMemberByNth(0);
  });

  await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
    await memberInput.lastSelectedNameShouldBe(newMemberName);
  });

  await h(t).withLog(`When admin click "cancel" button`, async () => {
    await addTeamMemberDialog.clickCancelButton()
  });

  await h(t).withLog(`Then The add team member dialog is closed.`, async () => {
    await addTeamMemberDialog.ensureDismiss();
  });

  await h(t).withLog(`And The members is not added to team`, async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.memberEntryByName(newMemberName).ensureDismiss();
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
  });

  const rightRailMemberListSection = app.homePage.messageTab.rightRail.memberListSection;

  const addThenCheckMemberAdded = async (memberName: string, memberCount: number) => {
    await h(t).withLog(`When admin type non-member {newMemberName} and enter in input field`, async (step) => {
      step.setMetadata('newMemberName', newMemberName);
      await memberInput.typeText(newMemberName);
      await memberInput.selectMemberByNth(0);
    });

    await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
      await memberInput.lastSelectedNameShouldBe(newMemberName);
    });

    await h(t).withLog(`When admin click "add" button`, async () => {
      await addTeamMemberDialog.clickAddButton()
    });

    await h(t).withLog(`Then the conversation stream should show "{addSuccessMessage}"`, async (step) => {
      step.setMetadata('addSuccessMessage', addSuccessMessage(newMemberName));
      await t.expect(conversationPage.self.find('div').withText(addSuccessMessage(newMemberName)).exists).ok();
    });

    await h(t).withLog(`And The add team member dialog is closed.`, async () => {
      await addTeamMemberDialog.ensureDismiss();
    });

    await h(t).withLog(`And The added members was added to team`, async () => {
      await t.expect(rightRailMemberListSection.avatars.count).eql(memberCount);
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
      await t.expect(profileDialog.memberNames.count).eql(memberCount);
      await profileDialog.memberEntryByName(memberName).ensureLoaded();
      await profileDialog.clickCloseButton();
    });
  }

  await addThenCheckMemberAdded(newMemberName, memberCount);

  //  conversation page header member icon
  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await conversationPage.clickMemberButtonOnHeader();
  });

  await h(t).withLog(`And click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
  });

  newMemberName = nonMemberName2;
  memberCount += 1;
  await addThenCheckMemberAdded(newMemberName, memberCount);

  // Right shelf header of team conversation entry
  await h(t).withLog(`When admin click add member button on right rail`, async () => {
    await rightRailMemberListSection.clickAddMemberButton();
  });

  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
  });

  newMemberName = nonMemberName3;
  memberCount += 1;
  await addThenCheckMemberAdded(newMemberName, memberCount);
});


test(formalName(`The existing team members should not be displayed as search results.`, ['P2', 'JPT-913', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();

  const otherUserName = await h(t).glip(admin).getPersonPartialData('display_name', otherUser.rcId);

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: admin,
    members: [admin, otherUser]
  }
  await h(t).withLog('Given I have one team and I am admin', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: admin.company.number,
      extension: admin.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  })


  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.title.textContent).eql(ADD_TEAM_DIALOG_TITLE);
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  await h(t).withLog(`When admin type exist members {otherUserName} in input field`, async (step) => {
    step.setMetadata('otherUserName', otherUserName);
    await memberInput.typeText(otherUserName);
  });

  await h(t).withLog(`Then The {otherUserName} is not displayed in the contact list.`, async (step) => {
    step.setMetadata('otherUserName', otherUserName);
    await t.expect(memberInput.contactSearchItems.find('.primary').withText(otherUserName).exists).notOk();
  });

});


test(formalName(`The member list and counts are updated when the member is added.`, ['P2', 'JPT-921', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();

  const nonMemberName = await h(t).glip(admin).getPersonPartialData('display_name', otherUser.rcId);

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: admin,
    members: [admin]
  }
  await h(t).withLog('Given I have one team and I am admin', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: admin.company.number,
      extension: admin.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  });


  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  await h(t).withLog(`And members count only 1`, async () => {
    await profileDialog.countOnMemberListShouldBe(1);
    await profileDialog.countOnMemberHeaderShouldBe(1);
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.ensureLoaded();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  await h(t).withLog(`When admin type non-member {nonMemberName} and enter in input field`, async (step) => {
    step.setMetadata('nonMemberName', nonMemberName);
    await memberInput.typeText(nonMemberName);
    await memberInput.selectMemberByNth(0);
  });

  await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
    await memberInput.lastSelectedNameShouldBe(nonMemberName);
  });

  await h(t).withLog(`When admin click "add" button`, async () => {
    await addTeamMemberDialog.clickAddButton()
  });

  await h(t).withLog(`Then The add team member dialog is closed. and .The added members was added to team`, async () => {
    await t.expect(addTeamMemberDialog.exists).notOk();
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await t.expect(profileDialog.memberEntryByName(nonMemberName).exists).ok();
    await profileDialog.countOnMemberHeaderShouldBe(2);
  });

  await h(t).withLog(`And members count should be 2`, async () => {
    await profileDialog.countOnMemberListShouldBe(2);
    await profileDialog.countOnMemberHeaderShouldBe(2);
  });
});
