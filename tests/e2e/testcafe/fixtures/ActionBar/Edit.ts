import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('ActionBar/MoreItem')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-480', 'JPT-481'],
  keywords: ['EditPost'],
  maintainers: ['potar.he']
})('Edit mode can update post text or cancel update post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  const originalText = 'Original';
  const addText = uuid();
  const newText = `${originalText}${addText}`

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }
  await h(t).glip(anotherUser).init();

  let postId;
  await h(t).withLog('Given I have a post in a chat', async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, chat, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const postItem = app.homePage.messageTab.conversationPage.postItemById(postId);
  await h(t).withLog('And I enter the chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('When I click Edit origin Post in Action bar more item', async () => {
    await t.expect(postItem.body.withText(originalText).exists).ok();
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the post item change to edit mode ', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  });

  await h(t).withLog('When I update(append {addText}) text message  and hit enter', async (step) => {
    step.setMetadata('addText', addText);
    await postItem.editMessage(addText);
  });

  await h(t).withLog('Then the latest post text should correct: {newText}', async (step) => {
    step.setMetadata('addText', addText);
    await t.expect(postItem.text.withText(newText).exists).ok();
  });

  // JPT-481
  let postTextFromAnotherUserSee;
  await h(t).withLog('When I check the post item via another user glip api', async () => {
    await h(t).glip(anotherUser).init();
    postTextFromAnotherUserSee = await h(t).glip(anotherUser).getPost(postId).then(res => res.data.text)
  });

  await h(t).withLog('Then the post message should be updated successfully.', async () => {
    assert.ok(postTextFromAnotherUserSee == newText, 'update error');
  });

  //cancel
  await h(t).withLog('When I click Edit Post in Action bar more item', async () => {
    await t.expect(postItem.body.withText(originalText).exists).ok();
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the post item change to edit mode ', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  });

  await h(t).withLog('When I update(addText) text message  and hit Esc', async () => {
    await t.typeText(postItem.editTextArea, addText).pressKey('esc');
  });

  await h(t).withLog('Then the latest post text should correct', async () => {
    await t.expect(postItem.text.withText(newText).exists).ok();
  });

  // off focus
  await h(t).withLog('When I click Edit Post in Action bar more item', async () => {
    await t.expect(postItem.body.withText(originalText).exists).ok();
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the post item change to edit mode ', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  });

  await h(t).withLog('When I Cursor position no focus on edit post item', async () => {
    await t.click(postItem.name);
  });

  await h(t).withLog('Then Still in edit mode', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-494'],
  keywords: ['EditPost'],
  maintainers: ['potar.he']
})('Edit mode can update post text or cancel update post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const originalText = 'Original';
  const filePath = './sources/1.txt';
  const filename = '1.txt';

  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  let postId;
  await h(t).withLog('Given I have team named: {name}', async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, team, loginUser);
  });

  await h(t).withLog('And I send a post with text and a file {filename}', async (step) => {
    step.setMetadata('filename', filename)
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      text: originalText,
      fileNames: filename,
      filePaths: filePath,
      group: team,
      operator: loginUser,
    });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const postItem = app.homePage.messageTab.conversationPage.postItemById(postId);
  await h(t).withLog('And I enter the team conversation', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I click Edit Post in Action bar more item of the post', async () => {
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the post item change to edit mode ', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  }, true);

  await h(t).withLog('And Only post text into edit mode', async () => {
    await t.expect(postItem.editTextArea.withExactText(originalText).exists).ok()
  });

  await h(t).withLog('And Picture/attachment no any change', async () => {
    await t.expect(postItem.fileNames.count).eql(1);
    await postItem.nthFileNameShouldBe(0, filename);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1640'],
  keywords: ['EditPost'],
  maintainers: ['potar.he']
})('Should can see AtMention List in Edit post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[7]
  const originalText = 'Original';

  await h(t).glip(loginUser).init();
  const userName = await h(t).glip(loginUser).getPersonPartialData('first_name');

  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId;
  await h(t).withLog('Given I have a post in team named: {name}', async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, team, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const postItem = app.homePage.messageTab.conversationPage.postItemById(postId);
  await h(t).withLog('And I enter the team conversation', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I click Edit Post in Action bar more item of the post', async () => {
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the post item change to edit mode ', async () => {
    await t.expect(postItem.editTextArea.exists).ok();
  }, true);

  await h(t).withLog('When I type " @{userName}"', async (step) => {
    step.setMetadata('userName', userName);
    await t.typeText(postItem.editTextArea, ` @${userName}`, { speed: 0.7 });
  });

  const mentionUserList = app.homePage.messageTab.conversationPage.mentionUserList;
  await h(t).withLog('Then at mention list should be showed', async () => {
    await mentionUserList.ensureLoaded();
  });
});