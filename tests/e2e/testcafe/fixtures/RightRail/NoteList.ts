/*
 * @Author: isaac.liu
 * @Date: 2019-01-17 18:37:36
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Check the the sum of the shared notes displayed when add note', ['Isaac', 'P2', 'JPT-779']), async t => {
  const noteTitle = uuid();
  const secondNoteTitle = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a conversation and I click Notes Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.notesEntry.enter();
  });

  await h(t).withLog('Then Notes Tab should be opened', async () => {
    await rightRail.notesEntry.shouldBeOpened();
  });

  // step 2 create a note
  await h(t).withLog('When User create a note', async () => {
    await h(t).glip(loginUser).createSimpleNote(team.glipId, noteTitle);
  });

  await h(t).withLog('Then The notes Tab number should be 1', async () => {
    await rightRail.notesTab.waitUntilItemsListExist();
    await rightRail.notesTab.countInListShouldBe(1);
    // await rightRail.notesTab.countOnSubTitleShouldBe(1);
    await rightRail.notesTab.nthItemTitleShouldBe(0, noteTitle);
  });

  // step 2 create a note
  await h(t).withLog('When User create a new note', async () => {
    await h(t).glip(loginUser).createSimpleNote(team.glipId, secondNoteTitle);
  });

  await h(t).withLog('Then The notes Tab number should be 2', async () => {
    await rightRail.notesTab.countInListShouldBe(2);
    // await rightRail.notesTab.countOnSubTitleShouldBe(2);
    await rightRail.notesTab.nthItemTitleShouldBe(0, secondNoteTitle);
  });
});


test(formalName('Deleted note will NOT show under Notes tab', ['P1', 'JPT-1338', 'Potar.He']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a conversation and I click Notes Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.notesEntry.enter();
  });

  await h(t).withLog('Then Notes Tab should be opened', async () => {
    await rightRail.notesEntry.shouldBeOpened();
  });

  const noteTitle = uuid();
  const secondNoteTitle = uuid();

  let noteId;
  await h(t).withLog('When User create a note A', async () => {
    noteId = await h(t).glip(loginUser).createSimpleNote(team.glipId, noteTitle).then(
      res => res.data._id
    );
  });

  await h(t).withLog('Then The notes Tab number should be 1', async () => {
    await rightRail.notesTab.waitUntilItemsListExist();
    await rightRail.notesTab.countInListShouldBe(1);
    // await rightRail.notesTab.countOnSubTitleShouldBe(1);
    await rightRail.notesTab.nthItemTitleShouldBe(0, noteTitle);
  });

  // step 2 create a note
  await h(t).withLog('When User create a new note B', async () => {
    await h(t).glip(loginUser).createSimpleNote(team.glipId, secondNoteTitle);
  });

  await h(t).withLog('Then The notes Tab number should be 2', async () => {
    await rightRail.notesTab.countInListShouldBe(2);
    // await rightRail.notesTab.countOnSubTitleShouldBe(2);
    await rightRail.notesTab.nthItemTitleShouldBe(0, secondNoteTitle);
  });

  await h(t).withLog('When I delete the note A (via api)', async () => {
    await h(t).glip(loginUser).deleteNote(noteId);
  });

  await h(t).withLog('Then the link is removed from Files tab immediately', async () => {
    await rightRail.notesTab.countInListShouldBe(1);
  });
});