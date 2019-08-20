/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 16:15:52
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as _ from 'lodash';
import * as assert from "assert";

fixture('ConversationList/FavoriteSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-6'], priority: ['P2'], keywords: ['ConversationList', 'FavoriteSection'], maintainers: ['potar.he']
})('Expand & Collapse', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[5]]
  }
  const team = <IGroup>{
    type: 'Team',
    members: [loginUser],
    owner: loginUser,
    name: uuid()
  }

  await h(t).withLog('Given I have an extension with a private chat and a team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat, team]);
  });

  await h(t).withLog('Make sure the conversations are shown and marked as favorite', async () => {
    await h(t).glip(loginUser).favoriteGroups([chat.glipId, team.glipId]);
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find favorite section expanded by default', async () => {
    await t.expect(favoritesSection.isExpand).ok();
    await t.expect(favoritesSection.collapse.clientHeight).gt(0);
  });

  await h(t).withLog('When I click the header of Favorite section', async () => {
    await t.click(favoritesSection.header);
  });

  await h(t).withLog('ThenI can find favorite section collapsed', async () => {
    await t.wait(1e3);
    await t.expect(favoritesSection.isExpand).notOk();
    await t.expect(favoritesSection.collapse.clientHeight).eql(0);
  });

  await h(t).withLog('When I click the header of Favorite section', async () => {
    await t.click(favoritesSection.header);
  });

  await h(t).withLog('ThenI can find favorite section expanded', async () => {
    await t.wait(1e3);
    await t.expect(favoritesSection.isExpand).ok();
    await t.expect(favoritesSection.collapse.clientHeight).gt(0);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-10'],
  maintainers: ['Potar.He'],
  keywords: ['ConversationList', 'FavoriteSection']
})('User can reorder the list in favorite section by drag and drop.', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[5];
  await h(t).glip(loginUser).init();

  let chat1 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[1]]
  }

  let chat2 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[2]]
  }

  let chat3 = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, users[3]]
  }

  await h(t).withLog('Given I have an extension with 3 conversations in FavoriteSection', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chat1, chat2, chat3]);
    await h(t).glip(loginUser).favoriteGroups([chat1.glipId, chat2.glipId, chat3.glipId]);
  });

  const app = new AppRoot(t);

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const favoritesSection = app.homePage.messageTab.favoritesSection;

  async function getGroupIdsByOrderInFavoriteSection() {
    const count = await favoritesSection.conversations.count;
    let ids: string[] = [];
    for (const i of _.range(count)) {
      const groupId = await favoritesSection.nthConversationEntry(i).groupId;
      ids.push(groupId);
    }
    return ids;
  }

  let chatIdsOrderBeforeDrag: string[] = [], chatIdsOrderAfterDrag: string[] = [];
  await h(t).withLog('And I record the favorite conversations order', async () => {
    chatIdsOrderBeforeDrag = await getGroupIdsByOrderInFavoriteSection();
  });

  await h(t).withLog('When I drag the last conversation and drop to first one', async () => {
    await t.dragToElement(favoritesSection.conversations.nth(-1), favoritesSection.conversations.nth(0), { speed: 0.5, offsetX: 5 });
    chatIdsOrderAfterDrag = await getGroupIdsByOrderInFavoriteSection();
  });

  function isSameOrder(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  await h(t).withLog('Then the conversations order should be changed', async () => {
    assert.ok(!isSameOrder(chatIdsOrderBeforeDrag, chatIdsOrderAfterDrag), 'conversations order is not changed');
  });


  await h(t).withLog('When loginUser logout and login again', async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
  });

  await h(t).withLog('Then the favoriteSection order should be same as order after drag', async () => {
    const currentOrders = await getGroupIdsByOrderInFavoriteSection();
    assert(isSameOrder(currentOrders, chatIdsOrderAfterDrag), "conversations in wrong order");
  });
});