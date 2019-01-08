/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-07 16:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('search/PublicTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`Display Join button for public team which login user doesn't join in search result.`, ['P2', 'JPT-703', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(otherUser).init();
  await h(t).glip(otherUser).init()
  const otherUserName = await h(t).glip(otherUser).getPerson(otherUser.rcId)
    .then(res => res.data.display_name);

  const publicTeamName = uuid();
  const joinedTeamName = uuid();

  let publicTeamId, joinedTeamId;
  await h(t).withLog('Given I have a public team A but loginUser did not join it, team B (loginUser joined),and some group', async () => {
    publicTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: publicTeamName,
      type: 'Team',
      members: [otherUser.rcId],
    });

    joinedTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: joinedTeamName,
      type: 'Team',
      members: [otherUser.rcId, loginUser.rcId],
    });

    await h(t).platform(otherUser).createGroup({
      type: 'Group',
      members: [loginUser.rcId, otherUser.rcId],
    });

    await h(t).platform(otherUser).createGroup({
      type: 'Group',
      members: [otherUser.rcId,],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;

  await h(t).withLog(`When I search and hover the public team A ${publicTeamName}`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await search.itemEntryByCid(publicTeamId).shouldHasJoinButton();
  })

  await h(t).withLog(`When I search and hover the joined team B ${joinedTeamName}`, async () => {
    await search.typeText(joinedTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(joinedTeamId).self);
  });

  await h(t).withLog(`Then the join button should not be showed `, async () => {
    await search.itemEntryByCid(joinedTeamId).shouldNotHasJoinButton();
  });

  let peopleCount, groupCount;
  await h(t).withLog(`When I search the people ${otherUserName}`, async () => {
    await search.typeText(otherUserName, { replace: true, paste: true });

  });
  await h(t).withLog(`Then at least one people and one group should be showed`, async () => {
    await t.expect(search.peoples.count).gte(1);
    await t.expect(search.groups.count).gte(1);
    peopleCount = await search.peoples.count;
    groupCount = await search.groups.count;
  });

  for (let i in _.range(peopleCount)) {
    const item = search.nthPeople(Number(i));
    await h(t).withLog(`When I hover each one group result ${i}/${peopleCount}`, async () => {
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHasJoinButton();
    });
  }
  for (let i in _.range(groupCount)) {
    const item = search.nthGroup(Number(i));
    await h(t).withLog(`When I hover each one people result ${i}/${groupCount}`, async () => {
      await t.hover(item.self);
    });

    await h(t).withLog(`Then the join button should not be showed`, async () => {
      await item.shouldNotHasJoinButton();
    });
  }
});

test(formalName(`Confirmation will dismiss when click cancel button.`, ['P2', 'JPT-704', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(otherUser).init();
  await h(t).glip(otherUser).init()

  const publicTeamName = uuid();
  const newTeamName = uuid();

  let publicTeamId;
  await h(t).withLog('Given I have a public team A but loginUser did not join it', async () => {
    publicTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: publicTeamName,
      type: 'Team',
      members: [otherUser.rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;

  await h(t).withLog(`When I search and hover the public team A ${publicTeamName}`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await search.itemEntryByCid(publicTeamId).shouldHasJoinButton();
  })

  await h(t).withLog(`When I click join button`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then search result list dismiss`, async () => {
    await t.expect(search.itemEntryByCid(publicTeamId).exists).notOk();
  });

  const joinTeamDialog = app.homePage.joinTeamDialog;
  await h(t).withLog(`And display a confirmation`, async () => {
    await t.expect(joinTeamDialog.title.exists).ok();
    await joinTeamDialog.shouldBeTeam(publicTeamName);
    await t.expect(joinTeamDialog.joinButton.exists).ok();
    await t.expect(joinTeamDialog.cancelButton.exists).ok();
  });

  await h(t).withLog(`When the public team admin update team name to ${newTeamName}`, async () => {
    await h(t).glip(otherUser).updateTeamName(publicTeamId, newTeamName);
  });

  await h(t).withLog(`Then the join team confirmation content should sync`, async () => {
    await joinTeamDialog.shouldBeTeam(newTeamName);
  });

  await h(t).withLog(`When I click cancel button`, async () => {
    await h(t).glip(otherUser).updateTeamName(publicTeamId, newTeamName);
  });

  await h(t).withLog(`Then the join team confirmation should dismiss`, async () => {
    await joinTeamDialog.shouldBeTeam(newTeamName);
  });

  await h(t).withLog(`And loginUser did not join team A`, async () => {
    await t.expect(app.homePage.messageTab.teamsSection.conversationEntryById(publicTeamId).exists).notOk();
  });
});


test(formalName(`Joined team successful after clicking join button in confirmation.`, ['P1', 'JPT-718', 'PublicTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(otherUser).init();
  await h(t).glip(otherUser).init()

  const publicTeamName = uuid();

  let publicTeamId;
  await h(t).withLog('Given I have a public team A but loginUser did not join it', async () => {
    publicTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: publicTeamName,
      type: 'Team',
      members: [otherUser.rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I search and hover the public team A ${publicTeamName}`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await search.itemEntryByCid(publicTeamId).shouldHasJoinButton();
  })

  await h(t).withLog(`When I click join button`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then team A should be opened, and displayed on the top of conversation list`, async () => {
    await app.homePage.messageTab.conversationPage.groupIdShouldBe(publicTeamId);
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).groupIdShouldBe(publicTeamId);
  });

  let members;
  await h(t).withLog(`When admin of team A check the team members`, async () => {
    members = await h(t).glip(otherUser).getGroup(publicTeamId).then(res => res.data.members);
  });

  await h(t).withLog(`Then can see loginUser in it`, async () => {
    const loginUserGlipId = await h(t).glip(otherUser).toPersonId(loginUser.rcId);
    assert.ok(_.includes(members, loginUser.rcId), "loginUser is not in team A");
  });

});