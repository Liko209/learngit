import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/Bookmarks').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());

test(formalName('Bookmark and remove bookmark in the conversation', ['P2', 'Message', 'ContentPanel', 'Bookmark', 'V1.4', 'Knight.Shen']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const app = new AppRoot(t);
  const loginUser = users[5];
  const otherUser = users[6];

  const chat: IGroup = {
    name: `bookmarkTest`,
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, otherUser],
    description: 'bookmarkTest',
  };

  await h(t).withLog('Given one DirecMessage conversation', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const bookmarkDMPostId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), chat, otherUser);
  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const dmSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog(`When I jump to the specific conversation which receive new message`, async () => {
    await dmSection.expand();
    await dmSection.conversationEntryById(chat.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I hover bookmark button on action bar', async () => {
    await conversationPage.postItemById(bookmarkDMPostId).hoverBookmarkToggle();
    await t.expect(conversationPage.postItemById(bookmarkDMPostId).unBookmarkIcon.visible).ok();
  });

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_Bookmark' });

  await h(t).withLog('When I click bookmark button and hover remove bookmark button on action bar', async () => {
    await conversationPage.postItemById(bookmarkDMPostId).clickBookmarkToggle();
    await t.expect(conversationPage.postItemById(bookmarkDMPostId).bookmarkIcon.visible).ok();
  });

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_RemoveBookmarks' });
});
