/*
 * @Author: Potar.He 
 * @Date: 2019-04-10 12:58:57 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-05-14 20:44:57
 */
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup, ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';
import * as uuid from 'uuid';
import * as _ from 'lodash';

fixture('Search/HighLight')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1752'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Messages', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = "key";
  const keyword2 = "words";

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has a post with text ${multipleKeyWord}`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${multipleKeyWord}${uuid()}`, team, loginUser);
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} `, async () => {
    await t.expect(messageTab.postItemById(postId).keyworkdsByHighLight.textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} `, async () => {
    await t.expect(messageTab.postItemById(postId).keyworkdsByHighLight.nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).keyworkdsByHighLight.nth(1).textContent).eql(keyword2);
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1773'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Events', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });


  let postId;
  await h(t).withLog(`And the team has a event (title, location, description contains "${multipleKeyWord}")`, async () => {
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: team.glipId,
      title: `${multipleKeyWord} in title`,
      description: `${multipleKeyWord} in description`,
      rcIds: loginUser.rcId,
      location: `${multipleKeyWord} in location`
    });
    postId = res.data['post_ids'][0];
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in event title `, async () => {
    await t.expect(messageTab.postItemById(postId).eventTitle.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in event location `, async () => {
    await t.expect(messageTab.postItemById(postId).eventLocation.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in event dicription `, async () => {
    await t.expect(messageTab.postItemById(postId).keyworkdsByHighLight.count).eql(3); // description element is hard to get.
    // await t.expect(messageTab.postItemById(postId).eventDescripton.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in event title`, async () => {
    await t.expect(messageTab.postItemById(postId).eventTitle.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).eventTitle.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in event title`, async () => {
    await t.expect(messageTab.postItemById(postId).eventLocation.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).eventLocation.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in event title`, async () => {
    await t.expect(messageTab.postItemById(postId).keyworkdsByHighLight.count).eql(6); // description element is hard to get.
    // await t.expect(messageTab.postItemById(postId).eventDescripton.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    // await t.expect(messageTab.postItemById(postId).eventDescripton.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1774'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Files', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1}-${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const filePaths = './sources/1.png';
  const fileNames = `${multipleKeyWord}.png`;

  let postId;
  await h(t).withLog(`And the team has a file, its name contains ${multipleKeyWord}`, async () => {
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      fileNames,
      group: team,
      operator: loginUser,
    });
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in file name`, async () => {
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in file name`, async () => {
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1775'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Files', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = 'yahoo';
  const keyword2 = 'google';


  const multipleKeyWord = `${keyword1} ${keyword2}`;
  const url = `http://${keyword1}-${keyword2}.com`
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team a`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  let postId;
  await h(t).withLog(`And I send a link ${url}`, async () => {
    await conversationPage.sendMessage(url);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    postId = await conversationPage.nthPostItem(-1).postId;
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in text`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in text`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1776'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Notes', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has a note, its title and body contain ${multipleKeyWord}`, async () => {
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleNote(team.glipId, multipleKeyWord, { body: multipleKeyWord });
    postId = res.data['post_ids'][0]
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in note title`, async () => {
    await t.expect(messageTab.postItemById(postId).noteTitle.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in note body`, async () => {
    await t.expect(messageTab.postItemById(postId).noteBody.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in note title`, async () => {
    await t.expect(messageTab.postItemById(postId).noteTitle.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).noteTitle.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in note body`, async () => {
    await t.expect(messageTab.postItemById(postId).noteBody.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).noteBody.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1777'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Tasks', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);
  await h(t).glip(loginUser).init();

  const keyword1 = await h(t).glip(loginUser).getPersonPartialData('first_name');
  const keyword2 = await h(t).glip(loginUser).getPersonPartialData('last_name');

  const multipleKeyWord = `${keyword1}-${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const filePath = './sources/1.png';
  const fileNames = `${multipleKeyWord}.png`;
  let postId;
  await h(t).withLog(`And the team has a task, its title/assingee/section/description/attach contain ${multipleKeyWord}`, async () => {
    const fileId = await h(t).scenarioHelper.uploadFile({ filePath, name: fileNames, operator: loginUser }).then(res => res.data[0].id);
    const res = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, multipleKeyWord, {
      section: multipleKeyWord,
      attachment_ids: [+fileId],
      notes: multipleKeyWord // description
    });
    postId = res.data['post_ids'][0];
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in task title`, async () => {
    await t.expect(messageTab.postItemById(postId).taskTitle.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in task assignee`, async () => {
    await t.expect(messageTab.postItemById(postId).taskAssignee.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in task section`, async () => {
    await t.expect(messageTab.postItemById(postId).taskAssignee.find('span.highlight-term').textContent).eql(keyword1);
  });


  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in task description`, async () => {
    await t.expect(messageTab.postItemById(postId).taskDescription.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in task attach file name`, async () => {
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in task title`, async () => {
    await t.expect(messageTab.postItemById(postId).taskTitle.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).taskTitle.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in task assignee`, async () => {
    await t.expect(messageTab.postItemById(postId).taskAssignee.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).taskAssignee.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in task section`, async () => {
    await t.expect(messageTab.postItemById(postId).taskSection.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).taskAssignee.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in task description`, async () => {
    await t.expect(messageTab.postItemById(postId).taskDescription.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).taskDescription.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in task attach file name`, async () => {
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });
});



test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1931'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Snippet', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has a code snippet, its title and body contain ${multipleKeyWord}`, async () => {
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleCodeSnippet(team.glipId, multipleKeyWord, multipleKeyWord);
    postId = res.data.post_ids[0]
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click ${keyword1} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword1} in code snippet title`, async () => {
    await t.expect(messageTab.postItemById(postId).codeTitle.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the post do not highlight the keyword ${keyword1} in note body`, async () => {
    await t.expect(messageTab.postItemById(postId).codeBody.find('span.highlight-term').exists).notOk();
  });

  await h(t).withLog(`When I search keyword ${multipleKeyWord}`, async () => {
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click ${multipleKeyWord} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword ${multipleKeyWord} in note title`, async () => {
    await t.expect(messageTab.postItemById(postId).codeTitle.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).codeTitle.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post doest not highlight the keyword ${multipleKeyWord} in note body`, async () => {
    await t.expect(messageTab.postItemById(postId).codeBody.find('span.highlight-term').exists).notOk();
  });
});