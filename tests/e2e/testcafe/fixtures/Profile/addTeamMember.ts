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

fixture('Profile/addTeamMember')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`The Add Team Members dialog display correctly after clicking 'Add team members' button`, ['P1', 'JPT-912', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();
  await h(t).glip(admin).resetProfileAndState()


  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog('Given I have one team and I am admin', async () => {
    teamId = await h(t).platform(admin).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [admin.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });


  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.shouldBePopup();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });
});


test(formalName(`Add team member successful after clicking Add button.`, ['P1', 'JPT-914', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();
  await h(t).glip(admin).resetProfileAndState();

  const adminName = await h(t).glip(admin).getPersonPartialData('display_name');
  const nonMemberName = await h(t).glip(admin).getPersonPartialData('display_name', users[6].rcId);
  const addSuccessMessage = `${adminName} added ${nonMemberName} to the team`
  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog('Given I have one team and I am admin', async () => {
    teamId = await h(t).platform(admin).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [admin.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.shouldBePopup();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  await h(t).withLog(`When admin type non-member ${nonMemberName} and enter in input field`, async () => {
    await memberInput.typeText(nonMemberName);
    await memberInput.selectMemberByNth(0);
  });

  await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
    await memberInput.lastSelectedNameShouldBe(nonMemberName);
  });

  await h(t).withLog(`When admin click "cancel" button`, async () => {
    await addTeamMemberDialog.cancel()
  });

  await h(t).withLog(`Then The add team member dialog is closed. and The members is not added to team`, async () => {
    await t.expect(addTeamMemberDialog.exists).notOk();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await t.expect(profileDialog.memberEntryByName(nonMemberName).exists).notOk();
   });

   await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.shouldBePopup();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

   await h(t).withLog(`When admin type non-member ${nonMemberName} and enter in input field`, async () => {
    await memberInput.typeText(nonMemberName);
    await memberInput.selectMemberByNth(0);
  });

  await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
    await memberInput.lastSelectedNameShouldBe(nonMemberName);
  });

  await h(t).withLog(`When admin click "add" button`, async () => {
    await addTeamMemberDialog.add()
  });

  await h(t).withLog(`Then The add team member dialog is closed. and .The added members was added to team`, async () => {
    await t.expect(addTeamMemberDialog.exists).notOk();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await t.expect(profileDialog.memberEntryByName(nonMemberName).exists).ok();
    await profileDialog.clickCloseButton();
   });

   const conversationPage = app.homePage.messageTab.conversationPage;
   await h(t).withLog(`And the conversation stream should show "${addSuccessMessage}"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await conversationPage.ensureLoaded();
    await t.expect(conversationPage.self.find('div').withText(addSuccessMessage).exists).ok();
   });
});


test(formalName(`The existing team members should not be displayed as search results.`, ['P2', 'JPT-913', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();
  await h(t).glip(admin).resetProfileAndState()

  const otherUserName = await h(t).glip(admin).getPersonPartialData('display_name', otherUser.rcId);

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog('Given I have one team and I am admin', async () => {
    teamId = await h(t).platform(admin).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [admin.rcId, otherUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog(`Then "add team members" button should be showed`, async () => {
    await t.expect(profileDialog.addMembersIcon.exists).ok();
  });

  await h(t).withLog(`When admin click "add team members" button`, async () => {
    await profileDialog.clickAddMembersIcon();
  });

  const addTeamMemberDialog = app.homePage.addTeamMemberDialog;
  await h(t).withLog(`Then The add team members dialog display`, async () => {
    await addTeamMemberDialog.shouldBePopup();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  await h(t).withLog(`When admin type exist members ${otherUserName} in input field`, async () => {
    await memberInput.typeText(otherUserName);
  });

  await h(t).withLog(`Then The ${otherUserName} is not displayed in the contact list.`, async () => {
    await t.expect(memberInput.contactSearchItems.find('.primary').withText(otherUserName).exists).notOk();
  });

});


test(formalName(`The member list and counts are updated when the member is added.`, ['P2', 'JPT-921', 'addTeamMember', 'Potar.He']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const admin = users[4];
  const otherUser = users[5];
  await h(t).platform(admin).init();
  await h(t).glip(admin).init();
  await h(t).glip(admin).resetProfileAndState()

  const nonMemberName = await h(t).glip(admin).getPersonPartialData('display_name', otherUser.rcId);

  const app = new AppRoot(t);
  const profileDialog = app.homePage.profileDialog;

  let teamId;
  await h(t).withLog('Given I have one team and I am admin, have no other member in team', async () => {
    teamId = await h(t).platform(admin).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [admin.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${admin.company.number}#${admin.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, admin);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When admin open team profile via team "More Menu"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
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
    await addTeamMemberDialog.shouldBePopup();
    await t.expect(addTeamMemberDialog.title.exists).ok();
    await t.expect(addTeamMemberDialog.memberInput.exists).ok();
    await t.expect(addTeamMemberDialog.cancelButton.exists).ok();
    await t.expect(addTeamMemberDialog.addButton.exists).ok();
  });

  const memberInput = addTeamMemberDialog.memberInput;
  await h(t).withLog(`When admin type non-member ${nonMemberName} and enter in input field`, async () => {
    await memberInput.typeText(nonMemberName);
    await memberInput.selectMemberByNth(0);
  });

  await h(t).withLog(`Then the non-member should be selected in input field`, async () => {
    await memberInput.lastSelectedNameShouldBe(nonMemberName);
  });

  await h(t).withLog(`When admin click "add" button`, async () => {
    await addTeamMemberDialog.add()
  });

  await h(t).withLog(`Then The add team member dialog is closed. and .The added members was added to team`, async () => {
    await t.expect(addTeamMemberDialog.exists).notOk();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await t.expect(profileDialog.memberEntryByName(nonMemberName).exists).ok();
    await profileDialog.countOnMemberHeaderShouldBe(2);
   });

   await h(t).withLog(`And members count should be 2`, async () => {
     await profileDialog.countOnMemberListShouldBe(2);
    await profileDialog.countOnMemberHeaderShouldBe(2);
  });
});
