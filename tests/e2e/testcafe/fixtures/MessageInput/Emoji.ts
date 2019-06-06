/*
 * @Author: Potar.He
 * @Date: 2019-05-09 10:51:18
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-06-06 21:37:20
 */


import { v4 as uuid } from 'uuid';

import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import { ClientFunction } from 'testcafe';

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
    members: [loginUser, anotherUser]
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
    emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(0).getValue();
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(0);
    emojis.push(emojiValue);
  });

  await h(t).withLog('Then the emoji library should dismiss', async () => {
    await emojiLibrary.ensureDismiss();
  });

  await h(t).withLog(`And display emoji's key ":${emojiValue}:" in the input box`, async () => {
    await t.expect(conversationPage.messageInputArea.withAttribute(`:${emojiValue}:`)).ok();
  });


  await h(t).withLog(`And focus on the input box`, async () => {
    await conversationPage.shouldFocusOnMessageInputArea();
  });

  await h(t).withLog('When I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`And the selected emoji display in the "frequently used" tab `, async () => {
    await emojiLibrary.frequentlyUsedSection.emojiItemByValue(emojiValue).ensureLoaded();
  });

  await h(t).withLog('When I click a second emoji in "Smileys & People"', async () => {
    emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(1).getValue();
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(1);
    emojis.push(emojiValue);
  });

  await h(t).withLog('Then the emoji library should dismiss', async () => {
    await emojiLibrary.ensureDismiss();
  });

  await h(t).withLog(`And display emoji's key ":${emojiValue}:" in the input box`, async () => {
    await t.expect(conversationPage.messageInputArea.withAttribute(`:${emojiValue}:`)).ok();
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
    members: [loginUser, anotherUser]
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
    const scrollDiv = emojiLibrary.scrollDiv;
    // need scroll down 1 px more.
    await ClientFunction((scrollDiv) => {
      const currentHeight = scrollDiv().scrollTop;
      scrollDiv().scrollTop = currentHeight + 1;
    })(scrollDiv);
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
    members: [loginUser, anotherUser]
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
    members: [loginUser, anotherUser]
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

  await h(t).withLog('And I click Emoji button', async () => {
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the emoji library should be open', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog(`When click emoji button again`, async () => {
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the emoji library should be dismiss', async () => {
    await emojiLibrary.ensureDismiss();
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2034'], keywords: ['emoji'], maintainers: ['Skye.wang']
})('Check can keep open the emoji library', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUser]
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

  await h(t).withLog(`When I make emoji library keep open`, async () => {
    await emojiLibrary.turnOnKeepOpen();
  });

  await h(t).withLog('And I select emoji but can not close emoji library', async () => {
    await emojiLibrary.smileysAndPeopleSection.clickEmojiByNth(0);
  });

  await h(t).withLog('Then can not close emoji library', async () => {
    await emojiLibrary.ensureLoaded();
  });

  await h(t).withLog('When I close the emoji library then reopen', async () => {
    await t.click(conversationPage.header);
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the toggle of keep open in open status', async () => {
    await t.expect(emojiLibrary.keepOpenStatus).ok;
  });

  await h(t).withLog(`When I switch to another conversation and open emoji library`, async () => {
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(1).enter();
    await conversationPage.clickEmojiButton();
  });

  await h(t).withLog('Then the toggle of keep open in open status', async () => {
    await t.expect(emojiLibrary.keepOpenStatus).ok;
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2040'], keywords: ['emoji'], maintainers: ['Skye.wang']
})('Check can display emoji information when hovering an emoji', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUser]
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
    await t.expect(emojiLibrary.smileysAndPeopleSection.list.exists).ok;
  });

  await h(t).withLog(`And has keep open toggle in the foot`, async () => {
    await t.expect(emojiLibrary.keepOpenToggle.exists).ok;
  });

  await h(t).withLog('When I hover the first emoji', async () => {
    await emojiLibrary.smileysAndPeopleSection.hoverEmojiByNth(0);
  });

  let emojiValue: string
  const emojiName = 'Grinning Face';
  const emojiShortName = ':grinning:';
  emojiValue = await emojiLibrary.smileysAndPeopleSection.nthEmojiItem(0).getValue();
  await h(t).withLog('Then keep open toggle change to emoji information priview', async () => {
    await emojiLibrary.previewShouldBeKey(emojiValue);
    await t.expect(emojiLibrary.previewName.textContent).eql(emojiName);
    await t.expect(emojiLibrary.previewShortName.textContent).eql(emojiShortName);
  });

});


test.meta(<ITestMeta>{
  priority: ['P1'], caseIds: ['JPT-1747'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Check can display emoji information when hovering an emoji', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  const emojiText = ':sm:'
  const prefix = ':fla';
  const mixPrefix = 'gr :gr'
  const wrongPrefix = ':huhuhu';
  let currentInputAreaText = '';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I have a chat with {extension}`, async (step) => {
    step.setMetadata('extension', anotherUser.extension);
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I type text: {emojiText}', async (step) => {
    step.setMetadata('emojiText', emojiText);
    await t.typeText(conversationPage.messageInputArea, emojiText, { paste: true, replace: true });
  });

  await h(t).withLog('When I hit Enter on the keyboard to send the message', async () => {
    await t.pressKey('enter');
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`Then Display the emoji {emojiText} in the conversation stream`, async (step) => {
    step.setMetadata('emojiText', emojiText);
    currentInputAreaText = emojiText + ' ';
    await conversationPage.nthPostItem(-1).shouldHasEmojiByValue(emojiText);
  });

  await h(t).withLog('When  I type text: {prefix}', async (step) => {
    step.setMetadata('prefix', prefix);
    await t.typeText(conversationPage.messageInputArea, prefix, { paste: false, replace: false });
  });

  const emojiMatchList = app.homePage.messageTab.emojiMatchList;
  await h(t).withLog('Then the emoji emoji match list should be open', async () => {
    await emojiMatchList.ensureLoaded();
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  await h(t).withLog('And the first emoji match item is in selected style', async () => {
    await emojiMatchList.itemByNth(0).shouldBeSelected();
  });

  await h(t).withLog('When I hit down on the keyboard', async () => {
    await t.pressKey('down');
  });

  await h(t).withLog('Then the second emoji item is in selected style', async () => {
    await emojiMatchList.itemByNth(1).shouldBeSelected();
  });

  await h(t).withLog('When I hit up on the keyboard', async () => {
    await t.pressKey('up');
  });

  let firstEmoji = '';
  await h(t).withLog('Then the first emoji item {value} is in selected style', async (step) => {
    await emojiMatchList.itemByNth(0).shouldBeSelected();
    firstEmoji = await emojiMatchList.itemByNth(0).textSpan.textContent
    firstEmoji = firstEmoji.trim();
    step.setMetadata('value', firstEmoji);
  });

  await h(t).withLog('When I hit Enter on the keyboard', async () => {
    await t.pressKey('enter');
  });
  await h(t).withLog(`Then Display selected emoji's key {value} and text in the input box`, async (step) => {
    step.setMetadata('value', firstEmoji);
    currentInputAreaText = `${firstEmoji} `;
    await t.expect(conversationPage.messageInputArea.textContent).eql(currentInputAreaText);
  });

  await h(t).withLog('When I type text: {mixPrefix}', async (step) => {
    step.setMetadata('mixPrefix', mixPrefix);
    await t.typeText(conversationPage.messageInputArea, mixPrefix, { paste: true });
  });

  await h(t).withLog('Then the emoji emoji match list should be open', async () => {
    await emojiMatchList.ensureLoaded();
    await t.expect(conversationPage.messageInputArea.focused).ok();
  });

  let secondEmoji = '';
  await h(t).withLog('And the first emoji match item {value} is in selected style', async (step) => {
    await emojiMatchList.itemByNth(0).shouldBeSelected();
    secondEmoji = await emojiMatchList.itemByNth(0).textSpan.textContent
    secondEmoji = secondEmoji.trim();
    step.setMetadata('value', secondEmoji);
  });

  await h(t).withLog('When I hit Tab on the keyboard', async () => {
    await t.pressKey('tab');
  });

  await h(t).withLog(`Then Display selected emoji's key {value} and text in the input box`, async (step) => {
    step.setMetadata('value', secondEmoji);
    currentInputAreaText = `${firstEmoji} gr ${secondEmoji} `;
    const reg = new RegExp(`${firstEmoji}.*gr.*${secondEmoji}.* `);
    await t.expect(conversationPage.messageInputArea.textContent).match(reg);
  });

  await h(t).withLog('When I hit Enter on the keyboard to send the message', async () => {
    await t.pressKey('enter');
  });

  await h(t).withLog(`Then Display the emoji in the conversation stream`, async (step) => {
    const emijis = [firstEmoji.replace(':', ""), secondEmoji.replace(':', "")]
    await conversationPage.nthPostItem(-1).emojisShouldBeInOrder(emijis)
  });

  await h(t).withLog('When I type text: {wrongPrefix}', async (step) => {
    step.setMetadata('wrongPrefix', wrongPrefix);
    await t.typeText(conversationPage.messageInputArea, wrongPrefix, { replace: true, paste: true });
  });

  await h(t).withLog('Then the emoji emoji match list should not be open ', async () => {
    await emojiMatchList.ensureDismiss();
  });

  await h(t).withLog('When I hit Enter on the keyboard to send the message', async () => {
    await t.pressKey('enter');
  });

  await h(t).withLog(`Then not emoji in last post `, async () => {
    await t.expect(conversationPage.lastPostItem.emojis.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'], caseIds: ['JPT-2115'], keywords: ['emoji'], maintainers: ['Potar.he']
})('Check can close the matching emoji list', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5];
  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  const prefix = ':sm';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I have a chat with {extension}`, async (step) => {
    step.setMetadata('extension', anotherUser.extension);
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the chat conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;


  await h(t).withLog('When  I type text: {prefix}', async (step) => {
    step.setMetadata('prefix', prefix);
    await t.typeText(conversationPage.messageInputArea, prefix, { paste: true });
  });

  const emojiMatchList = app.homePage.messageTab.emojiMatchList;
  await h(t).withLog('Then the emoji emoji match list should be open', async () => {
    await emojiMatchList.ensureLoaded();
  });
  await h(t).withLog('When I press esc', async () => {
    await emojiMatchList.quitByPressEsc();
  });

  await h(t).withLog('Then the emoji emoji match list should dismiss', async () => {
    await emojiMatchList.ensureDismiss();
  });

  await h(t).withLog('When  I type text: {prefix}', async (step) => {
    step.setMetadata('prefix', prefix);
    await t.typeText(conversationPage.messageInputArea, prefix, { paste: true, replace: true });
  });

  await h(t).withLog('Then the emoji emoji match list should be open', async () => {
    await emojiMatchList.ensureLoaded();
  });
  await h(t).withLog('When I Click outside except input box', async () => {
    await t.click(conversationPage.header)
  });

  await h(t).withLog('Then the emoji emoji match list should dismiss', async () => {
    await emojiMatchList.ensureDismiss();
  })

})
