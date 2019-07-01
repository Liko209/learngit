/*
 * @Author: Potar.He 
 * @Date: 2019-06-28 08:58:37 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-28 16:54:23
 */


import { v4 as uuid } from 'uuid';
import * as assert from 'assert';

import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('content panel')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-347'],
  maintainers: ['Potar.he'],
  keywords: ['message', 'Task'],
})('Check the display of Note in the conversation card', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });;

  const taskName = uuid();


  let taskPostId, taskId, updatedPostId, username, anotherName;
  await h(t).withLog(`And the team has a task post`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskName).then(res => {
      taskId = res.data._id;
      taskPostId = res.data.post_ids[0];
    });
    username = await h(t).glip(loginUser).getPersonPartialData('display_name');
    anotherName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
  });

  await h(t).withLog(`And I update the task`, async () => {
    const personIds = await h(t).glip(loginUser).toPersonId([loginUser.rcId, anotherUser.rcId]);
    await h(t).glip(loginUser).updateTask(taskId, {
      assigned_to_ids: H.toNumberArray(personIds),
    }).then(res => {
      updatedPostId = res.data.at_mentioning_post_ids[0];
    });
  })

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  }, true);

  const conversationPage = app.homePage.messageTab.conversationPage;
  const originTaskPostItem = conversationPage.postItemById(taskPostId).itemCard;
  const updatedTaskItemCard = conversationPage.postItemById(updatedPostId).itemCard;
  await h(t).withLog(`Then The original task creation post should be updated`, async () => {
    await conversationPage.postItemById(taskPostId).ensureLoaded();
    await updatedTaskItemCard.ensureLoaded();
  });

  await h(t).withLog(`And Get notified and the task information from the post as below: task name {taskName}`, async (step) => {
    step.setMetadata('taskName', taskName)
    await t.expect(updatedTaskItemCard.title.textContent).eql(taskName);
  });

  await h(t).withLog(`And Assignees with avatar`, async () => {
    await t.expect(updatedTaskItemCard.taskAssignee.count).eql(2);
    await t.expect(updatedTaskItemCard.taskAssigneeAvatar.count).eql(2);
    await t.expect(updatedTaskItemCard.taskAssigneeName.withExactText(username).exists).ok();
    await t.expect(updatedTaskItemCard.taskAssigneeName.withExactText(anotherName).exists).ok();

  });

  await h(t).withLog(`And 'Show old' link`, async () => {
    await t.expect(updatedTaskItemCard.taskShowOrHidOldLink.textContent).ok('Show old');
  });

  await h(t).withLog(`When I click 'Show old' link`, async () => {
    await t.click(updatedTaskItemCard.taskShowOrHidOldLink);
  });

  await h(t).withLog(`Then Show the old assignee`, async () => {
    await t.expect(updatedTaskItemCard.taskOldAssignees.count).eql(1);
    await t.expect(updatedTaskItemCard.taskOldAssigneeNames.withExactText(username).exists).ok();
  })

  await h(t).withLog(`And "Hide" link is shown under the assignee`, async () => {
    await updatedTaskItemCard.hideLinkShouldUnderOldAssignees();
  });

  await h(t).withLog(`When I click 'Hide' link`, async () => {
    await t.click(updatedTaskItemCard.taskShowOrHidOldLink);
  });

  await h(t).withLog(`Then The old assignee will be hidden`, async () => {
    await t.expect(updatedTaskItemCard.taskOldAssigneesDiv.exists).notOk()
  });

  const newTitle = uuid()
  let newPostId: string;
  await h(t).withLog(`When Make someone updated the task information(except assignee)`, async () => {
    await h(t).glip(anotherUser).init();
    await h(t).glip(anotherUser).updateTask(taskId, { text: newTitle }).then(res => {
      newPostId = res.data.at_mentioning_post_ids[0];
    });
  }, true);

  await h(t).withLog(`Then Should no get a new post `, async () => {
    assert.ok(newPostId == updatedPostId, "error: get new post");
  });

  await h(t).withLog(`And The original task creation post should be updated  `, async () => {
    await t.expect(originTaskPostItem.title.textContent).eql(newTitle);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-358'],
  maintainers: ['Potar.he'],
  keywords: ['message', 'Task'],
})('Check the task completion message(Complete when: Checked)', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });;

  const taskName = uuid();
  const completedNotice = 'completed task';

  let taskPostId, taskId;
  await h(t).withLog(`And the team has a task post`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleTask(team.glipId, [anotherUser.rcId], taskName).then(res => {
      taskId = res.data._id;
      taskPostId = res.data.post_ids[0];
    });
  });

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  }, true);


  const conversationPage = app.homePage.messageTab.conversationPage;
  const originTaskPostItem = conversationPage.postItemById(taskPostId).itemCard;
  await h(t).withLog(`Then The original task creation post should be marked incomplete`, async () => {
    await originTaskPostItem.ensureLoaded();
    await originTaskPostItem.taskShouldBeMarkIncomplete();
  });

  let updatedPostId, anotherName;
  await h(t).withLog(`When the assignee make completes this task (via api)`, async () => {
    await h(t).glip(anotherUser).init();
    await h(t).glip(anotherUser).updateTask(taskId, {
      complete_boolean: 1
    }).then(res => {
      const mentionPostIds: number[] = res.data.at_mentioning_post_ids;
      updatedPostId = mentionPostIds[mentionPostIds.length - 1];
    });
    anotherName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
  });

  const newTaskPostItem = conversationPage.postItemById(updatedPostId).itemCard;
  await h(t).withLog(`Then a new post header show {who} {completedNotice}`, async (step) => {
    step.initMetadata({
      who: anotherName,
      completedNotice: completedNotice
    })
    await conversationPage.postItemById(updatedPostId).ensureLoaded();
    await t.expect(conversationPage.postItemById(updatedPostId).name.textContent).eql(anotherName);
    await t.expect(conversationPage.postItemById(updatedPostId).itemCardActivity.textContent).eql(completedNotice);
  });

  await h(t).withLog(`And Below the message card header, the message body should read: [checked] {taskName}`, async () => {
    await newTaskPostItem.taskShouldBeMarkCompleted();
    await t.expect(newTaskPostItem.title.textContent).eql(taskName);
    await t.expect(newTaskPostItem.taskAssignee.exists).notOk();
  });

  await h(t).withLog(`And The original task creation post should be marked completed`, async () => {
    await originTaskPostItem.taskShouldBeMarkCompleted();
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-359'],
  maintainers: ['Potar.he'],
  keywords: ['message', 'Task'],
})('Check the task completion message(Complete when: Checked by all assignees)', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  await h(t).withLog(`Given I have a team named: {name}`, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });;

  const taskName = uuid();
  const completedNotice = 'completed task';

  let taskPostId, taskId, loginUserName, antherUserName, loginUserId, antherUserId;
  await h(t).withLog(`And the team has a task post assignee to me and antherUser (Complete when: Checked by all assignees)`, async () => {
    await h(t).glip(loginUser).init();
    loginUserName = await h(t).glip(loginUser).getPersonPartialData('display_name');
    antherUserName = await h(t).glip(loginUser).getPersonPartialData('display_name', anotherUser.rcId);
    loginUserId = await h(t).glip(loginUser).toPersonId(loginUser.rcId);
    antherUserId = await h(t).glip(loginUser).toPersonId(anotherUser.rcId);
    await h(t).glip(loginUser).createSimpleTask(team.glipId, [anotherUser.rcId, loginUser.rcId], taskName, {
      complete_type: 'all'
    }).then(res => {
      taskId = res.data._id;
      taskPostId = res.data.post_ids[0];
    });
  });

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  }, true);


  const conversationPage = app.homePage.messageTab.conversationPage;
  const originTaskPostItem = conversationPage.postItemById(taskPostId).itemCard;
  await h(t).withLog(`Then The original task creation post should be marked incomplete`, async () => {
    await originTaskPostItem.ensureLoaded();
    await originTaskPostItem.taskShouldBeMarkIncomplete();
  });

  await h(t).withLog(`Then The original task creation post task title should be "0/2 {taskName}"`, async (step) => {
    step.initMetadata({ taskName });
    await t.expect(originTaskPostItem.title.textContent).eql(`0/2 ${taskName}`);
  });

  let antherUserUpdatePost;
  await h(t).withLog(`When the assignee anotherUser make completes this task (via api)`, async () => {
    let anotherUserUpdatePostId;
    await h(t).glip(anotherUser).init();
    await h(t).glip(anotherUser).updateTask(taskId, {
      complete_people_ids: H.toNumberArray(antherUserId)
    }).then(res => {
      const mentionPostIds: number[] = res.data.at_mentioning_post_ids;
      anotherUserUpdatePostId = mentionPostIds[mentionPostIds.length - 1];
    });
    antherUserUpdatePost = conversationPage.postItemById(anotherUserUpdatePostId);

  });

  await h(t).withLog(`Then a anotherUser updated task post header show {antherUserName} {completedNotice}`, async (step) => {
    step.initMetadata({ antherUserName, completedNotice });
    await antherUserUpdatePost.ensureLoaded();
    await t.expect(antherUserUpdatePost.name.textContent).eql(antherUserName);
    await t.expect(antherUserUpdatePost.itemCardActivity.textContent).eql(completedNotice);
  });

  await h(t).withLog(`And The new post task item title should be  "1/2 {taskName}"`, async (step) => {
    step.initMetadata({ taskName });
    await t.expect(antherUserUpdatePost.itemCard.title.textContent).eql(`1/2 ${taskName}`);
  });

  await h(t).withLog(`And The original task item title should be  "1/2 {taskName}"`, async (step) => {
    step.initMetadata({ taskName });
    await originTaskPostItem.ensureLoaded();
    await originTaskPostItem.taskShouldBeMarkIncomplete();
    await t.expect(originTaskPostItem.title.textContent).eql(`1/2 ${taskName}`);
  });

  let loginUserUpdatePost;
  await h(t).withLog(`When the assignee loginUser make completes this task (via api)`, async () => {
    let loginUserUpdatePostId;
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_people_ids: H.toNumberArray([antherUserId, loginUserId])
    }).then(res => {
      const mentionPostIds: number[] = res.data.at_mentioning_post_ids;
      loginUserUpdatePostId = mentionPostIds[mentionPostIds.length - 1];
    });
    loginUserUpdatePost = conversationPage.postItemById(loginUserUpdatePostId);
  });

  await h(t).withLog(`Then loginUser updated task post header show {loginUserName} {completedNotice}`, async (step) => {
    step.initMetadata({ loginUserName, completedNotice })
    await loginUserUpdatePost.ensureLoaded();
    await t.expect(loginUserUpdatePost.name.textContent).eql(loginUserName);
    await t.expect(loginUserUpdatePost.itemCardActivity.textContent).eql(completedNotice);
  });

  await h(t).withLog(`And The new post task item should be marked completed`, async (step) => {
    step.initMetadata({ taskName });
    await loginUserUpdatePost.itemCard.taskShouldBeMarkCompleted();
  });

  await h(t).withLog(`And The new post task item title should be "2/2 {taskName}" should be marked completed`, async (step) => {
    step.initMetadata({ taskName });
    await t.expect(loginUserUpdatePost.itemCard.title.textContent).eql(`2/2 ${taskName}`);
  });

  await h(t).withLog(`And The original task item should be  "2/2 {taskName}" should be marked completed`, async (step) => {
    step.initMetadata({ taskName });
    await t.expect(originTaskPostItem.title.textContent).eql(`2/2 ${taskName}`);
    await originTaskPostItem.taskShouldBeMarkCompleted();
  });

  await h(t).withLog(`And The anotherUser updated task post item should be "1/2 {taskName}" should be marked completed`, async (step) => {
    step.initMetadata({ taskName });
    await t.expect(antherUserUpdatePost.itemCard.title.textContent).eql(`1/2 ${taskName}`);
    await antherUserUpdatePost.itemCard.taskShouldBeMarkCompleted();
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-360'],
  maintainers: ['Potar.he'],
  keywords: ['message', 'Task'],
})('Check the task completion message(Complete when: 100% done)', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name}`, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });;

  const taskName = uuid();
  const completedNotice = 'completed task';
  const firstUpdateValue = 50;
  const firstUpdateNotice = `completed ${firstUpdateValue}% of task`;

  let taskPostId, taskId, loginUserName, loginUserId;
  await h(t).withLog(`And the team has a task post assignee to me (Complete when: 100% done)`, async () => {
    await h(t).glip(loginUser).init();
    loginUserName = await h(t).glip(loginUser).getPersonPartialData('display_name');
    loginUserId = await h(t).glip(loginUser).toPersonId(loginUser.rcId);
    await h(t).glip(loginUser).createSimpleTask(team.glipId, [loginUser.rcId], taskName, {
      complete_type: 'percentage'
    }).then(res => {
      taskId = res.data._id;
      taskPostId = res.data.post_ids[0];
    });
  });

  const app = new AppRoot(t)
  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  }, true);


  const conversationPage = app.homePage.messageTab.conversationPage;
  const originTaskPostItem = conversationPage.postItemById(taskPostId).itemCard;
  await h(t).withLog(`Then The original task creation post should be marked incomplete`, async () => {
    await originTaskPostItem.ensureLoaded();
    await originTaskPostItem.taskShouldBeMarkIncomplete();
  });

  await h(t).withLog(`Then The original task creation post task title should be "{currentCompleteValue}% {taskName}"`, async (step) => {
    step.initMetadata({ currentCompleteValue: firstUpdateValue.toLocaleString(), taskName });
    await t.expect(originTaskPostItem.title.textContent).eql(`0% ${taskName}`);
  });

  let firstUpdatePost;
  await h(t).withLog(`When the assignee loginUser make completes {currentCompleteValue}% of this task (via api)`, async (step) => {
    step.setMetadata("currentCompleteValue", firstUpdateValue.toString());
    let updatePostId;
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_percentage: firstUpdateValue
    }).then(res => {
      const mentionPostIds: number[] = res.data.at_mentioning_post_ids;
      updatePostId = mentionPostIds[mentionPostIds.length - 1];
    });
    firstUpdatePost = conversationPage.postItemById(updatePostId);
  });

  await h(t).withLog(`Then first updated task post header show {loginUserName} {firstUpdateNotice}`, async (step) => {
    step.initMetadata({ loginUserName, firstUpdateNotice });
    await firstUpdatePost.ensureLoaded();
    await t.expect(firstUpdatePost.name.textContent).eql(loginUserName);
    await t.expect(firstUpdatePost.itemCardActivity.textContent).eql(firstUpdateNotice);
  });

  await h(t).withLog(`And The post task item should be marked incomplete and title should be "{firstUpdateValue}% {taskName}`, async (step) => {
    step.initMetadata({ taskName });
    await firstUpdatePost.itemCard.taskShouldBeMarkIncomplete();
    await t.expect(firstUpdatePost.itemCard.title.textContent).eql(`${firstUpdateValue}% ${taskName}`);
  });

  await h(t).withLog(`And The original task item should be marked incomplete and title should be "{firstUpdateValue}% {taskName}`, async (step) => {
    step.initMetadata({
      firstUpdateValue: firstUpdateValue.toString(),
      taskName
    });
    await originTaskPostItem.taskShouldBeMarkIncomplete();
  });

  let finalCompletePost;
  await h(t).withLog(`When the assignee loginUser make completes 100% of this task (via api)`, async () => {
    let updatePostId;
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_percentage: 100
    }).then(res => {
      const mentionPostIds: number[] = res.data.at_mentioning_post_ids;
      updatePostId = mentionPostIds[mentionPostIds.length - 1];
    });
    finalCompletePost = conversationPage.postItemById(updatePostId);
  });

  await h(t).withLog(`Then the final updated task post header show {loginUserName} {completedNotice}`, async (step) => {
    step.initMetadata({ loginUserName, completedNotice })
    await finalCompletePost.ensureLoaded();
    await t.expect(finalCompletePost.name.textContent).eql(loginUserName);
    await t.expect(finalCompletePost.itemCardActivity.textContent).eql(completedNotice);
  });

  await h(t).withLog(`And The post task item should be marked completed and title should be "100% {taskName}`, async (step) => {
    step.initMetadata({ taskName });
    await finalCompletePost.itemCard.taskShouldBeMarkCompleted();
    await t.expect(finalCompletePost.itemCard.title.textContent).eql(`100% ${taskName}`);
  });

  await h(t).withLog(`And The origin task item should be marked completed and title should be "100% {taskName}`, async (step) => {
    step.initMetadata({ taskName });
    await originTaskPostItem.taskShouldBeMarkCompleted();
    await t.expect(originTaskPostItem.title.textContent).eql(`100% ${taskName}`);
  });
});