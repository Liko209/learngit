/*
 * @Author: Alexander Zaverukha (alexander.zaverukha@ringcentral.com)
 * @Date: 2019-05-08 11:20:43
 * Copyright © RingCentral. All rights reserved.
 */

import {h} from '../../v2/helpers';
import {setupCase, teardownCase} from '../../init';
import {AppRoot} from '../../v2/page-models/AppRoot';
import {SITE_URL, BrandTire} from '../../config';
import {IGroup, ITestMeta} from '../../v2/models';

fixture('Message/EmailAddress')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-233'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['Email address']
})('Check email address can be detected in the conversation stream', async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4]
    const anotherUser = users[5];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.resetProfile(loginUser);

    let chat = <IGroup>{
      type: 'DirectMessage',
      owner: loginUser,
      members: [loginUser, anotherUser]
    }

    await h(t).withLog('Given I have a 1:1 chat conversation', async () => {
      await h(t).scenarioHelper.createOrOpenChat(chat);
    })

    const postsEmails = [
      {text: '1a!@!.test.com', isCorrect: false}, {text: '1a!@\u7684.test.com', isCorrect: false}, {text: '1a!@1a!.test.com', isCorrect: false},
      {text: '\u7684@!.test.com', isCorrect: false}, {text: '!@\u7684.test.com', isCorrect: false}, {text: '\u7684@1a!.test.com', isCorrect: false},
      {text: '!@!.test.com', isCorrect: false}, {text: '!@\u7684.test.com', isCorrect: false}, {text: '!@1a!.test.com', isCorrect: false},
      {text: 'a1_@a.test.com', isCorrect: true}, {text: 'a@1.test.com', isCorrect: true}, {text: 'a1_@a1_.test.com', isCorrect: true},
      {text: '1@a.test.com', isCorrect: true}, {text: 'a@1.test.com', isCorrect: true}, {text: 'a1_@a1_.test.com', isCorrect: true},
      {text: 'a@a.test.com', isCorrect: true}, {text: 'a@1.test.com', isCorrect: true}, {text: 'a1_@a1_.test.com', isCorrect: true},
    ];

    await h(t).withLog('And I post emails in the conversation', async () => {
      for (const post of postsEmails) {
        let postDataId = await h(t).platform(loginUser).createPost(post, chat.glipId).then(res => res.data.id)
        post['id'] = postDataId;
      }
    });

    await h(t).withLog(`And I login Jupiter with this extension: ${anotherUser.company.number}#${anotherUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, anotherUser);
        await app.homePage.ensureLoaded();
      });

    await h(t).withLog(`When I enter the conversation: ${chat.glipId}`, async () => {
      const directMessagesSection = app.homePage.messageTab.directMessagesSection;
      await directMessagesSection.conversationEntryById(chat.glipId).enter();
    });

    await h(t).withLog('Then email addresses detected in conversation stream in format: [letter/digital/letter+digital+_]@[letter/digital/letter+digital+_].[domain name]', async () => {
      for (const post of postsEmails.filter(value => value.isCorrect).reverse()) {
        await app.homePage.messageTab.conversationPage.scrollUpToViewPostById(post['id']);
        let href = await app.homePage.messageTab.conversationPage.postItemById(post['id']).href.getAttribute('href');
        await t.expect(href).contains("mailto:");
      }
    });

    await h(t).withLog('And email addresses not detected in conversation stream in format: [special characters/chinese/digital+letter+special characters]@[special characters/chinese/digital+letter+special characters].[domain name]', async () => {
      for (const post of postsEmails.filter(value => !value.isCorrect).reverse()) {
        await app.homePage.messageTab.conversationPage.scrollUpToViewPostById(post['id']);
        let href = await app.homePage.messageTab.conversationPage.postItemById(post['id']).href.getAttribute('href');
        await t.expect(href).notContains("mailto:");
      }
    });
  });


