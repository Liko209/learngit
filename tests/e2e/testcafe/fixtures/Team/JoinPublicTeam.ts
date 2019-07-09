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
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Team/PublicTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-703'],
  maintainers: ['potar.he'],
  keywords: ['search', 'PublicTeam'],
})(`Display Join button for public team which login user doesn't join in search result.`, async t => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const me = users[4];
  const anotherUser = users[5];
  await h(t).glip(me).init();
  const otherUserName = await h(t).glip(me).getPersonPartialData('display_name', anotherUser.rcId)

  const searchKeyword = H.uuid();
  let publicTeamWithoutMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${searchKeyword} publicWithoutMe`,
    owner: anotherUser,
    members: [anotherUser]
  }

  let publicTeamWithMe = <IGroup>{
    type: "Team",
    isPublic: true,
    name: `${searchKeyword} publicWithMe`,
    owner: anotherUser,
    members: [anotherUser, me]
  }

  let otherChat = <IGroup>{
    type: "DirectMessage",
    owner: me,
    members: [me, anotherUser, users[0]]
  }

  await h(t).withLog(`Given there are public teams (I joined and did not join), people and group chat`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithMe, publicTeamWithoutMe, otherChat]);
  });

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: me.company.number,
      extension: me.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword "{searchKeyWord}"`, async (step) => {
    step.setMetadata('searchKeyWord', searchKeyword);
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(searchKeyword);
    await t.expect(searchDialog.instantPage.teams.count).gte(1, { timeout: 10e3 });
  });

  await h(t).withLog(`And I hover search result publicTeamWithoutMe “{name}”`, async (step) => {
    step.setMetadata('name', publicTeamWithoutMe.name);
    await t.hover(searchDialog.instantPage.conversationEntryByCid(publicTeamWithoutMe.glipId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithoutMe.glipId).shouldHaveJoinButton();
  });

  await h(t).withLog(`When I hover search result publicTeamWithMe “{name}”`, async (step) => {
    step.setMetadata('name', publicTeamWithMe.name);
    await t.hover(searchDialog.instantPage.conversationEntryByCid(publicTeamWithMe.glipId).self);
  });

  await h(t).withLog(`Then the join button should not be showed`, async () => {
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithMe.glipId).shouldNotHaveJoinButton();
  });

  let peopleCount, groupCount;
  await h(t).withLog(`When I search keyword otherUserName "{name}”`, async (step) => {
    step.setMetadata('name', otherUserName);
    await searchDialog.typeSearchKeyword(otherUserName);
    await t.expect(searchDialog.instantPage.conversationItems.count).gte(1, { timeout: 10e3 });
    peopleCount = await searchDialog.instantPage.peoples.count;
    groupCount = await searchDialog.instantPage.groups.count;
  });

  for (let i of _.range(peopleCount)) {
    const item = searchDialog.instantPage.nthPeople(i);
    await h(t).withLog(`When I hover each one group result {index}`, async (step) => {
      step.setMetadata('index', `${i + 1}/${peopleCount}`);
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHaveJoinButton();
    });
  }

  for (let i of _.range(groupCount)) {
    const item = searchDialog.instantPage.nthGroup(i);
    await h(t).withLog(`When I hover each one people result {index}`, async (step) => {
      step.setMetadata('index', `${i + 1}/${groupCount}`);
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHaveJoinButton();
    });
  }
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-704'],
  maintainers: ['potar.he'],
  keywords: ['search', 'PublicTeam'],
})(`Confirmation will dismiss when click cancel button.`, async t => {
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

  await h(t).withLog(`Given there is a public team without me named "{name}" `, async (step) => {
    step.setMetadata('name', publicTeamWithoutMe.name)
    await h(t).scenarioHelper.createTeam(publicTeamWithoutMe);
  });

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: me.company.number,
      extension: me.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;

  await h(t).withLog(`When I search keyword "{searchKeyWord}"`, async (step) => {
    step.setMetadata('searchKeyWord', searchKeyword);
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(searchKeyword);
    await t.expect(searchDialog.instantPage.teams.count).gte(1, { timeout: 10e3 });
  })

  await h(t).withLog(`And I click join button of the public team`, async () => {
    await t.expect(searchDialog.instantPage.teams.count).gte(1, { timeout: 10e3 });
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithoutMe.glipId).join();
  });

  await h(t).withLog(`Then search result list dismiss`, async () => {
    await t.expect(searchDialog.instantPage.conversationEntryByCid(publicTeamWithoutMe.glipId).exists).notOk();
  });

  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`And display a confirmation`, async () => {
    await joinTeamDialog.ensureLoaded();
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
    await joinTeamDialog.clickCancelButton();
  });

  await h(t).withLog(`And The confirmation dismiss, loginUser did not join team`, async () => {
    await t.expect(joinTeamDialog.exists).notOk();
    await t.expect(app.homePage.messageTab.teamsSection.conversationEntryById(publicTeamWithoutMe.glipId).exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-718'],
  maintainers: ['potar.he'],
  keywords: ['search', 'PublicTeam'],
})(`Joined team successful after clicking join button in confirmation.`, async t => {
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

  await h(t).withLog(`Given there is a public teamA without me named "{name}" `, async (step) => {
    step.setMetadata('name', publicTeamWithoutMe.name)
    await h(t).scenarioHelper.createTeam(publicTeamWithoutMe);
  });

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: me.company.number,
      extension: me.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, me);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search the public teamA {teamA}, and click Join button of teamA`, async (step) => {
    step.setMetadata('teamA', publicTeamWithoutMe.name)
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(publicTeamWithoutMe.name);
    await t.expect(searchDialog.instantPage.teams.count).gte(1, { timeout: 10e3 });
    await searchDialog.instantPage.conversationEntryByCid(publicTeamWithoutMe.glipId).join();
  });


  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`Then display a confirmation`, async () => {
    await t.expect(joinTeamDialog.title.exists).ok();
    await joinTeamDialog.shouldBeTeam(publicTeamWithoutMe.name);
    await t.expect(joinTeamDialog.joinButton.exists).ok();
    await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });

  await h(t).withLog(`When I click Join confirm button`, async () => {
    await joinTeamDialog.clickJoinButton();
  });

  await h(t).withLog(`Then The confirmation dismiss`, async () => {
    await t.expect(joinTeamDialog.exists).notOk();
  });

  await h(t).withLog(`And team A should be opened, and displayed on the top of conversation list`, async () => {
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

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-858'],
  keywords: ['PublicTeam'],
  maintainers: ['Potar.He']
})(`The user should see go to conversation icon instead of the join team icon when the user was added by someone to the team`, async t => {
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
    type: "DirectMessage",
    owner: loginUser,
    members: [adminUser, loginUser]
  }

  await h(t).withLog('Given I have a public_team but loginUser did not join it, and 1:1 conversation ', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithoutMe, chatWithMe]);
  });

  let teamMentionPostId;
  await h(t).withLog(`And adminUser send @{public_team} post to loginUser`, async (step) => {
    step.setMetadata('public_team', publicTeamWithoutMe.name)
    teamMentionPostId = await h(t).platform(adminUser).sentAndGetTextPostId(
      `Join public team, ![:Team](${publicTeamWithoutMe.glipId})`,
      chatWithMe.glipId,
    );
  });

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(teamMentionPostId);
  await h(t).withLog(`When loginUser click the @{public_team} mention`, async (step) => {
    step.setMetadata('public_team', publicTeamWithoutMe.name)
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
    await profileDialog.ensureLoaded();
    await t.expect(profileDialog.joinTeamButton.exists).ok();
    await profileDialog.clickCloseButton();
  });

  await h(t).withLog(`When adminUser add loginUser to the Public_team`, async () => {
    await h(t).scenarioHelper.addMemberToTeam(publicTeamWithoutMe, [loginUser]);
  });

  await h(t).withLog(`And loginUser checks the display of the button on profile dialog`, async () => {
    await t.click(post.mentions);
    await miniProfile.openProfile();
  });

  await h(t).withLog(`Then "go to conversation" icon should be shown`, async () => {
    await t.expect(profileDialog.messageButton.exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-867'],
  keywords: ['PublicTeam'],
  maintainers: ['Potar.He']
})(`Will show confirmation dialog when joining the public team from a public team profile`, async t => {
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
    type: "DirectMessage",
    owner: loginUser,
    members: [adminUser, loginUser]
  }

  await h(t).withLog('Given I have a public_team but loginUser did not join it, and 1:1 conversation ', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([publicTeamWithoutMe, chatWithMe]);
  });

  let teamMentionPostId;
  await h(t).withLog(`And adminUser send @{public_team} post to loginUser`, async (step) => {
    step.setMetadata('public_team', publicTeamWithoutMe.name)
    teamMentionPostId = await h(t).platform(adminUser).sentAndGetTextPostId(
      `Join public team, ![:Team](${publicTeamWithoutMe.glipId})`,
      chatWithMe.glipId,
    );
  });

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;
  const post = conversationPage.postItemById(teamMentionPostId);
  await h(t).withLog(`When loginUser click the @{public_team} mention`, async (step) => {
    step.setMetadata('public_team', publicTeamWithoutMe.name)
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
    await profileDialog.ensureLoaded();
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
