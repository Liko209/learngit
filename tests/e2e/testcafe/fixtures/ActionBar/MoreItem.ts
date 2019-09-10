import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ActionBar/MoreItem')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'], caseIds: ['JPT-564'], maintainers: ['zack'], keywords: ['ActionBar', 'MoreItem']
})('Jump to post position when click button or clickable area of post.', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser]
  }

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const deletePostDialog = app.homePage.messageTab.deletePostModal;

  const originalText = 'Original';
  const addText = uuid();
  const newText = `${originalText}${addText}`

  let postId, userName;
  await h(t).withLog('Given I have 1 Bookmarks post in team', async () => {
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, team, loginUser);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the team conversation page', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I click Edit Post in Action bar more item', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(originalText).exists).ok();
    userName = await conversationPage.nthPostItem(-1).name.textContent;
    await conversationPage.postItemById(postId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(postId).actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then I edit post in the text', async () => {
    await conversationPage.postItemById(postId).editMessage(addText);
  });

  await h(t).withLog('And the latest post text should correct', async () => {
    await t.expect(conversationPage.postItemById(postId).text.withText(newText).exists).ok();
  });

  await h(t).withLog('When I quote this post', async () => {
    await conversationPage.postItemById(postId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(postId).actionBarMoreMenu.quoteItem.enter();
  });

  await h(t).withLog('And the input box message should be correct', async () => {
    const reg = new RegExp(`@${userName}.*wrote:.*>.*${newText}`, 'gm');
    await t.expect(conversationPage.messageInputArea.textContent).match(reg);
  });

  await h(t).withLog('And the cursor should keep in input box', async () => {
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  await h(t).withLog('When I delete the post', async () => {
    await conversationPage.postItemById(postId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(postId).actionBarMoreMenu.deletePost.enter();
    await deletePostDialog.delete();
  });

  await h(t).withLog('And the post should be removed', async () => {
    await t.expect(conversationPage.postItemById(postId).exists).notOk();
  });
});;

test(formalName('Whole post edit area is visible when editing one partially visible post', ['P1', 'JPT-2783', 'andy.hu']), async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;

  const originalText = 'Original'.repeat(1000);

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  let postId;
  await h(t).withLog('Given I have one post in a team', async () => {
    await h(t).scenarioHelper.createTeam(team)
    postId = await h(t).platform(loginUser).sentAndGetTextPostId(originalText, team.glipId);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the team conversation page', async () => {
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog('When I scroll a little up to hide the last post partially', async () => {
    const scrollTop = await conversationPage.scrollDiv.scrollTop
    await conversationPage.scrollToY(scrollTop - 250)
  })

  await h(t).withLog('And I click Edit Post in Action bar more item', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(originalText).exists).ok();
    await conversationPage.postItemById(postId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(postId).actionBarMoreMenu.editPost.enter();
  });

  await h(t).withLog('Then the edit area should be visible in page', async () => {
    await H.retryUntilPass(async () => {
      const { bottom: H1 } = await conversationPage.nthPostItem(-1).editTextArea.boundingClientRect;
      const { bottom: H2 } = await conversationPage.scrollDiv.boundingClientRect;
      assert.ok(H2 > H1); // todo: Find a more credible method
    })
  });
});;
