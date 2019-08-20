/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.com)
 * @Date: 5/08/2019 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Link')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-224'],
  maintainers: ['potar.he'],
  keywords: ['urlFormat'],
})('[Browser] Should open a new browser tab/Web when click a link from post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }


  const sameDomainUrl = SITE_URL;
  const differentDomainUrl = 'https://www.google.com';
  await h(t).withLog(`Given same domain URL {same} and different domain URL {diff}`, async (step) => {
    step.initMetadata({
      same: sameDomainUrl,
      diff: differentDomainUrl
    })
  });

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let eventPostId: string, textPostId: string, taskPostId: string;
  await h(t).withLog("And I have event,text,task with URLs (same and different domain)", async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`${sameDomainUrl} \n ${differentDomainUrl}`, chat, loginUser);
    eventPostId = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: chat.glipId,
      title: uuid(),
      description: sameDomainUrl,
      location: differentDomainUrl
    }).then(res => res.data.post_ids[0]);
    taskPostId = await h(t).glip(loginUser).createSimpleTask(chat.glipId, loginUser.rcId, uuid(), {
      notes: `${sameDomainUrl} \n ${differentDomainUrl}`
    }).then(res => res.data.post_ids[0]);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter as User A: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open the chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('Then I can found the URLs in text post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(textPostId).text.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(textPostId).text.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });
  await h(t).withLog('And I can found the URLs in event post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(eventPostId).self.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(eventPostId).self.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });

  await h(t).withLog('And I can found the URLs in task post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(taskPostId).self.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(taskPostId).self.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2118'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight', 'message', 'url', 'phoneNumber'],
})('Check the highlight display when there are multiple highlighting effects in a text - URL includes a phone number', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const url = 'https://www.google.com/123333333';
  const keyword = `123333333`;
  const content = `${url}`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId
  await h(t).withLog(`And the team has a post with content: ${content}`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(content, team, loginUser);
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
  await h(t).withLog(`When I search keyword ${keyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click ${keyword} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchGlobalEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword}`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).textContent).eql(keyword);
  });

  await h(t).withLog(`And the keyword should be in a url link`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).parent().tagName).eql('a');
  })
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2118'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight', 'message', 'url', 'AtMentions'],
})('Check the highlight display when there are multiple highlighting effects in a text - @mention name is a URL', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const url = 'www.google.com';
  const keyword = `google`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`And I change other user's name to url`, async () => {
    await h(t).glip(otherUser).init();
    await h(t).glip(otherUser).updatePerson({ 'first_name': url, 'last_name': '' });
  });

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId
  await h(t).withLog(`And the team has a post with at mention`, async () => {
    const otherUserGlipId = await h(t).glip(otherUser).toPersonId(otherUser.rcId);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi, <a class='at_mention_compose' rel='{"id":${otherUserGlipId}}'>@${url}</a>  hihihi`, team, loginUser);
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
  await h(t).withLog(`When I search keyword ${keyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click ${keyword} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword}`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).textContent).eql(keyword);
  });

  await h(t).withLog(`And the keyword should be in an at mention link`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).parent().tagName).eql('button');
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).parent().getAttribute('class')).contains('at_mention_compose');
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2118'],
  maintainers: ['chris.zhan'],
  keywords: ['search', 'HighLight', 'message', 'url', 'AtMentions'],
})('Check the highlight display when there are multiple highlighting effects in a text - @mention name is a phone number', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  const phone = '1213232433';
  const keyword = `121`;

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`And I change other user's name to url`, async () => {
    await h(t).glip(otherUser).init();
    await h(t).glip(otherUser).updatePerson({ 'first_name': phone, 'last_name': '' });
  });

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId
  await h(t).withLog(`And the team has a post with at mention`, async () => {
    const otherUserGlipId = await h(t).glip(otherUser).toPersonId(otherUser.rcId);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`Hi, <a class='at_mention_compose' rel='{"id":${otherUserGlipId}}'>@${phone}</a>  hihihi`, team, loginUser);
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
  await h(t).withLog(`When I search keyword ${keyword}`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(keyword);
  }, true);

  await h(t).withLog(`And I click ${keyword} in this conversation`, async () => {
    await searchDialog.instantPage.clickContentSearchInThisConversationEntry();
  });

  await h(t).withLog(`Then messages tab should be open`, async () => {
    await searchDialog.fullSearchPage.messagesTabEntry.shouldBeOpened();
  });

  const messageTab = searchDialog.fullSearchPage.messagesTab;
  await h(t).withLog(`And display the post`, async () => {
    await messageTab.postItemById(postId).ensureLoaded();
  });

  await h(t).withLog(`And the posts highlight the keyword ${keyword}`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).textContent).eql(keyword);
  });

  await h(t).withLog(`And the keyword should be in an at mention link`, async () => {
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).parent().tagName).eql('button');
    await t.expect(messageTab.postItemById(postId).text.find('span.highlight-term').nth(0).parent().getAttribute('class')).contains('at_mention_compose');
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-216'],
  maintainers: ['potar.he'],
  keywords: ['urlFormat'],
})('Check the UI of the link with preview', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  const url1 = 'https://www.google.com';

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the chat conversation`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const lastPostItem = conversationPage.lastPostItem;
  await h(t).withLog(`When I send one link {url1}`, async (step) => {
    step.setMetadata('url1', url1);
    await conversationPage.sendMessage(url1);
    await lastPostItem.waitForPostToSend();
  });

  let linkData;
  await h(t).withLog(`Then There should be text 'shared a link' `, async () => {
    await t.expect(lastPostItem.itemCardActivity.textContent).eql('shared a link');
    const postId = await lastPostItem.postId;
    const linkIds = await h(t).glip(loginUser).getLinksIdsFromPostId(postId);
    linkData = await h(t).glip(loginUser).getLink(linkIds[0]).then(res => res.data);
  });

  const title = linkData.title || linkData.url;

  const linkCard = lastPostItem.nthLinkCard(0);
  await h(t).withLog(`And display link card: title "{title}" with link "{url1}"`, async (step) => {
    step.initMetadata({ title, url1 });
    await t.expect(linkCard.title.textContent).eql(title);
    await t.expect(linkCard.href).eql(url1);
  });

  if (linkData.summary) {
    await h(t).withLog(`And display link card: summary of url`, async () => {
      await t.expect(linkCard.summary.textContent).eql(linkData.summary);
    });
  }

  // todo logo Icon

  await h(t).withLog(`When I click remove button of the link card`, async () => {
    await linkCard.clickCloseButton();
  });

  await h(t).withLog(`Then Can remove a link card from the message card.`, async () => {
    await t.expect(lastPostItem.linkCardDiv.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2827'],
  maintainers: ['andy.hu'],
  keywords: ['link preview'],
})('Check the show link previews settings is implemented immediately', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  const url1 = 'https://www.google.com';

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the chat conversation`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });
  const conversationPage = app.homePage.messageTab.conversationPage;
  const lastPostItem = conversationPage.lastPostItem;

  await h(t).withLog(`When I send one link {url1}`, async (step) => {
    step.setMetadata('url1', url1);
    await conversationPage.sendMessage(url1);
    await lastPostItem.waitForPostToSend();
  });

  await h(t).withLog(`When I turn off link preview`, async (step) => {
    await h(t).glip(loginUser).updateProfile({
      show_link_previews:false
    });
  });

  await h(t).withLog(`And there is no link preview"`, async (step) => {
    await t.expect (lastPostItem.linkPreviewCard.exists).notOk()
  });

  await h(t).withLog(`When I send one link {url1}`, async (step) => {
    step.setMetadata('url1', url1);
    await conversationPage.sendMessage(url1);
    await lastPostItem.waitForPostToSend();
  });

  await h(t).withLog(`And there is no link preview"`, async (step) => {
    await t.expect (lastPostItem.linkPreviewCard.exists).notOk()
  });

  await h(t).withLog(`When I turn on link preview`, async (step) => {
    await h(t).glip(loginUser).updateProfile({
      show_link_previews:true
    });
  });
  await h(t).withLog(`And display link card: title "{title}" with link "{url1}"`, async (step) => {
    await t.expect (lastPostItem.linkPreviewCard.exists).ok()
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2596'],
  maintainers: ['alvin.huang'],
  keywords: ['itemCard', 'cardPreview'],
})('Check the permission of close the link/video card', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];

  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  const NORMAL_LINK = 'https://www.baidu.com';
  const VIDEO_LINK = 'https://www.loom.com/share/7188bccc52674b5caa63ac60291b1c7c';

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const chatEntry = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog(`And I enter the chat conversation`, async () => {
    await chatEntry.enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const lastPostItem = conversationPage.lastPostItem;


  await h(t).withLog(`When I send one normal link {NORMAL_LINK}`, async (step) => {
    step.setMetadata('NORMAL_LINK', NORMAL_LINK);
    await conversationPage.sendMessage(NORMAL_LINK);
    await lastPostItem.waitForPostToSend();
  });

  const linkCard = lastPostItem.nthLinkCard(0);
  await h(t).withLog(`When I click close button of the link card`, async () => {
    await linkCard.clickCloseButton();
  });

  await h(t).withLog(`Then the link card should be removed`, async () => {
    await t.expect(lastPostItem.linkCardDiv.exists).notOk();
  });

  await h(t).withLog(`When even I reload page`, async () => {
    await app.reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then the link card still does not exist`, async () => {
    await t.expect(lastPostItem.linkCardDiv.exists).notOk();
  });

  await h(t).withLog(`When I send one video link {VIDEO_LINK}`, async (step) => {
    step.setMetadata('VIDEO_LINK', VIDEO_LINK);
    await conversationPage.sendMessage(VIDEO_LINK);
    await lastPostItem.waitForPostToSend();
  });

  await h(t).withLog(`When I click close button of the link card`, async () => {
    await linkCard.clickCloseButton();
  });

  await h(t).withLog(`Then the link card still does not exist`, async () => {
    await t.expect(lastPostItem.linkCardDiv.exists).notOk();
  });

  await h(t).withLog(`When even I reload page`, async () => {
    await app.reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then the link card still does not exist`, async () => {
    await t.expect(lastPostItem.linkCardDiv.exists).notOk();
  });

  await h(t).withLog(`When I send two links {NORMAL_LINK} and {VIDEO_LINK}`, async (step) => {
    step.initMetadata({ NORMAL_LINK, VIDEO_LINK });
    await conversationPage.sendMessage(NORMAL_LINK);
    await conversationPage.sendMessage(VIDEO_LINK);
    await lastPostItem.waitForPostToSend();
  });
  await h(t).withLog(`And I login out and login Jupiter with anotherUser {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: anotherUser.company.number,
      extension: anotherUser.extension,
    });
    await app.homePage.logoutThenLoginWithUser(SITE_URL, anotherUser);
  });

  await h(t).withLog(`And I enter the chat conversation`, async () => {
    await chatEntry.enter();
    await t.expect(conversationPage.posts.count).gte(2);
  });

  await h(t).withLog(`Then I can not remove a link card from the message card.`, async () => {
    await t.expect(conversationPage.lastPostItem.nthLinkCard(0).closeButton.exists).notOk();
    await t.expect(conversationPage.nthPostItem(-2).nthLinkCard(0).closeButton.exists).notOk();
  });
});
