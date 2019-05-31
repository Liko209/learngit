import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { IGroup } from "../../v2/models";

fixture('ContentPanel/Emoji')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase())
test(formalName('Check the Emoji feature on conversation', ['P2','ContentPane', 'Messages', 'Emoji', 'V1.4', 'Hanny.Han']),
async (t: TestController) => {

  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[1]]
  }

  const app = new AppRoot(t);
  await h(t).withLog(`Given I have a chat with ${anotherUser.extension}`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I hover emoji icon', async () => {
    await t.hover(conversationPage.emojiButton);
  });

  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_Emoji'});

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  await h(t).withLog('When I click emoji icon and display emoji list', async () => {
    await t.click(conversationPage.emojiButton);
    await emojiLibrary.ensureLoaded();
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiList'});

  await h(t).withLog('When I click emoji Animals & Nature', async () => {
    await emojiLibrary.clickTabByCategory('Animals & Nature');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiAnimalsNature'});

  await h(t).withLog('When I click emoji Food & Drink', async () => {
    await emojiLibrary.clickTabByCategory('Food & Drink');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiFoodDrink'});

  await h(t).withLog('When I click emoji Activity', async () => {
    await emojiLibrary.clickTabByCategory('Activity');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiActivity'});

  await h(t).withLog('When I click emoji Travel & Places', async () => {
    await emojiLibrary.clickTabByCategory('Travel & Places');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiTravelPlaces'});

  await h(t).withLog('When I click emoji Objects', async () => {
    await emojiLibrary.clickTabByCategory('Objects');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiObjects'});

  await h(t).withLog('When I click emoji Symbols', async () => {
    await emojiLibrary.clickTabByCategory('Symbols');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiSymbols'});

  await h(t).withLog('When I click emoji Flags', async () => {
    await emojiLibrary.clickTabByCategory('Flags');
  });
  await h(t).log('Then I capture screenshot',{screenshotPath:'Jupiter_ContentPanel_EmojiFlags'});

});
