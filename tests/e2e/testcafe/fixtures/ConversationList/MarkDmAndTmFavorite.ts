/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.net)
 * @Date: 2019-03-28 10:15:52
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';

fixture('ConversationList/MarkDmAndTmFavorite')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('The \'Favorites\' section should displays all conversations be marked as \'Favorite\'', ['JPT-7', 'P2', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const favoritesSection = app.homePage.messageTab.favoritesSection;
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let directMessage;
  let team;
  await h(t).withLog('Given I have an extension with a private chat and a team', async () => {
    const otherUser = users[5];
    await h(t).platform(otherUser).init();
    directMessage = <IGroup>{
      type: 'DirectMessage',
      owner: loginUser,
      members: [loginUser, otherUser],
    };
    team = <IGroup>{
      type: 'Team',
      name: uuid(),
      owner: loginUser,
      members: [loginUser, otherUser],
    };
  });

  await h(t).withLog('Make sure the conversations are shown and marked as favorite', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([directMessage, team]);
    await h(t).glip(loginUser).favoriteGroups([+directMessage.glipId, +team.glipId]);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`I can find Team conversation: ${team.name} is in Favorite section`, async () => {
    await t.expect(favoritesSection.conversationEntryById(team.glipId).exists).ok();
    await t.expect(favoritesSection.conversationEntryByName(team.name).exists).ok();
  });

  await h(t).withLog(`I can find Direct Message conversation id: ${directMessage.glipId} is in Favorite section`, async () => {
    await t.expect(favoritesSection.conversationEntryById(directMessage.glipId).exists).ok();
  });
});
