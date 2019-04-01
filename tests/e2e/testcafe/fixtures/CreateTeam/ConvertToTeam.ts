/*
 * @Author: Potar.He 
 * @Date: 2019-03-18 16:40:37 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-18 17:58:37
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import { ClientFunction } from 'testcafe';

fixture('CreateTeam/ConvertToTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Covert group to team', ['P0', 'JPT-1396', 'Potar.He', 'ConvertToTeam']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[5]
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();
  const loginUserGlipId = await h(t).glip(loginUser).toPersonId(loginUser.rcId);

  let group1 = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[0], users[1]]
  }
  let group2 = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[1], users[2]]
  }

  const groups = [group1, group2];
  const msgList = [`0-${uuid()}`, `1-${uuid()}`]
  await h(t).withLog('Given I have 2 group conversation group1 and group2, each one have two post in order, and one group2 in favoriteSection', async () => {
    await h(t).scenarioHelper.createTeamsOrChats(groups);
    await h(t).glip(loginUser).favoriteGroups([+group2.glipId]);
    for (const group of groups) {
      for (const msg of msgList) {
        await h(t).scenarioHelper.sentAndGetTextPostId(msg, group, loginUser);
      }
    }
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const favoriteSection = app.homePage.messageTab.favoritesSection;
  const directMessageSection = app.homePage.messageTab.directMessagesSection;
  const teamSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open  "convertToTeam" dialog of group1 via conversation page more menu', async () => {
    await directMessageSection.conversationEntryById(group1.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.convertToTeam.enter();
  });

  const convertToTeamDialog = app.homePage.convertToTeamModal;
  await h(t).withLog('Then convertToTeam dialog appear', async () => {
    await convertToTeamDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Cancel" button', async () => {
    await convertToTeamDialog.clickCancelButton();
  });

  await h(t).withLog('Then convertToTeam dialog dismiss', async () => {
    await convertToTeamDialog.ensureDismiss();
  });

  await h(t).withLog('When I open  "convertToTeam" dialog of group1 again via conversation page more menu', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.convertToTeam.enter();
  }, true);

  const teamNames: string[] = [`${uuid()}`, `${uuid()} with space`];
  await h(t).withLog(`And type team name ${teamNames[0]} and click "convert to team" button`, async () => {
    await convertToTeamDialog.typeTeamName(teamNames[0]);
    await convertToTeamDialog.clickConvertToTeamButton();
  });

  await h(t).withLog('Then should open team conversation automatically', async () => {
    await conversationPage.titleShouldBe(teamNames[0]);
  }, true);

  await h(t).withLog('And The two post are loaded and Cursor focus on message input field', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.historyPostsDisplayedInOrder(msgList);
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  await h(t).withLog('And the team should exist in top of team section', async () => {
    await teamSection.nthConversationEntry(0).nameShouldBe(teamNames[0]);
  });

  await h(t).withLog('And Old group has been deleted', async () => {
    await directMessageSection.conversationEntryById(group1.glipId).ensureDismiss();
  });

  await h(t).withLog('When I open group1 profile', async () => {
    await teamSection.conversationEntryByName(teamNames[0]).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  const viewProfile = app.homePage.profileDialog;
  await h(t).withLog('Then group1 should only has one admin is login user', async () => {
    await viewProfile.memberEntryById(loginUserGlipId).showAdminLabel();
    await t.expect(viewProfile.adminLabel.count).eql(1);
    await viewProfile.clickCloseButton();
  });

  // favoriteSection
  await h(t).withLog('When I open "convertToTeam" dialog of group2 via conversation profile setting', async () => {
    await favoriteSection.conversationEntryById(group2.glipId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await viewProfile.clickSetting();
    await app.homePage.teamSettingDialog.ensureLoaded();
    await app.homePage.teamSettingDialog.clickConvertToTeamButton();
  });

  await h(t).withLog('Then convertToTeam dialog appear', async () => {
    await convertToTeamDialog.ensureLoaded();
  }, true);

  await h(t).withLog('When I click "Cancel" button', async () => {
    await convertToTeamDialog.clickCancelButton();
  });

  await h(t).withLog('Then convertToTeam dialog dismiss', async () => {
    await convertToTeamDialog.ensureDismiss();
  });

  await h(t).withLog('When I open "convertToTeam" dialog of group2 again via conversation profile setting', async () => {
    await favoriteSection.conversationEntryById(group2.glipId).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
    await viewProfile.clickSetting();
    await app.homePage.teamSettingDialog.ensureLoaded();
    await app.homePage.teamSettingDialog.clickConvertToTeamButton();
  }, true);

  await h(t).withLog(`And type team name ${teamNames[1]} and click "convert to team" button`, async () => {
    await convertToTeamDialog.typeTeamName(teamNames[1]);
    await convertToTeamDialog.clickConvertToTeamButton();
  });

  await h(t).withLog('Then should open team conversation automatically', async () => {
    await conversationPage.titleShouldBe(teamNames[1]);
  }, true);

  await h(t).withLog('And The two post are loaded and Cursor focus on message input field', async () => {
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.historyPostsDisplayedInOrder(msgList);
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  await h(t).withLog('And the team should exist in top of team section', async () => {
    await teamSection.nthConversationEntry(0).nameShouldBe(teamNames[1]);
  });

  await h(t).withLog('And Old group has been deleted', async () => {
    await favoriteSection.conversationEntryById(group2.glipId).ensureDismiss();
  });

  await h(t).withLog('When I open group2 profile', async () => {
    await teamSection.conversationEntryByName(teamNames[1]).openMoreMenu();
    await app.homePage.messageTab.moreMenu.profile.enter();
  });

  await h(t).withLog('Then group2 should only has one admin is login user', async () => {
    await viewProfile.memberEntryById(loginUserGlipId).showAdminLabel();
    await t.expect(viewProfile.adminLabel.count).eql(1);
  });
});

test(formalName('Check the default team name on “Convert to team” prompt', ['P2', 'JPT-1398', 'Potar.He', 'ConvertToTeam']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[5]
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  const prefix = "Team: "

  let group = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[0], users[1]]
  }

  await h(t).withLog('Given I have 1 group conversation ', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessageSection = app.homePage.messageTab.directMessagesSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  let groupName: string;
  await h(t).withLog('When I click More button on conversation page header', async () => {
    await directMessageSection.conversationEntryById(group.glipId).enter();
    groupName = await conversationPage.title.textContent;
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then Convert to team item shows', async () => {
    await conversationPage.headerMoreMenu.convertToTeam.ensureLoaded();
  }, true);

  const convertToTeamDialog = app.homePage.convertToTeamModal;
  await h(t).withLog('When I click "Convert to team" button', async () => {
    await conversationPage.headerMoreMenu.convertToTeam.enter();

  });

  await h(t).withLog('Then Convert to team prompt appear', async () => {
    await convertToTeamDialog.ensureLoaded();
  });

  await h(t).withLog('And the Team name field will be focused', async () => {
    await t.expect(convertToTeamDialog.teamNameInput.focused).ok();
  });

  const getElementSelectionStart = ClientFunction(selector => selector().selectionStart);
  const getElementSelectionEnd = ClientFunction(selector => selector().selectionEnd);
  const teamName = `${prefix}${groupName}`

  await h(t).withLog(`And the pre-filled team name("${teamName}") should be in selected state`, async () => {
    await t.expect(convertToTeamDialog.teamNameInput.value).eql(teamName);
    const startPosition = await getElementSelectionStart(convertToTeamDialog.teamNameInput);
    const endPosition = await getElementSelectionEnd(convertToTeamDialog.teamNameInput);
    await t.expect(startPosition).eql(0);
    await t.expect(endPosition).eql(teamName.length);
  });

  await h(t).withLog(`Given I ensured no team name "${teamName}" exists via Api`, async () => {
    const teamId =  await h(t).glip(loginUser).getTeamIdByName(teamName);
    if (teamId) {
      await h(t).glip(loginUser).modifyGroupName(teamId, uuid());
    }
  });

  await h(t).withLog('When I click "Convert to team" button', async () => {
    await convertToTeamDialog.clickConvertToTeamButton();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`Then I should fine the new team named: "${teamName}"`, async () => {
    await conversationPage.titleShouldBe(teamName);
    await teamSection.nthConversationEntry(0).nameShouldBe(teamName);
  });
});
