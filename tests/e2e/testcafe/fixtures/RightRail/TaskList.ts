/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-18 16:52:03
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('RightRail/TaskList')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('New task will show under Tasks tab', ['Nello', 'P1', 'JPT-850', 'TaskList']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
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
  const conversationPage = app.homePage.messageTab.conversationPage;
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I enter a conversation and click Task Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.tasksEntry.enter();
  });

  await h(t).withLog('Then the Task Tab should be opened', async () => {
    await rightRail.tasksEntry.shouldBeOpened();
  });

  // step 2 create a task
  await h(t).withLog('When User create 1 tasks via api', async () => {
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
    await t.expect(conversationPage.posts.count).eql(1, { timeout: 5e3 });
  });

  await h(t).withLog('Then tasks count in tasks tab should be 1', async () => {
    await tasksTab.nthItemTitleShouldBe(0, taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(1);
    await tasksTab.countInListShouldBe(1);
  });

  await h(t).withLog('When User create 1 tasks again via api', async () => {
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
    await t.expect(conversationPage.posts.count).eql(2, { timeout: 5e3 });
  });

  await h(t).withLog('Then tasks count in tasks tab should be 2', async () => {
    // await tasksTab.countOnSubTitleShouldBe(2);
    await tasksTab.countInListShouldBe(2);
  });
});

test(formalName('Task info will sync immediately when update', ['Nello', 'P2', 'JPT-852', 'TaskList']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  const taskUpdateTitle = 'New Title';
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
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I enter a conversation and click Task Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.tasksEntry.enter();
  });

  await h(t).withLog('Then the Task Tab should be opened', async () => {
    await rightRail.tasksEntry.shouldBeOpened();
  });

  // step 2 create a task
  let taskId;
  await h(t).withLog('When User create 1 tasks via api', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
  });

  await h(t).withLog('Then tasks count in tasks tab should be 1', async () => {
    await tasksTab.nthItemTitleShouldBe(0, taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(1);
    await tasksTab.countInListShouldBe(1);
  });

  // step 3 update a task
  await h(t).withLog('When user update task title', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      text: taskUpdateTitle,
    });
  });

  await h(t).withLog(`ThenAll task's elements are updated immediately`, async () => {
    await tasksTab.nthItemTitleShouldBe(0, taskUpdateTitle);
    await tasksTab.countInListShouldBe(1);
  })

});


test(formalName('Deleted task will NOT show under Tasks tab', ['Nello', 'P1', 'JPT-851', 'TaskList']), async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
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

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I enter a conversation and click Task Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.tasksEntry.enter();
  });

  await h(t).withLog('Then the Task Tab should be opened', async () => {
    await rightRail.tasksEntry.shouldBeOpened();
  });

  // step 2 create 2 task
  let taskId;
  await h(t).withLog('When User create task A and Task B via api', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, uuid());
  });

  await h(t).withLog('Then tasks count in tasks tab should be 2', async () => {
    await tasksTab.shouldHasTitle(taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(2);
    await tasksTab.countInListShouldBe(2);
  });

  // step 3 delete a task
  await h(t).withLog('When user delete a task', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      deactivated: true,
    });
  });

  await h(t).withLog(`Then The 'Task' is removed from Tasks tab immediately`, async () => {
    await tasksTab.shouldHasNoTitle(taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(1);
    await tasksTab.countInListShouldBe(1);
  });
});


test(formalName('Completed task will NOT show under Tasks tab', ['Nello', 'P1', 'JPT-960', 'TaskList']), async t => {
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

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I enter a conversation and click Task Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.tasksEntry.enter();
  });

  await h(t).withLog('Then the Task Tab should be opened', async () => {
    await rightRail.tasksEntry.shouldBeOpened();
  });

  // step 2 create 2 task
  let taskId;
  const taskTitle = uuid();
  await h(t).withLog('When User create task A and Task B via api', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, uuid());
  });

  await h(t).withLog('Then tasks count in tasks tab should be 2', async () => {
    await tasksTab.shouldHasTitle(taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(2);
    await tasksTab.countInListShouldBe(2);
  });

  // step 3 complete a task
  await h(t).withLog('When user complete the task A', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_boolean: true,
    });
  });

  await h(t).withLog(`Then The Task A is removed from Tasks tab`, async () => {
    await tasksTab.shouldHasNoTitle(taskTitle);
    // await tasksTab.countOnSubTitleShouldBe(1);
    await tasksTab.countInListShouldBe(1);
  });
});
