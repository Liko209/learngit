import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ActionBar/MoreItem')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());
test(formalName('Jump to post position when click button or clickable area of post.',['P1','JPT-564','zack']),
  async (t: TestController)=>{
  const app =new AppRoot(t);
  const users =h(t).rcData.mainCompany.users;
  const user = users[4];
  const userPlatform = await h(t).getPlatform(users[4]);
  user.sdk = await h(t).getSdk(user);

  const conversationPage = app.homePage.messageTab.conversationPage;
  const teamsSection = app.homePage.messageTab.teamsSection;
  const deletePostDailog= app.homePage.messageTab.deletePostModal;

  let originalPost = 'Original';
  let editPost = uuid();

  let teamId, newPost, bookmarksPostChat;
  await h(t).withLog('Given I have 1 Bookmarks post in team ,one in group', async () => {
    teamId = (await user.sdk.platform.createGroup({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [user.rcId, users[5].rcId, users[6].rcId],
    })).data.id;

    newPost = await userPlatform.createPost(
      { text: originalPost },
      teamId,
    );
    await user.sdk.glip.updateProfile(user.rcId, {
      [`hide_group_${teamId}`]: false,
    });
    ;
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the team conversation page', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamId).enter();
  });

  await h(t).withLog('And I click Edit Post in Action bar more item', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(originalPost).exists).ok();
    await conversationPage.postItemById(newPost.data.id).clickMoreItemOnActionBar();
    await conversationPage.postItemById(newPost.data.id).actionBarMoreMenu.eidtPost.enter();
  });

  await h(t).withLog('Then I edit post in the text', async () => {
    await conversationPage.postItemById(newPost.data.id).editMessage(editPost);
  });

  await h(t).withLog('And the latest post text should correct', async () => {
     await t.expect(conversationPage.postItemById(newPost.data.id).text
     .withText(`${originalPost}${editPost}`).exists).ok();
  });

  await h(t).withLog('When I quote this post', async () => {
    await conversationPage.postItemById(newPost.data.id).clickMoreItemOnActionBar();
    await conversationPage.postItemById(newPost.data.id).actionBarMoreMenu.quoteItem.enter();
  });

  await h(t).withLog('And the input box message should be correct', async () => {
    await conversationPage.messageInputArea.withText(`${user.rcId} wrote:`);
    await conversationPage.messageInputArea.withText('>');
    await conversationPage.messageInputArea.withText(`${originalPost}${editPost}`);
  });

  await h(t).withLog('When I delete the post', async () => {
    await conversationPage.postItemById(newPost.data.id).clickMoreItemOnActionBar();
    await conversationPage.postItemById(newPost.data.id).actionBarMoreMenu.deletePost.enter();
    await deletePostDailog.confrimDeleteButton();
  });

  await h(t).withLog('And the post should be removed', async () => {
    await t.expect(conversationPage.postItemById(newPost.data.id).exists).notOk();
  });
});;
