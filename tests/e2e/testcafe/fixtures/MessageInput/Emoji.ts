/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */


import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('Send Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'], caseIds: ['JPT-1702'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Can send emoji via emoji library', async (t) => {
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

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  let emojiValue: string
  let emojis = [];
  await h(t).withLog('When I click a first emoji in "Smileys & People"', async () => {
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(0);
    emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(0).getValue();
    emojis.push(emojiValue);
  });

  await h(t).withLog('Then the emoji library should keep open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`And display emoji's key ":${emojiValue}:" in the input box`, async () => {
    await t.expect(conversationPage.messageInputArea.withAttribute(`:${emojiValue}:`)).ok();
  });

  await h(t).withLog(`And the selected emoji display in the "frequently used" tab `, async () => {
    await emojiLibrary.frequentlyUsedSection.emojiItemByValue(emojiValue).ensureLoaded();
  });

  await h(t).withLog(`And focus on the input box`, async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('When I click a second emoji in "Smileys & People"', async () => {
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(1);
    emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(1).getValue();
    emojis.push(emojiValue);
  });

  await h(t).withLog('Then the emoji library should keep open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`And display emoji's key ":${emojiValue}:" in the input box`, async () => {
    await t.expect(conversationPage.messageInputArea.withAttribute(`:${emojiValue}:`)).ok();
  });

  await h(t).withLog(`And the selected emoji display in the "frequently used" tab `, async () => {
    await emojiLibrary.frequentlyUsedSection.emojiItemByValue(emojiValue).ensureLoaded();
  });

  await h(t).withLog(`And focus on the input box`, async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('When I hitting "Enter" on the keyboard"', async () => {
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog('Then display the emojis in the conversation stream', async () => {
    await conversationPage.nthPostItem(-1).emojisShouldBeInOrder(emojis);
  });
});



test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-1789'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Check emoji can be sorted by type', async (t) => {
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

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog('When I click emoji tab "Smileys & People"', async () => {
    await emojiLibrary.clickTabByCategory('Smileys & People');
  });

  await h(t).withLog('Then this tab should be selected', async () => {
    await emojiLibrary.selectedTabShouldBeCategory('Smileys & People');
  });

  await h(t).withLog('And the type header should be on the top', async () => {
    await emojiLibrary.categoryHeaderOnTopShouldBe('Smileys & People');
  });

  await h(t).withLog('When I scroll to type "Animals & Nature"', async () => {
    await emojiLibrary.animalsAndNatureSection.scrollIntoView();
  });

  await h(t).withLog('Then this tab should be selected', async () => {
    await emojiLibrary.selectedTabShouldBeCategory('Animals & Nature');
  });

  await h(t).withLog('And the type header should be on the top', async () => {
    await emojiLibrary.categoryHeaderOnTopShouldBe('Animals & Nature');
  });

});


test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-1795'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Check can search emoji in the emoji library', async (t) => {
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

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  const existsEmoji = 'monkey'
  await h(t).withLog(`When I search a exists emoji "${existsEmoji}"`, async () => {
    await emojiLibrary.searchEmoji(existsEmoji);
  });

  await h(t).withLog('Then Display the matched emoji list', async () => {
    await emojiLibrary.searchResultSection.emojiItemByValue(existsEmoji).ensureLoaded();
  });

  const notExistsEmoji = uuid();
  const noResultLabel = 'No Emoji Found';
  await h(t).withLog(`When I search not exists emoji "${notExistsEmoji}"`, async () => {
    await emojiLibrary.searchEmoji(notExistsEmoji);
  });

  await h(t).withLog(`Then Display "${noResultLabel}"`, async () => {
    await t.expect(emojiLibrary.searchResultSection.noResultDiv.exists).ok();
    await t.expect(emojiLibrary.searchResultSection.noResultLabel.textContent).eql(noResultLabel);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-1757'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Check can close the emoji library', async (t) => {
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

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  const emojiLibrary = app.homePage.messageTab.emojiLibrary;
  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`When I click out of the emoji library`, async () => {
    await t.click(conversationPage.header);
  });

  await h(t).withLog('Then the emoji library should be dismiss', async () => {
    await emojiLibrary.ensureDismiss();
  });

  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`When I press "esc" on the keyboard`, async () => {
    await emojiLibrary.quitByPressEsc();
  });

  await h(t).withLog('Then the emoji library should be dismiss', async () => {
    await emojiLibrary.ensureDismiss();
  });

});