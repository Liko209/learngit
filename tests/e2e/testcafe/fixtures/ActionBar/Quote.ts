/*
 * @Author: Potar.He
 * @Date: 2019-06-25 11:20:27
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-06-25 19:00:56
 */

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

import { v4 as uuid } from 'uuid';

fixture('ActionBar/MoreItem')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-239'],
  keywords: ['EditPost'],
  maintainers: ['potar.he']
})('Check the message of quote dispaly in the conversation card', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5]

  const originalText = 'line1\nline2';
  const addText = 'new-line';
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  const userName = await h(t).glip(loginUser).getPersonPartialData('display_name');

  const quoteAddEmpty = `${userName} wrote:${originalText}`;
  const quoteAddText = `${userName} wrote:${originalText}\n${addText}`;

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId;
  await h(t).withLog('Given I have a origin post in a chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, chat, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage
  const postItem = conversationPage.postItemById(postId);
  await h(t).withLog('And I enter the chat conversation page', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('When I quote this origin post', async () => {
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.quoteItem.enter();

  });

  await h(t).withLog('And no type any text and press enter to send post', async () => {
    await t.expect(conversationPage.messageInputArea.textContent).notEql('');
    await t.wait(2e3).pressKey('enter');
  });

  await h(t).withLog('Then the last post context should be format', async () => {
    await conversationPage.lastPostItem.waitForPostToSend();
    await t.expect(conversationPage.lastPostItem.text.textContent).eql(quoteAddEmpty)
  })

  await h(t).withLog('When I quote this origin post', async () => {
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.quoteItem.enter();
  });

  await h(t).withLog('And type text "{addText}" and press enter to send post', async (step) => {
    step.setMetadata('addText', addText);
    await t.expect(conversationPage.messageInputArea.textContent).notEql('');
    await t.wait(1e3)
      .typeText(conversationPage.messageInputArea, addText)
      .expect(conversationPage.messageInputArea.withText(addText).exists).ok()
      .click(conversationPage.messageInputArea)
      .pressKey('enter');
  });

  await h(t).withLog('Then the last post context should be format', async () => {
    await conversationPage.lastPostItem.waitForPostToSend();
    await t.expect(conversationPage.lastPostItem.text.textContent).eql(quoteAddText)
  })
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-458'],
  keywords: ['EditPost'],
  maintainers: ['potar.he']
})('User should be able to edit/delete the quoted part and add more text/attachment before sending the quoting post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const anotherUser = users[5]

  const originalText = `quoted-${uuid()}`;
  const addText = `added-${uuid()}`;

  const filePath = '../../sources/1.txt';
  const fileName = '1.txt';

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser]
  }

  let postId;
  await h(t).withLog('Given I have a origin post in a chat', async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createOrOpenChat(chat);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(originalText, chat, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage
  const postItem = conversationPage.postItemById(postId);
  await h(t).withLog('And I enter the chat conversation page', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  await h(t).withLog('When I quote this origin post', async () => {
    await postItem.clickMoreItemOnActionBar();
    await postItem.actionBarMoreMenu.quoteItem.enter();
  });

  await h(t).withLog('And type text "{addText}"', async (step) => {
    step.setMetadata('addText', addText);
    await t.expect(conversationPage.messageInputArea.textContent).notEql('');
    await t.wait(1e3).typeText(conversationPage.messageInputArea, addText);
  }, true);

  await h(t).withLog('Then "{addText}" can be add in input box', async (step) => {
    step.setMetadata('addText', addText);
    await t.expect(conversationPage.messageInputArea.withText(addText).exists).ok()
  });

  await h(t).withLog('When I upload attachment {fileName} when input text in quoting message', async (step) => {
    step.setMetadata('fileName', fileName);
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  });

  await h(t).withLog('Then "{fileName} Attachment can upload as well', async (step) => {
    step.setMetadata('fileName', fileName);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(fileName).exists).ok();
  });

});