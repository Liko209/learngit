/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.com)
 * @Date: 5/08/2019 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Link')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-224'],
  maintainers: ['potar.he'],
  keywords: ['urlFormat'],
})('[Browser] Should open a new browser tab/Web when click a link from post', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }


  const sameDomainUrl = SITE_URL;
  const differentDomainUrl = 'https://www.google.com';
  await h(t).withLog(`Given same domain URL {same} and different domain URL {diff}`, async (step) => {
    step.initMetadata({
      same: sameDomainUrl,
      diff: differentDomainUrl
    })
  });

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let eventPostId: string, textPostId: string, taskPostId: string;
  await h(t).withLog("And I have event,text,task with URLs (same and different domain)", async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`${sameDomainUrl} \n ${differentDomainUrl}`, chat, loginUser);
    eventPostId = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: chat.glipId,
      title: uuid(),
      description: sameDomainUrl,
      location: differentDomainUrl
    }).then(res => res.data.post_ids[0]);
    taskPostId = await h(t).glip(loginUser).createSimpleTask(chat.glipId, loginUser.rcId, uuid(), {
      notes: `${sameDomainUrl} \n ${differentDomainUrl}`
    }).then(res => res.data.post_ids[0]);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter as User A: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open the chat', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
  });

  await h(t).withLog('Then I can found the URLs in text post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(textPostId).text.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(textPostId).text.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });
  await h(t).withLog('And I can found the URLs in event post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(eventPostId).self.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(eventPostId).self.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });

  await h(t).withLog('And I can found the URLs in task post have attribute [target="_blank"]', async () => {
    await t.expect(conversationPage.postItemById(taskPostId).self.find('a').filter(`[href="${sameDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
    await t.expect(conversationPage.postItemById(taskPostId).self.find('a').filter(`[href="${differentDomainUrl}"]`).withAttribute('target', "_blank").exists).ok();
  });
});
