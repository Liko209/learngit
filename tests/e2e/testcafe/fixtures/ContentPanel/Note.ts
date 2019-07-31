/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.com)
 * @Date: 5/08/2019 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import * as faker from 'faker/locale/en';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Note')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-263'],
  maintainers: ['ali.naffaa'],
  keywords: ['Note'],
})('Check the display of Note in the conversation card', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();
  let noteTitle = uuid();
  const otherUserName = await h(t).glip(otherUser).getPersonPartialData('display_name');

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser],
  };
  const noteBody = 'some text';
  const noteAction = 'shared a note';
  let notePostId, noteId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And User B send a note to A : ${noteTitle}`, async () => {
    const data = await h(t).glip(otherUser).createSimpleNote(team.glipId, noteTitle).then(res => res.data);
    noteId = data['_id'];
    notePostId = data['post_ids'][0].toString();
  });

  await h(t).withLog(`When I login Jupiter as User A: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  },
  );
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And open a team', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('Then User A check the note display', async () => {
    const postCard = conversationPage.postItemById(notePostId);
    await t.expect(postCard.name.textContent).eql(otherUserName);
    await t.expect(postCard.itemCardActivity.withText(noteAction).exists).ok();
    await t.expect(postCard.textContent).contains(noteTitle);
  });
  noteTitle = uuid();
  await h(t).withLog(`When User B update a note ${noteTitle}`, async () => {
    await h(t).glip(otherUser).updateNote(noteId, { title: noteTitle, body: noteBody });
  });

  await h(t).withLog('Then User A check the note display', async () => {
    const postCard = conversationPage.postItemById(notePostId);
    await t.expect(postCard.name.textContent).eql(otherUserName);
    await t.expect(postCard.itemCardActivity.withText(noteAction).exists).ok();
    await t.expect(postCard.textContent).contains(noteTitle);
    await t.expect(postCard.textContent).contains(noteBody);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-294'],
  maintainers: ['Mia.Cai'],
  keywords: ['Note'],
})('Check the display of Note that content exceeds 150 characters ', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  const otherUser = users[5];
  await h(t).platform(loginUser).init();
  await h(t).platform(otherUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  await h(t).scenarioHelper.resetProfileAndState(otherUser);
  let noteTitle = uuid();

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser],
  };
  let noteBody = faker.random.alphaNumeric(160);
  let notePostId, noteId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And User B send a note to A : ${noteTitle}`, async () => {
    const data = await h(t).glip(otherUser).createSimpleNote(team.glipId, noteTitle, { body: noteBody }).then(res => res.data);
    noteId = data['_id'];
    notePostId = data['post_ids'][0].toString();
  });

  await h(t).withLog(`When I login Jupiter as User A: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  },
  );
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I open the team', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  noteBody = noteBody.substring(0, 150) + '...';
  await h(t).withLog('Then I can see "..." after No.150 character', async () => {
    await t.expect(await conversationPage.nthPostItem(0).itemCard.noteBody.textContent).eql(noteBody);
  });

  noteTitle = uuid();
  noteBody = faker.random.alphaNumeric(155);
  await h(t).withLog(`When User B update the note`, async () => {
    await h(t).glip(otherUser).updateNote(noteId, { title: noteTitle, body: noteBody });
  });

  noteBody = noteBody.substring(0, 150) + '...';
  await h(t).withLog('Then I can see "..." after No.150 character', async () => {
    await t.expect(conversationPage.nthPostItem(0).itemCard.noteBody.textContent).eql(noteBody);
  });
});
