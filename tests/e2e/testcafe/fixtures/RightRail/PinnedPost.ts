/*
 * @Author: Potar.He
 * @Date: 2019-02-19 17:44:59
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-21 14:23:00
 */


import { v4 as uuid } from 'uuid';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import * as _ from 'lodash';


fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1057'],
  keywords: ['PinnedPost'],
  maintainers: ['Potar.He']
})('New pinned will show under Pinned tab immediately', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');
  const filesPath = ['../../sources/1.png', '../../sources/1.txt'];
  const fileNames = ['1.png', '1.txt'];
  const postText = uuid();
  const url = 'http://google.com';
  const postText1 = uuid();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  let textPostId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I send a text post:${postText}`, async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  const rightRail = app.homePage.messageTab.rightRail;
  const pinnedTab = rightRail.pinnedTab;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post via API', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": postIds
    })
  });

  await h(t).withLog('Then the new pinned post shows under tasks tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    // await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.nthItem(0).shouldBePostId(textPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    await pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  let toBeCheckedPostId;
  await h(t).withLog('When I send a post with a image and a link', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
    await conversationPage.sendMessage(`${postText1} ${url}`);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    toBeCheckedPostId = await conversationPage.nthPostItem(-1).postId;
  });

  let siteTitle;
  await h(t).withLog(`Then I can find the link title {siteTitle}`, async (step) => {
    const linkIds = await h(t).glip(loginUser).getLinksIdsFromPostId(toBeCheckedPostId);
    siteTitle = await h(t).glip(loginUser).getLink(linkIds[0]).then(res => res.data.title || url);
    step.setMetadata('siteTitle', siteTitle);
  });

  await h(t).withLog('When I pin the text post', async () => {
    postIds.unshift(Number(toBeCheckedPostId));
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": postIds
    })
  });

  await h(t).withLog('Then The new pinned post include the text and attachments show  as an item under tasks tab immediately', async () => {
    // await pinnedTab.countOnSubTitleShouldBe(2);
    await pinnedTab.countInListShouldBe(2);
    await pinnedTab.nthItem(0).shouldBePostId(toBeCheckedPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    const reg = new RegExp(`${postText1}.*${url}`)
    await pinnedTab.nthItem(0).postTextShouldBe(reg);
    await pinnedTab.nthItem(0).shouldHasFileOrImage(fileNames[0]);
    await pinnedTab.nthItem(0).shouldHasFileOrImage(fileNames[1]);
    await pinnedTab.nthItem(0).shouldHasAttachmentsText(siteTitle);
  });
});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1059'],
  keywords: ['PinnedPost'],
  maintainers: ['Potar.He']
})('Unpinned item will disappear from Pinned tab', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const postText = uuid();
  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  let textPostId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I send a text post:${postText}`, async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post via api', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": postIds
    })
  });

  const pinnedTab = rightRail.pinnedTab;
  await h(t).withLog('Then the new pinned post shows under pinned tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    // await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.nthItem(0).shouldBePostId(textPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    await pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog('And I unpin the pinned post via api', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": []
    })
  });

  await h(t).withLog('Then The unpinned item disappear from Pinned tab immediately', async () => {
    await t.expect(pinnedTab.items.exists).notOk();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1061'],
  keywords: ['PinnedPost'],
  maintainers: ['Potar.He']
})('Pinned info will sync immediately when update', async t => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const postText = uuid();
  const newPostText = uuid();

  const noteTitle = uuid();
  const newNoteTitle = uuid();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  let textPostId, notePostId, noteId;
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I send a text post: ${postText}`, async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  await h(t).withLog(`And I send a note post: ${noteTitle}`, async () => {
    const data = await h(t).glip(loginUser).createSimpleNote(team.glipId, noteTitle).then(res => res.data);
    noteId = data["_id"];
    notePostId = data["post_ids"][0].toString();
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": postIds
    });
  });

  const pinnedTab = rightRail.pinnedTab;
  await h(t).withLog('Then the new pinned post shows under pinned tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    // await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.shouldContainPostItem(textPostId);
    await pinnedTab.itemByPostId(textPostId).postTextShouldBe(postText);
  });

  await h(t).withLog(`And I Update the post text to ${newPostText}`, async () => {
    await conversationPage.postItemById(textPostId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(textPostId).actionBarMoreMenu.editPost.enter();
    await conversationPage.postItemById(textPostId).editMessage(newPostText, { replace: true });
  });

  await h(t).withLog('Then the pinned item should be updated immediately', async () => {
    await pinnedTab.itemByPostId(textPostId).postTextShouldBe(newPostText);
  });

  await h(t).withLog(`When I pin the note post title: ${noteTitle}`, async () => {
    postIds = postIds.concat(Number(notePostId))
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": postIds
    });
  });

  await h(t).withLog('Then the new pinned post shows under pinned tab immediately', async () => {
    // await pinnedTab.countOnSubTitleShouldBe(2);
    await pinnedTab.countInListShouldBe(2);
    await pinnedTab.shouldContainPostItem(notePostId);
    await pinnedTab.itemByPostId(notePostId).shouldHasAttachmentsText(noteTitle);
  });

  await h(t).withLog(`And I Update the note title to ${newNoteTitle}`, async () => {
    await h(t).glip(loginUser).updateNote(noteId, { title: newNoteTitle });
  });

  await h(t).withLog('Then the pinned item should be updated immediately', async () => {
    await pinnedTab.itemByPostId(notePostId).shouldHasAttachmentsText(newNoteTitle);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1079'],
  keywords: ['PinnedPost'],
  maintainers: ['Potar.He']
})('Locate the pinned post in the conversation thread in the center panel', async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  };

  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let targetPostId: string;

  await h(t).withLog('And I send two events', async () => {
    await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: uuid() });
    targetPostId = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: uuid() }).then(res => res.data.post_ids[0]);
  });

  await h(t).withLog('And I send three multi-line text', async () => {
    for (const i of _.range(3)) {
      await h(t).scenarioHelper.sendTextPost(H.multilineString(), team, loginUser);
    }
  });

  await h(t).withLog('And I pin the second event post via API', async () => {
    await h(t).glip(loginUser).updateGroup(team.glipId, { pinned_post_ids: [Number(targetPostId)] });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;

  await h(t).withLog('And I open the team conversation, scroll to bottom', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await conversationPage.scrollToBottom();
  });

  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog('When I open the team pined tab and click the pin of the second event above', async () => {
    await rightRail.pinnedEntry.enter();
    await rightRail.pinnedTab.waitUntilItemsListExist();
    const targetPin = rightRail.pinnedTab.itemByPostId(targetPostId);
    await t.click(targetPin.self);
  });

  await h(t).withLog('Then the pined event should be visible', async () => {
    await conversationPage.postByIdExpectVisible(targetPostId, true);
  });

  await h(t).withLog('And the pined event at the top of conversation page.', async () => {
    await conversationPage.postCardByIdShouldBeOnTheTop(targetPostId);
  });
});
