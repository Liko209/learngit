/*
 * @Author: Potar.He 
 * @Date: 2019-02-19 17:44:59 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-02-19 18:38:07
 */


import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('New pinned will show under Pinned tab immediately', ['PinnedPost', 'Potar', 'P2', 'JPT-1057']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();



  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');
  const filesPath = ['../../sources/1.png', '../../sources/1.txt'];
  const fileNames = ['1.png', '1.txt'];
  const postText = uuid();
  const url = 'http://google.com'
  const postText1 = uuid();

  let teamId, textPostId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
    textPostId = await h(t).platform(loginUser).sentAndGetTextPostId(postText, teamId);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  const rightRail = app.homePage.messageTab.rightRail;
  const pinnedTab = rightRail.pinnedTab;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post', async () => {
    await h(t).glip(loginUser).updateGroup(teamId, {
      "pinned_post_ids": postIds
    })
  });

  await h(t).withLog('Then the new pinned post shows under tasks tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.nthItem(0).shouldBePostId(textPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    await pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  let toBeCheckedPostId;
  await h(t).withLog('When I send a post with a image and a file', async () => {
    await conversationPage.uploadFilesToMessageAttachment(filesPath);
    await conversationPage.sendMessage(`${postText1} ${url}`);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
    toBeCheckedPostId = await conversationPage.nthPostItem(-1).postId;
  });

  await h(t).withLog('And I pin the text post', async () => {
    postIds.unshift(Number(toBeCheckedPostId));
    await h(t).glip(loginUser).updateGroup(teamId, {
      "pinned_post_ids": postIds
    })
  });

  await h(t).withLog('Then The new pinned post include the text and attachments show  as an item under tasks tab immediately', async () => {
    await pinnedTab.countOnSubTitleShouldBe(2);
    await pinnedTab.countInListShouldBe(2);
    await pinnedTab.nthItem(0).shouldBePostId(toBeCheckedPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    const reg = new RegExp(`${postText1}.*${url}`)
    await pinnedTab.nthItem(0).postTextShouldBe(reg);
    await pinnedTab.nthItem(0).shouldHasFileOrImage(fileNames[0]);
    await pinnedTab.nthItem(0).shouldHasFileOrImage(fileNames[1]);
    await pinnedTab.nthItem(0).attachmentIcons.withText('link'); // title of Url is unstable. so only check link item icon
  });
});

test(formalName('Unpinned item will disappear from Pinned tab', ['PinnedPost', 'Potar', 'P1', 'JPT-1059']), async t => {
  const app = new AppRoot(t);


  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const postText = uuid();
  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');

  let teamId, textPostId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
    textPostId = await h(t).platform(loginUser).sentAndGetTextPostId(postText, teamId);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post', async () => {
    await h(t).glip(loginUser).updateGroup(teamId, {
      "pinned_post_ids": postIds
    })
  });

  const pinnedTab = rightRail.pinnedTab;
  await h(t).withLog('Then the new pinned post shows under tasks tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.nthItem(0).shouldBePostId(textPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    await pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog('And I unpin the pinned post', async () => {
    await h(t).glip(loginUser).updateGroup(teamId, {
      "pinned_post_ids": []
    })
  });

  await h(t).withLog('Then The unpinned item disappear from Pinned tab immediately', async () => {
    await t.expect(pinnedTab.items.exists).notOk();
  });
});

test(formalName('Pinned info will sync immediately when update', ['PinnedPost', 'Potar', 'P1', 'JPT-1061']), async t => {
  const app = new AppRoot(t);

  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const postText = uuid();
  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');

  let teamId, textPostId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
    textPostId = await h(t).platform(loginUser).sentAndGetTextPostId(postText, teamId);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog('When I open a team and open Pinned tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await rightRail.pinnedEntry.enter();
  });

  let postIds = [Number(textPostId)];
  await h(t).withLog('And I pin the text post', async () => {
    await h(t).glip(loginUser).updateGroup(teamId, {
      "pinned_post_ids": postIds
    })
  });

  const pinnedTab = rightRail.pinnedTab;
  await h(t).withLog('Then the new pinned post shows under tasks tab immediately', async () => {
    await pinnedTab.waitUntilItemsListExist();
    await pinnedTab.countOnSubTitleShouldBe(1);
    await pinnedTab.countInListShouldBe(1);
    await pinnedTab.nthItem(0).shouldBePostId(textPostId);
    await pinnedTab.nthItem(0).shouldBeCreator(userName);
    await pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog(`And I Update a pinned item's following elements:  Text content Attachment's info (e.g. update link url)`, async () => {

  });

  await h(t).withLog('Then The unpinned item disappear from Pinned tab immediately', async () => {
    await t.expect(pinnedTab.items.exists).notOk();
  });
});