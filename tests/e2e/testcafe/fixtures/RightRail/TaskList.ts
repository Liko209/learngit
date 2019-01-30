/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-18 16:52:03
 * Copyright © RingCentral. All rights reserved.
 */


import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail/TaskList')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('New task will show under Tasks tab', ['Nello', 'P1', 'JPT-850', 'TaskList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I click Task Tab', async () => {
    await rightRail.tasksEntry.enter();
    await rightRail.tasksEntry.shouldBeOpened();
  })
  // step 2 create a task
  await h(t).withLog('Then User create tasks count should be 2', async () => {
    await t.wait(3000);
    await h(t).glip(loginUser).createSimpleTask(teamId, loginUser.rcId, taskTitle);
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).ok();
    await tasksTab.countOnSubTitleShouldBe(1);
    await h(t).glip(loginUser).createSimpleTask(teamId, loginUser.rcId, taskTitle);
    await tasksTab.countOnSubTitleShouldBe(2);
  });

});

test(formalName('Task info will sync immediately when update', ['Nello', 'P2', 'JPT-852', 'TaskList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  const taskUpdateTitle = 'New Title';
  let taskId;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I click Task Tab', async () => {
    await rightRail.tasksEntry.enter();
    await rightRail.tasksEntry.shouldBeOpened();
  })
  // step 2 create a task
  await h(t).withLog('Then User create a task', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(teamId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).ok();
  });

  // step 3 update a task
  await h(t).withLog('Then user update task title', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      text: taskUpdateTitle,
    });
    await t.expect(tasksTab.nthItem(0).withText(taskUpdateTitle).exists).ok();
  })

});


test(formalName('Deleted task will NOT show under Tasks tab', ['Nello', 'P1', 'JPT-851', 'TaskList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  let taskId;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I click Task Tab', async () => {
    await rightRail.tasksEntry.enter();
    await rightRail.tasksEntry.shouldBeOpened();
  })
  // step 2 create a task
  await h(t).withLog('Then User create a task', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(teamId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).ok();
  });

  // step 3 delete a task
  await h(t).withLog('Then user delete a task', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      deactivated: true,
    });
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).notOk();
  })

});


test(formalName('Completed task will NOT show under Tasks tab', ['Nello', 'P1', 'JPT-960', 'TaskList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  let taskId;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const tasksTab = rightRail.tasksTab;
  await h(t).withLog('When I click Task Tab', async () => {
    await rightRail.tasksEntry.enter();
    await rightRail.tasksEntry.shouldBeOpened();
  })
  // step 2 create a task
  await h(t).withLog('Then User create a task', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(teamId, loginUser.rcId, taskTitle);
    taskId = resp.data._id;
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).ok();
  });

  // step 3 complete a task
  await h(t).withLog('Then user complete a task', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_boolean: true,
    });
    await t.expect(tasksTab.nthItem(0).withText(taskTitle).exists).notOk();
  })

});
