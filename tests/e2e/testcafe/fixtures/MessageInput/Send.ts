/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */


import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';

fixture('Send Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Enter text in the conversation input box', ['P0', 'JPT-77']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[4];
  const app = new AppRoot(t);
  const userPlatform = await h(t).getPlatform(user);

  await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I create one new teams`, async () => {
    await userPlatform.createGroup({
      type: 'Team',
      name: uuid(),
      members: [user.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.teamsSection.expand();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  const identifier = uuid();
  const message = `${faker.lorem.sentence()} ${identifier}`;

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I can send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
  });

  await h(t).withLog('And I can read this message from post list', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(identifier).exists).ok();
  }, true);
});
