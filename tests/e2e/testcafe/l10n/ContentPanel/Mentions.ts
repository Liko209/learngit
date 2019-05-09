import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('ContentPanel')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open mentions list and hover on a post', ['P2', 'Messages', 'ContentPanel', 'V1.4', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[6];
  const otherUser = h(t).rcData.mainCompany.users[7];
  const app = new AppRoot(t);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let postId: string;
  await h(t).withLog('Given I have an extension with 1 at-mention post', async () => {
    const postText = `Hi, ![:Person](${loginUser.rcId})`;
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, chat, otherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const mentionsEntry = app.homePage.messageTab.mentionsEntry;
  const mentionPage = app.homePage.messageTab.mentionPage;
  await h(t).withLog('When I click Mentions', async () => {
    await mentionsEntry.enter();
  });

  await h(t).withLog('And hover on the post', async () => {
    // await t.expect(mentionPage.postItemById(postId).exists).ok();
    await mentionPage.postItemById(postId).hoverPost();
  });

  await h(t).withLog('Then I can see Jump to Conversation button', async () => {
    await t.expect(mentionPage.postItemById(postId).jumpToConversationButton.exists).ok();
  })

  await h(t).log('And I capture screenshot', {screenshotPath: 'Jupiter_ContentPanel_MentionsJumpToConversation'})
})
