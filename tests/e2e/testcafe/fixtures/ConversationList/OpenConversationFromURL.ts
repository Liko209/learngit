/*
 * @Author: Potar (Potar.He@ringcentral.com)
 * @Date: 2018-01-16 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import * as uuid from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
test(formalName('Should keep its position in the conversation list and NOT be moved to the top of the list when the conversation exists in the left list', ['P2', 'JPT-872', 'Potar.He', 'ConversationList',]),
async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users
  const loginUser = users[4];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfile();

  await h(t).withLog(`Given I have at least two Team conversation and Two DirectMessage conversation`, async () => {
    await h(t).platform(loginUser).createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[6].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[6].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );
  
  const teamSection = app.homePage.messageTab.teamsSection;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  let secondTeamId,secondTeamName, secondDirectMessageChatId;
  await h(t).withLog('Then I can get second TeamId,secondTeamName, secondDirectMessageChatId', async () => {
    secondTeamId = await teamSection.nthConversationEntry(1).groupId;
    secondTeamName = await teamSection.nthConversationEntry(1).name;
    secondDirectMessageChatId = await directMessagesSection.nthConversationEntry(1).groupId;
  });


},
);