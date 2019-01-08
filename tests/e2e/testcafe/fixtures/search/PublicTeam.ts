/*
 * @Author: Potar He (Potar.He@ringcentral.com)
 * @Date: 2019-01-07 16:15:43
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('PublicTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName(`Display Join button for public team which login user doesn't join in search result.`, ['P2', 'JPT-703', 'PubilcTeam', 'Potar.He']), async t => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  await h(t).platform(otherUser).init();
  await h(t).glip(otherUser).init()
  const otherUserName = await h(t).glip(otherUser).getPerson(otherUser.rcId)
    .then(res => res.data.display_name);

  const publicTeamName = uuid();
  const joinedTeamName = uuid();

  let publicTeamId, joinedTeamId;
  await h(t).withLog('Given I have a public team A but loginUser did not join it, team B (loginUser joined),and some group', async () => {
    publicTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: publicTeamName,
      type: 'Team',
      members: [otherUser.rcId],
    });

    joinedTeamId = await h(t).platform(otherUser).createAndGetGroupId({
      isPublic: true,
      name: joinedTeamName,
      type: 'Team',
      members: [otherUser.rcId, loginUser.rcId],
    });

    await h(t).platform(otherUser).createGroup({
      type: 'Group',
      members: [loginUser.rcId, otherUser.rcId],
    });

    await h(t).platform(otherUser).createGroup({
      type: 'Group',
      members: [otherUser.rcId,],
    });
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;

  await h(t).withLog(`When I search and hover the public team A ${publicTeamName}`, async () => {
    await search.typeText(publicTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(publicTeamId).self);
  });

  await h(t).withLog(`Then the join button should be showed `, async () => {
    await search.itemEntryByCid(publicTeamId).shouldHasJoinButton();
  })

  await h(t).withLog(`When I search and hover the joined team B ${joinedTeamName}`, async () => {
    await search.typeText(joinedTeamName, { replace: true, paste: true });
    await t.hover(search.itemEntryByCid(joinedTeamId).self);
  });

  await h(t).withLog(`Then the join button should not be showed `, async () => {
    await search.itemEntryByCid(joinedTeamId).shouldNotHasJoinButton();
  });

  const steps = async () => {
    
  }

  await h(t).withLog(`When I search and hover the people ${otherUserName}`, async () => {
    await search.typeText(otherUserName, { replace: true, paste: true });
  });

  await h(t).withLog(`Then the join button should not be showed `, async () => {
    await search.itemEntryByCid(publicTeamId).shouldNotHasJoinButton();
  });

});