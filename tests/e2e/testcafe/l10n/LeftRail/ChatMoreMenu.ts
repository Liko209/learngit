import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";

fixture('LeftRail/ChatMoreMenu').beforeEach(setupCase(BrandTire.RCOFFICE)).afterEach(teardownCase());

test(formalName('Should be not favorite when received new unread conversation', ['P2','Message','LeftRail','ChatMoreMenu','V1.4', 'Knight.Shen']), async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[7];
  const app = new AppRoot(t);

  const chat: IGroup = {
    name: `chat ${uuid()}`,
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser],
    description: `@${loginUser}`,
  };

  await h(t).withLog('Given one DirectMessage conversation as unread', async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();
    await h(t).scenarioHelper.createOrOpenChat(chat);
    await h(t).glip(loginUser).hideGroups(chat.glipId);
  });

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When the conversation received one unread post from other members in the direct message conversation', async () => {
    await h(t).scenarioHelper.sendTextPost(uuid(), chat, otherUser);
  });

  const groupDMItem = app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I click more button of group', async () => {
    await groupDMItem.openMoreMenu();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('Then the conversation should be unread', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).umi.shouldBeNumber(1);
  });

  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_LeftRail_DirectMessages' });

  const readOrUnreadToggler = app.homePage.messageTab.moreMenu.markAsReadOrUnread;
  await h(t).withLog('When I click the read button', async () => {
    await readOrUnreadToggler.enter();
  });

  const favoriteToggler = app.homePage.messageTab.moreMenu.favoriteToggler;
  await h(t).withLog('And I click the favorite button', async () => {
    await groupDMItem.openMoreMenu();
    await favoriteToggler.enter();
  });

  const favoritesSection = app.homePage.messageTab.favoritesSection;
  const groupFavItem = favoritesSection.conversationEntryById(chat.glipId);
  await h(t).withLog('And I click more button of group', async () => {
    await t.expect(groupFavItem.exists).ok({timeout:5e3});
    await groupFavItem.openMoreMenu();
  });

  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_LeftRail_Favorites' });

  await h(t).withLog('When I click the remove from favorites button', async () => {
    await favoriteToggler.enter();
  });

  await h(t).withLog('Then the group should be in direct messages section but not in favorite section', async () => {
    await t.expect(groupDMItem.exists).ok({timeout:5e3});
  });

  await h(t).withLog('When I click more button of group in direct message section', async () => {
    await groupDMItem.openMoreMenu();
  });

  const messageTab = app.homePage.messageTab.moreMenu;
  await h(t).withLog('And I click the Close button', async () => {
    await messageTab.close.enter();
  });

  const closeConversationDialog = app.homePage.messageTab.closeConversationModal;
  await h(t).withLog('Then the close conversation dialog should be popup', async () => {
    await t.expect(closeConversationDialog.exists).ok({timeout:5e3});
  });

  await h(t).log('And I take screenshot',{screenshotPath:'Jupiter_LeftRail_CloseConversation'});
});

