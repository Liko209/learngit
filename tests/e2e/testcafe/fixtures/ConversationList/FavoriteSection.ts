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
import { SITE_URL } from '../../config';

fixture('ConversationList/FavoriteSection')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Expand & Collapse', ['JPT-6', 'P2', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[7];
  user.sdk = await h(t).getSdk(user)
  const favoritesSection = app.homePage.messageTab.favoritesSection;

  let pvtChat, team;
  await h(t).withLog(
    'Given I have an extension with a private chat and a team',
    async () => {
      pvtChat = await user.sdk.platform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId],
      });
      team = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `Team ${uuid()} `,
        members: [user.rcId, users[5].rcId],
      });
    },
  );

  await h(t).withLog(
    'Make sure the conversations are shown and marked as favorite',
    async () => {
      const profile = await user.sdk.glip.getProfile(user.rcId);
      const favorites = profile.data.favorite_group_ids || [];
      if (favorites.indexOf(+pvtChat.data.id) < 0) {
        favorites.push(+pvtChat.data.id);
      }
      if (favorites.indexOf(+team.data.id) < 0) {
        favorites.push(+team.data.id);
      }
      await user.sdk.glip.showGroups(user.rcId, [pvtChat.data.id, team.data.id]);
      await user.sdk.glip.favoriteGroups(user.rcId, favorites)
    },
  );

  await h(t).withLog(
    `When I login Jupiter with this extension: ${user.company.number}#${
    user.extension
    }`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    },
  );

  await h(t).withLog(
    'I can find favorite section expanded by default',
    async () => {
      const isExpand = await favoritesSection.isExpand();
      await t.expect(isExpand).ok();
      await t.expect(favoritesSection.collapse.clientHeight).gt(0);
    },
  );

  await h(t).withLog(
    'Then I click the header of Favorite section',
    async () => {
      await t.click(favoritesSection.toggleButton);
    },
  );

  await h(t).withLog('I can find favorite section collapsed', async () => {
    await t.wait(1e3);
    const isExpand = await favoritesSection.isExpand();
    await t.expect(isExpand).notOk();
    await t.expect(favoritesSection.collapse.clientHeight).eql(0);
  });

  await h(t).withLog(
    'Then I click the header of Favorite section',
    async () => {
      await t.click(favoritesSection.toggleButton);
    },
  );

  await h(t).withLog('I can find favorite section expanded', async () => {
    await t.wait(1e3);
    const isExpand = await favoritesSection.isExpand();
    await t.expect(isExpand).ok();
    await t.expect(favoritesSection.collapse.clientHeight).gt(0);
  });
},
);