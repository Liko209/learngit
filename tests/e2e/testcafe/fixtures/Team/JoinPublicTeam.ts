/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-07 16:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('Team/PublicTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`Display Join button for public team which login user doesn't join in search result.`, ['P2', 'JPT-703', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const me = users[4];
  const anotherUser = users[5];
  await h(t).glip(me).init();
  const otherUserName = await h(t).glip(me).getPersonPartialData('display_name', anotherUser.rcId)

  const searchKeyWord = H.uuid();
  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${searchKeyWord} publicWithoutMe`,
    owner: anotherUser,
    members: [anotherUser]
  }

  let publicTeamWithMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${searchKeyWord} publicWithMe`,
    owner: anotherUser,
    members: [anotherUser, me]
  }

  let otherChat = <IGroup>{
    type: "Chat",
    owner: me,
    members: [me, anotherUser, users[0]]
  }

  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);
  await h(t).withLog(`And there are public teams (I joined and did not join), people and group chat`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithMe, publicTeamWithoutMe, otherChat]);
  });

  await h(t).withLog(`When I login Jupiter with this extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.searchBar;
  await h(t).withLog(`When I search keyword “${searchKeyWord}”`, async () => {
    await search.typeSearchKeyword(searchKeyWord, { replace: true, paste: true });
    await t.expect(search.teams.count).gte(1, { timeout: 10e3 });
  });

  await h(t).withLog(`And I hover search result “${publicTeamWithoutMe.name}”`, async () => {
    await t.hover(search.getSearchItemByCid(publicTeamWithoutMe.glipId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await search.getSearchItemByCid(publicTeamWithoutMe.glipId).shouldHaveJoinButton();
  });

  await h(t).withLog(`When I hover search result “${publicTeamWithMe.name}”`, async () => {
    await t.hover(search.getSearchItemByCid(publicTeamWithMe.glipId).self);
  });

  await h(t).withLog(`Then the join button should not be showed `, async () => {
    await search.getSearchItemByCid(publicTeamWithMe.glipId).shouldNotHaveJoinButton();
  });

  let peopleCount, groupCount;
  await h(t).withLog(`When I search keyword "${otherUserName}”`, async () => {
    await search.typeSearchKeyword(otherUserName, { replace: true, paste: true });
    await t.expect(search.allResultItems.count).gte(1, { timeout: 10e3 });
    peopleCount = await search.peoples.count;
    groupCount = await search.groups.count;
  });

  for (let i of _.range(peopleCount)) {
    const item = search.nthPeople(i);
    await h(t).withLog(`When I hover each one group result ${i + 1}/${peopleCount}`, async () => {
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHaveJoinButton();
    });
  }

  for (let i of _.range(groupCount)) {
    const item = search.nthGroup(i);
    await h(t).withLog(`When I hover each one people result ${i + 1}/${groupCount}`, async () => {
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHaveJoinButton();
    });
  }
});

test(formalName(`Confirmation will dismiss when click cancel button.`, ['P2', 'JPT-704', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const me = h(t).rcData.mainCompany.users[4];
  const anotherUser = h(t).rcData.mainCompany.users[5];

  const searchKeyword = uuid();

  let publicTeamWithoutMe = <IGroup>{
    type: 'Team', isPublic: true,
    name: `${searchKeyword} PublicTeamWithoutMe`,
    owner: anotherUser,
    members: [anotherUser],
  };

  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);
  await h(t).withLog(`And there is a public team named "${publicTeamWithoutMe.name}" without me`, async () => {
    await h(t).scenarioHelper.createTeam(publicTeamWithoutMe);
  });

  await h(t).withLog(`When I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.searchBar;

  await h(t).withLog(`When I search the public team ${searchKeyword}`, async () => {
    await search.typeSearchKeyword(searchKeyword, { replace: true, paste: true });
  });

  await h(t).withLog(`And I click join button of the public team A`, async () => {
    await t.expect(search.teams.count).gte(1, { timeout: 10e3 });
    await search.getSearchItemByCid(publicTeamWithoutMe.glipId).join();
  });

  await h(t).withLog(`Then search result list dismiss`, async () => {
    await t.expect(search.getSearchItemByCid(publicTeamWithoutMe.glipId).exists).notOk();
  });

  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`And display a confirmation`, async () => {
    await t.expect(joinTeamDialog.title.exists).ok();
    await joinTeamDialog.shouldBeTeam(publicTeamWithoutMe.name);
    await t.expect(joinTeamDialog.joinButton.exists).ok();
    await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });

  // Not currently available https://jira.ringcentral.com/projects/FIJI/issues/FIJI-2813
  // await h(t).withLog(`When the public team admin update team name to ${newTeamName}`, async () => {
  //   await h(t).glip(otherUser).updateTeamName(publicTeamId, newTeamName);
  // });

  // await h(t).withLog(`Then the join team confirmation content should sync`, async () => {
  //   await joinTeamDialog.shouldBeTeam(newTeamName);
  // });

  await h(t).withLog(`When I click cancel button`, async () => {
    await joinTeamDialog.cancel();
  });

  await h(t).withLog(`And The confirmation dismiss, loginUser did not join team A`, async () => {
    await t.expect(joinTeamDialog.exists).notOk();
    await t.expect(app.homePage.messageTab.teamsSection.conversationEntryById(publicTeamWithoutMe.glipId).exists).notOk();
  });
});

test(formalName(`Joined team successful after clicking join button in confirmation.`, ['P1', 'JPT-718', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const me = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(otherUser).init();

  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${uuid()} publicTeamWithoutMe`,
    owner: otherUser,
    members: [otherUser]
  }

  await h(t).log(`Given I have an extension "${me.company.number}#${me.extension}"`);

  await h(t).withLog(`And there is public team A without me: ${publicTeamWithoutMe.name}`, async () => {
    await h(t).scenarioHelper.createTeam(publicTeamWithoutMe);
  });

  await h(t).withLog(`When I login Jupiter with this extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.searchBar;
  await h(t).withLog(`When I search the public team A ${publicTeamWithoutMe.name}, and click Join button of team A`, async () => {
    await search.typeSearchKeyword(publicTeamWithoutMe.name, { replace: true, paste: true });
    await t.expect(search.teams.count).gte(1, { timeout: 10e3 });
    await search.getSearchItemByCid(publicTeamWithoutMe.glipId).join();
  });


  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`Then display a confirmation`, async () => {
    await t.expect(joinTeamDialog.title.exists).ok();
    await joinTeamDialog.shouldBeTeam(publicTeamWithoutMe.name);
    await t.expect(joinTeamDialog.joinButton.exists).ok();
    await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });

  await h(t).withLog(`When I click Join confirm button`, async () => {
    await joinTeamDialog.join();
  });

  await h(t).withLog(`Then team A should be opened, and displayed on the top of conversation list`, async () => {
    await app.homePage.messageTab.conversationPage.groupIdShouldBe(publicTeamWithoutMe.glipId);
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).groupIdShouldBe(publicTeamWithoutMe.glipId);
  });

  let members;
  await h(t).withLog(`When admin of team A check the team members`, async () => {
    members = await h(t).glip(otherUser).getGroup(publicTeamWithoutMe.glipId).then(res => res.data.members);
  });

  await h(t).withLog(`Then can see loginUser in it`, async () => {
    const loginUserGlipId = await h(t).glip(otherUser).toPersonId(me.rcId);
    assert.ok(_.includes(members, loginUserGlipId), "loginUser is not in team A");
  });

});

test(formalName(`The user should see go to conversation icon instead of the join team icon when the user was added by someone to the team`, ['P2', 'JPT-858', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];

  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: uuid(),
    owner: adminUser,
    members: [adminUser]
  }

  let chatWithMe = <IGroup>{
    type: "Chat",
    owner: loginUser,
    members: [adminUser, loginUser]
  }

  await h(t).withLog('Given I have a public_team but loginUser did not join it, and 1:1 conversation ', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithoutMe, chatWithMe]);
  });

  let teamMentionPostId;
  await h(t).withLog(`And adminUser send @public_team post to loginUser`, async () => {
    teamMentionPostId = await h(t).platform(adminUser).sentAndGetTextPostId(
      `Join public team, ![:Team](${publicTeamWithoutMe.glipId})`,
      chatWithMe.glipId,
    );
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(teamMentionPostId);
  await h(t).withLog(`When loginUser click the @public_team mention`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chatWithMe.glipId).enter();
    await t.click(post.mentions);
  });

  const miniProfile = app.homePage.miniProfile;
  await h(t).withLog(`Then miniProfile should be popped up`, async () => {
    await miniProfile.shouldBePopUp();
  });

  await h(t).withLog(`When loginUser open Profile dialog`, async () => {
    await miniProfile.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`Then profile dialog should be popped up and show 'Join the team' button`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(profileDialog.joinTeamButton.exists).ok();
    await profileDialog.clickCloseButton();
  });

  await h(t).withLog(`When adminUser add loginUser to the Public_team`, async () => {
    await h(t).scenarioHelper.addMemberToTeam(publicTeamWithoutMe,[loginUser])
  });

  await h(t).withLog(`And loginUser checks the display of the button on profile dialog`, async () => {
    await t.click(post.mentions);
    await miniProfile.openProfile();
  });

  await h(t).withLog(`Then "go to conversation" icon should be shown`, async () => {
    await t.expect(profileDialog.messageButton.exists).ok();
  });
});


test(formalName(`Will show confirmation dialog when joining the public team from a public team profile`, ['P2', 'JPT-867', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const adminUser = h(t).rcData.mainCompany.users[5];

  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: uuid(),
    owner: adminUser,
    members: [adminUser]
  }

  let chatWithMe = <IGroup>{
    type: "Chat",
    owner: loginUser,
    members: [adminUser, loginUser]
  }

  await h(t).withLog('Given I have a public_team but loginUser did not join it, and 1:1 conversation ', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithoutMe, chatWithMe]);
  });

  let teamMentionPostId;
  await h(t).withLog(`And adminUser send @public_team post to loginUser`, async () => {
    teamMentionPostId = await h(t).platform(adminUser).sentAndGetTextPostId(
      `Join public team, ![:Team](${publicTeamWithoutMe.glipId})`,
      chatWithMe.glipId,
    );
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(teamMentionPostId);
  await h(t).withLog(`When loginUser click the @public_team mention`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chatWithMe.glipId).enter();
    await t.click(post.mentions);
  });

  const miniProfile = app.homePage.miniProfile;
  await h(t).withLog(`Then miniProfile should be popped up`, async () => {
    await miniProfile.shouldBePopUp();
  });

  await h(t).withLog(`When loginUser open Profile dialog`, async () => {
    await miniProfile.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog(`Then profile dialog should be popped up and show 'Join the team' button`, async () => {
    await profileDialog.shouldBePopUp();
    await t.expect(profileDialog.joinTeamButton.exists).ok();
  });

  await h(t).withLog(`When loginUser clicks the "Join the team" button`, async () => {
    await profileDialog.joinTeam();
  });

  await h(t).withLog(`The confirmation dialog should be displayed and the profile dialog should be closed.`, async () => {
    await t.expect(app.homePage.joinTeamDialog.exists).ok();
    await t.expect(profileDialog.exists).notOk();
  });
});
