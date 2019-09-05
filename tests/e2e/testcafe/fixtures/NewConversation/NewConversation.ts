/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-07-23 16:45:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from "lodash";
import * as assert from "assert";
import { v4 as uuid } from "uuid";
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { IGroup } from '../../v2/models';
import { SITE_URL, BrandTire } from '../../config';

fixture('NewConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('The content of "New conversation" dialog is correct', ['P2', 'NewConversation', 'alessia.li', 'JPT-2600']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  const userB = users[3];
  await h(t).glip(loginUser).init();
  const userBName = await h(t).glip(loginUser).getPersonPartialData('display_name', userB.rcId);
  const userC = users[4];
  const userCName = await h(t).glip(loginUser).getPersonPartialData('display_name', userC.rcId);
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, userB, userC]
  }

  await h(t).withLog('Given I have a group', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  const app = new AppRoot(t);
  const newConversationDialog = app.homePage.newConversationDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I click the "Add people" button in the group profile', async () => {
    const groupEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId)
    await groupEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog('Then the "New conversation" dialog is opened', async () => {
    await newConversationDialog.ensureLoaded();
  });

  await h(t).withLog('And the dialog should contain title, description and input', async () => {
    await t.expect(newConversationDialog.title.textContent).eql('New conversation');
    const description = "Adding people will start a new conversation without the current message history.\u00A0If you'd like to keep the history, you can convert to a team instead."
    await t.expect(newConversationDialog.description.textContent).eql(description);
    await t.expect(newConversationDialog.getSelector('a', newConversationDialog.description).textContent).eql("convert to a team");
    await t.expect(newConversationDialog.memberInput.InputArea.focused).ok();
    await t.expect(newConversationDialog.selectedMembers.count).eql(2);
    const selectedMembers = newConversationDialog.selectedMembers;
    const member1Name = await selectedMembers.nth(0).find('.label').textContent;
    const member2Name = await selectedMembers.nth(1).find('.label').textContent;
    const members = [member1Name, member2Name];
    assert.equal(String(_.sortBy(members)), String(_.sortBy([userBName, userCName])));
  });
})

test(formalName('Group/1:1 conversation can convert to team successfully', ['P2', 'NewConversation', 'alessia.li', 'JPT-2601']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  const userB = users[3];
  const userC = users[4];
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, userB, userC]
  }

  await h(t).withLog('Given I have a group', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  const app = new AppRoot(t);
  const newConversationDialog = app.homePage.newConversationDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I click the "Add people" button in the group profile', async () => {
    const groupEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId)
    await groupEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog('Then the "New conversation" dialog is opened', async () => {
    await newConversationDialog.ensureLoaded();
  });

  await h(t).withLog('And I click the "convert to a team" at the description', async () => {
    await newConversationDialog.clickConvertToTeam();
  });

  const convertToTeamModal = app.homePage.convertToTeamModal;
  await h(t).withLog('Then ConvertToTeam dialog should be popup and New conversation dialog should be closed', async () => {
    await t.expect(newConversationDialog.exists).notOk();
    await t.expect(convertToTeamModal.exists).ok();
  });
})

test(formalName('Cancel the creation of a new group', ['P2', 'NewConversation', 'alessia.li', 'JPT-2602']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  const userB = users[3];
  const userC = users[4];
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, userB, userC]
  }

  await h(t).withLog('Given I have a group', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  const app = new AppRoot(t);
  const newConversationDialog = app.homePage.newConversationDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I click the "Add people" button in the group profile', async () => {
    const groupEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId)
    await groupEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog('Then the "New conversation" dialog is opened', async () => {
    await newConversationDialog.ensureLoaded();
  });

  await h(t).withLog('And I click the [Cancel] button', async () => {
    await newConversationDialog.clickCancelButton();
  });

  await h(t).withLog('Then the "New conversation" dialog should be closed', async () => {
    await t.expect(newConversationDialog.exists).notOk();
  });
})

test(formalName("Shouldn't create new group when the conversation existed", ['P1', 'NewConversation', 'alessia.li', 'JPT-2607']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  await h(t).resetGlipAccount(loginUser);
  const userB = users[3];
  const userC = users[4];
  const userD = users[5];
  const userF = users[6];
  let group = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, userB, userC, userD]
  }

  await h(t).withLog('Given I have a group', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  const app = new AppRoot(t);
  const newConversationDialog = app.homePage.newConversationDialog;
  const messageTab = app.homePage.messageTab;
  const directMessagesSection = messageTab.directMessagesSection;
  const conversationPage = messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I click the "Add people" button in the group profile', async () => {
    const groupEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId)
    await groupEntry.enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog('Then the "New conversation" dialog is opened', async () => {
    await newConversationDialog.ensureLoaded();
  });

  await h(t).withLog('And I click [Create] button', async () => {
    await newConversationDialog.clickCreateButton();
  });

  await h(t).withLog('Then the "New conversation" dialog should be closed', async () => {
    await t.expect(newConversationDialog.exists).notOk();
  });

  await h(t).withLog('And the old conversation should still be opened', async () => {
    const currentGroupId = await conversationPage.currentGroupId;
    await t.expect(currentGroupId).eql(group.glipId);
  });
})

test(formalName('Create new group successfully', ['P0', 'NewConversation', 'alessia.li', 'JPT-2604']), async t => {
  const [loginUser, userB, userC, userD] = h(t).rcData.mainCompany.users;
  // await h(t).resetGlipAccount(loginUser);
  let group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, userB, userC]
  }

  await h(t).withLog('Given I have a group in list', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.sendTextPost(uuid(), group, loginUser);
  });

  const app = new AppRoot(t);
  const newConversationDialog = app.homePage.newConversationDialog;
  const messageTab = app.homePage.messageTab;
  const directMessagesSection = messageTab.directMessagesSection;
  const conversationPage = messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the "Add people" button in the group profile', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
    await profileDialog.clickAddMembersIcon();
  });

  await h(t).withLog('Then the "New conversation" dialog is opened', async () => {
    await newConversationDialog.ensureLoaded();
  });

  await h(t).withLog('And I create a new group by adding member userF', async () => {
    const userDName = await h(t).glip(loginUser).getPersonPartialData('display_name', userD.rcId);
    await newConversationDialog.memberInput.typeText(userDName);
    await newConversationDialog.memberInput.selectMemberByNth(0);
    await newConversationDialog.clickCreateButton();
  });

  await h(t).withLog('Then the "New conversation" dialog should be closed', async () => {
    await newConversationDialog.ensureDismiss();
  });

  await h(t).withLog('And the new group conversation should be opened automatically', async () => {
    await t.expect(conversationPage.currentGroupId).notEql(group.glipId);
    const currentGroupId = await conversationPage.currentGroupId;
    const userGlipIDs = await h(t).glip(loginUser).toPersonId([loginUser.rcId, userB.rcId, userC.rcId, userD.rcId])
    await H.retryUntilPass(async () => {
      const groupData = await h(t).glip(loginUser).getGroup(currentGroupId).then(res => res.data)
      assert.equal(String(_.sortBy(groupData.members)), String(_.sortBy(userGlipIDs)));
    });
    await t.expect(conversationPage.posts.count).eql(0);
  });

  await h(t).withLog('And the old group conversation should still exist', async () => {
    await t.expect(directMessagesSection.conversationEntryById(group.glipId).exists).ok();
  });
})
