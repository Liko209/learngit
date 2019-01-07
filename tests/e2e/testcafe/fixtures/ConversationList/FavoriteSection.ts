/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 16:15:52
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/FavoriteSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Expand & Collapse', ['JPT-6', 'P2', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let pvtChatId, teamId;
  await h(t).withLog('Given I have an extension with a private chat and a team', async () => {
    pvtChatId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `Team ${uuid()} `,
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('Make sure the conversations are shown and marked as favorite', async () => {
    const profile = await h(t).glip(loginUser).getProfile(loginUser.rcId);
    const favorites = profile.data.favorite_group_ids || [];
    if (favorites.indexOf(+pvtChatId) < 0) {
      favorites.push(+pvtChatId);
    }
    if (favorites.indexOf(+teamId) < 0) {
      favorites.push(+teamId);
    }
    await h(t).glip(loginUser).showGroups(loginUser.rcId, [pvtChatId, teamId]);
    await h(t).glip(loginUser).favoriteGroups(loginUser.rcId, favorites)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('I can find favorite section expanded by default', async () => {
    await t.expect(favoritesSection.isExpand).ok();
    await t.expect(favoritesSection.collapse.clientHeight).gt(0);
  });

  await h(t).withLog('Then I click the header of Favorite section', async () => {
    await t.click(favoritesSection.toggleButton);
  });

  await h(t).withLog('I can find favorite section collapsed', async () => {
    await t.wait(1e3);
    await t.expect(favoritesSection.isExpand).notOk();
    await t.expect(favoritesSection.collapse.clientHeight).eql(0);
  });

  await h(t).withLog('Then I click the header of Favorite section', async () => {
    await t.click(favoritesSection.toggleButton);
  });

  await h(t).withLog('I can find favorite section expanded', async () => {
    await t.wait(1e3);
    await t.expect(favoritesSection.isExpand).ok();
    await t.expect(favoritesSection.collapse.clientHeight).gt(0);
  });
});