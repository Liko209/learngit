/*
 * @Author: Potar.He
 * @Date: 2019-04-10 12:58:57
 * Copyright © RingCentral. All rights reserved.
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

  const keyword1 = "key";
  const keyword2 = "words";

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has a post with text {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${multipleKeyWord}${uuid()}`, team, loginUser);
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword1}`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click {keyword1} in this conversation`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword1} `, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click {multipleKeyWord} in this conversation`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword {multipleKeyWord} `, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.nth(1).textContent).eql(keyword2);
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2298'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight'],
})('Different language can be highlighted', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const keyword1 = "我们";
  const keyword2 = "привет";

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
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.textContent).eql(keyword1);
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
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).keywordsByHighLight.nth(1).textContent).eql(keyword2);
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

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1}-${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const filePaths = './sources/1.png';
  const fileNames = `${multipleKeyWord}.png`;

  let postId;
  await h(t).withLog(`And the team has a file, its name contains {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths,
      fileNames,
      group: team,
      operator: loginUser,
    });
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword1}`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click {keyword1} in this conversation`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });


  await h(t).withLog(`When I hover the image`, async () => {
    await t.hover(messageTab.postItemById(postId).imageCard);
  });

  await h(t).withLog(`Then the posts highlight the keyword {keyword1} in file name`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await t.expect(messageTab.postItemById(postId).fileNames.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click {multipleKeyWord} in this conversation`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`When I hover the image`, async () => {
    await t.hover(messageTab.postItemById(postId).imageCard);
  });

  await h(t).withLog(`Then the post highlight the keyword {multipleKeyWord} in file name`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
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

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });


  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  let postId;
  await h(t).withLog(`And I send a link {url}`, async (step) => {
    step.setMetadata('url', url);
    await conversationPage.sendMessage(url);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    postId = await conversationPage.nthPostItem(-1).postId;
  });

  await t.wait(10e3); // wait for websocketManagement.isConnected.

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword1}`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click {keyword1} in this conversation`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword1} in text`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`When I search keyword {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click {multipleKeyWord} in this conversation`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword {multipleKeyWord} in text`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(1).textContent).eql(keyword2);
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

  const keyword1 = 'key';
  const keyword2 = 'words';

  const multipleKeyWord = `${keyword1} ${keyword2}`;
  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog(`And the team has a code snippet, its title and body contain {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleCodeSnippet(team.glipId, multipleKeyWord, multipleKeyWord);
    postId = res.data.post_ids[0]
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword ${keyword1}`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword1);
  }, true);

  await h(t).withLog(`And I click {keyword1} in this conversation`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword1} in note title`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await t.expect(messageTab.postItemById(postId).itemCard.title.find('span.highlight-term').textContent).eql(keyword1);
  });

  await h(t).withLog(`And the post do not highlight the keyword {keyword1} in note body`, async (step) => {
    step.setMetadata('keyword1', keyword1);
    await t.expect(messageTab.postItemById(postId).itemCard.codeBody.find('span.highlight-term').exists).notOk();
  });

  await h(t).withLog(`When I search keyword {multipleKeyWord}`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(multipleKeyWord);
  }, true);

  await h(t).withLog(`And I click {multipleKeyWord} in this conversation`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display at least one post`, async () => {
    await t.expect(searchDialog.fullSearchPage.messagesTab.posts.count).gte(1);
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the post highlight the keyword {multipleKeyWord} in note title`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await t.expect(messageTab.postItemById(postId).itemCard.title.find('span.highlight-term').nth(0).textContent).eql(keyword1);
    await t.expect(messageTab.postItemById(postId).itemCard.title.find('span.highlight-term').nth(1).textContent).eql(keyword2);
  });

  await h(t).withLog(`And the post doest not highlight the keyword {multipleKeyWord} in note body`, async (step) => {
    step.setMetadata('multipleKeyWord', multipleKeyWord);
    await t.expect(messageTab.postItemById(postId).itemCard.codeBody.find('span.highlight-term').exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1965'],
  maintainers: ['potar.he'],
  keywords: ['search', 'HighLight', 'phoneNumber'],
  accountType: BrandTire.RC_WITH_PHONE_DL,
})('Phone number from searched list should be hyperlinked and successful ring out', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[2];
  const otherUser = users[3];

  const phoneNumber = "+1(650)399-0766";
  const phoneNumberChunks = phoneNumber.split(/\+|\(|\)|\ |\-/).filter(_.identity);
  const calleeNumber = "(650) 399-0766";

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let postId;
  await h(t).withLog(`Given I have a chat has post with phone number: {phoneNumber}`, async (step) => {
    step.setMetadata('phoneNumber', phoneNumber);
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(phoneNumber, chat, loginUser);
  });

  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {phoneNumber}`, async (step) => {
    step.setMetadata('phoneNumber', phoneNumber);
    await t.wait(5e3); // wait due to search serve backend delay.
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(phoneNumber);
  }, true);

  await h(t).withLog(`And I click {phoneNumber} in this conversation`, async (step) => {
    step.setMetadata('phoneNumber', phoneNumber);
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const postItem = searchDialog.fullSearchPage.messagesTab.postItemById(postId);
  await h(t).withLog(`And display the post and phonenumber in hyper-link stype`, async () => {
    await postItem.ensureLoaded(20e3);
    await t.expect(postItem.phoneLinkByDataId(phoneNumber).exists).ok();
  });

  await h(t).withLog(`And the post highlight the keyword {phoneNumber}`, async (step) => {
    step.setMetadata('phoneNumber', phoneNumber);
    await t.expect(postItem.keywordsByHighLight.count).eql(phoneNumberChunks.length);
    for (const i in phoneNumberChunks) {
      await t.expect(postItem.keywordsByHighLight.nth(+i).withText(phoneNumberChunks[i]).exists).ok();
    }
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  for (const i in phoneNumberChunks) {
    await h(t).withLog(`When I click each high light part of the phone number: {phoneNumber]}`, async (step) => {
      step.setMetadata('phoneNumber', phoneNumberChunks[i]);
      await t.click(postItem.keywordsByHighLight.nth(+i));
    });

    await h(t).withLog(`Then a telephony dialog should be popup`, async () => {
      await telephonyDialog.ensureLoaded()
    });

    await h(t).withLog(`And the callee number should be {calleeNumber} then close dialog`, async (step) => {
      step.setMetadata('calleeNumber', calleeNumber)
      await t.expect(telephonyDialog.phoneNumber.withExactText(calleeNumber).exists).ok();
      await telephonyDialog.clickHangupButton();
    });
  }
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1773'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight'],
})('Check can highlight the keyword in full search results that type is Events', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const url = 'https://www.google.com';
  const phoneNumber = "+1(650)399-0766";
  const text = 'key';
  const keywordText = 'key'
  const keywordUrl = 'google'
  const keywordNumber = '399'
  const keyword = `${keywordText} ${keywordUrl} ${keywordNumber}`;
  const keywordFull = `${keywordText} ${url} ${phoneNumber}`
  const content = `${text} ${url} ${phoneNumber}`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  let eventPostId, eventId, updatedPostId;
  await h(t).withLog(`And the team has a event post, its title and body contain {content}`, async (step) => {
    step.setMetadata('content', content);
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleEvent({
      groupIds: team.glipId,
      title: content,
      description: content,
      location: content,
    }).then(res => {
      eventId = res.data._id;
      eventPostId = res.data.post_ids[0];
    });
  });

  await h(t).withLog(`And I update the event location`, async () => {
    await h(t).glip(loginUser).updateEvent(eventId, { location: `${content} hello` }).then(res => {
      updatedPostId = res.data.at_mentioning_post_ids[0];
    });
  })

  const app = new AppRoot(t)

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword}`, async (step) => {
    step.setMetadata('keyword', keyword);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click {keyword} in this conversation`, async (step) => {
    step.setMetadata('keyword', keyword);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(eventPostId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in event title`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.title.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.title.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.title.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in event location`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventLocation.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventLocation.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventLocation.find('span.highlight-term').nth(1).parent().tagName).eql('a')
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventLocation.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in event description`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventDescription.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventDescription.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventDescription.find('span.highlight-term').nth(1).parent().tagName).eql('a')
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventDescription.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
    await t.expect(messageTab.postItemById(eventPostId).itemCard.eventDescription.find('span.highlight-term').nth(2).parent().nth(0).getAttribute('data-test-automation-id')).eql('phoneNumberLink');
  });

  await h(t).withLog(`And I click show old to expand the collapsed section`, async () => {
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.eventShowOrHideOld.exists).ok();
    await t.click(messageTab.postItemById(updatedPostId).itemCard.eventShowOrHideOld);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in old event location`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.eventOldLocation.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.eventOldLocation.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.eventOldLocation.find('span.highlight-term').nth(1).parent().tagName).eql('a')
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.eventOldLocation.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1776'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results that type is Notes', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];

  const url = 'https://www.google.com';
  const phoneNumber = "+1(650)399-0766";
  const text = 'key';
  const keywordText = 'key'
  const keywordUrl = 'google'
  const keywordNumber = '399'
  const keyword = `${keywordText} ${keywordUrl} ${keywordNumber}`;
  const content = `${text} ${url} ${phoneNumber}`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog(`Given I have a team named: {name} `, async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  let notePostId, noteId;
  await h(t).withLog(`And the team has a note post, its title and body contain {content}`, async (step) => {
    step.setMetadata('content', content);
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleNote(team.glipId, content).then(res => {
      noteId = res.data._id;
      notePostId = res.data.post_ids[0];
    });
  });

  const app = new AppRoot(t)


  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword}`, async (step) => {
    step.setMetadata('keyword', keyword);
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click {keyword} in this conversation`, async (step) => {
    step.setMetadata('keyword', keyword);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(notePostId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in note title`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(notePostId).itemCard.title.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(notePostId).itemCard.title.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(notePostId).itemCard.title.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1777'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight'],
})('Check can highlight keyword in full search results when type is Tasks', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];
  const otherUser = users[2];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const url = 'https://www.google.com';
  const phoneNumber = "+1(650)399-0766";
  const text = loginUser.email.substr(0, 2);
  const keywordText = loginUser.email.substr(0, 2);
  const keywordUrl = 'google';
  const keywordNumber = '399';
  const keyword = `${keywordText} ${keywordUrl} ${keywordNumber}`;
  const content = `${text} ${url} ${phoneNumber}`;

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

  let taskPostId, taskId, updatedPostId;
  await h(t).withLog(`And the team has a task post, its title and body contain {content}`, async (step) => {
    step.setMetadata('content', content);
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleTask(team.glipId, [loginUser.rcId], content, {
      section: content,
      notes: content,
    }).then(res => {
      taskId = res.data._id;
      taskPostId = res.data.post_ids[0];
    });
  });

  await h(t).withLog(`And I update the task`, async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      assigned_to_ids: H.toNumberArray(await h(t).glip(loginUser).toPersonId([loginUser.rcId, otherUser.rcId])),
      section: `${content} hello`,
      notes: `${content} hello`,
      text: `${content} hello`
    }).then(res => {
      updatedPostId = res.data.at_mentioning_post_ids[0];
    });
  })

  const app = new AppRoot(t)

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`When I search keyword {keyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click {keyword} in this conversation`, async (step) => {
    step.setMetadata('keyword', keyword);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(taskPostId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in task title`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.title.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.title.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.title.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in task assignee`, async (step) => {
    step.setMetadata('keyword', keyword);
    const highlightText = await messageTab.postItemById(taskPostId).itemCard.taskAssignee.find('span.highlight-term').nth(0).textContent
    await t.expect(highlightText.toLowerCase()).eql(text);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in task section`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskSection.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskSection.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskSection.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
  });

  await h(t).withLog(`And the posts highlight the keyword {keyword} in task description`, async (step) => {
    step.setMetadata('keyword', keyword);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskDescription.find('span.highlight-term').nth(0).textContent).eql(keywordText);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskDescription.find('span.highlight-term').nth(1).textContent).eql(keywordUrl);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskDescription.find('span.highlight-term').nth(1).parent().tagName).eql('a')
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskDescription.find('span.highlight-term').nth(2).textContent).eql(keywordNumber);
    await t.expect(messageTab.postItemById(taskPostId).itemCard.taskDescription.find('span.highlight-term').nth(2).parent().nth(0).getAttribute('data-test-automation-id')).eql('phoneNumberLink');
  });

  await h(t).withLog(`When I search keyword {text}`, async (step) => {
    step.setMetadata('text', text);
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(text);
  }, true);

  await h(t).withLog(`And I click {text} in this conversation`, async (step) => {
    step.setMetadata('text', text);
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(taskPostId).ensureLoaded();
  });

  await h(t).withLog(`And I click show old to expand the collapsed section`, async () => {
    await t.expect(messageTab.postItemById(updatedPostId).itemCard.taskShowOrHidOldLink.exists).ok();
    await t.click(messageTab.postItemById(updatedPostId).itemCard.taskShowOrHidOldLink);
  });

  await h(t).withLog(`And the posts highlight the keyword {text} in show old task assignee`, async (step) => {
    step.setMetadata('text', text);
    const highlightText = await messageTab.postItemById(updatedPostId).itemCard.taskOldAssignees.find('span.highlight-term').textContent
    await t.expect(highlightText.toLowerCase()).eql(text);
  });

});
