import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ActionBar/MoreItem')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Jump to post position when click button or clickable area of post.', ['P1', 'JPT-564', 'zack']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  await h(t).platform(user).init();
  await h(t).glip(user).init();
  await h(t).glip(user).resetProfileAndState();

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const deletePostDialog = app.homePage.messageTab.deletePostModal;

  const originalText = 'Original';
  const addText = uuid();
  const newText = `${originalText}${addText}`

  let teamId, postId, userName;
  await h(t).withLog('Given I have 1 Bookmarks post in team ,one in group', async () => {
    teamId = await h(t).platform(user).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    });
    postId = await h(t).platform(user).sentAndGetTextPostId(originalText, teamId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the team conversation page', async () => {
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And I click Edit Post in Action bar more item', async () => {
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

  await h(t).withLog('When I delete the post', async () => {
    await conversationPage.postItemById(postId).clickMoreItemOnActionBar();
    await conversationPage.postItemById(postId).actionBarMoreMenu.deletePost.enter();
    await deletePostDialog.delete();
  });

  await h(t).withLog('And the post should be removed', async () => {
    await t.expect(conversationPage.postItemById(postId).exists).notOk();
  });
});;
