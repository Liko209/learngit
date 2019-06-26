/*
*
* @Author: Alexander Zaverukha (alexander.zaverukha@ab-soft.com)
* @Date: 5/29/2019 12:23:34
* Copyright © RingCentral. All rights reserved.
*/

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import * as uuid from 'uuid';

fixture('ConversationList/UMI')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST, true))
  .afterEach(teardownCase());

// skip due to removeGuest api not exactly remove guest.
test.skip.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1052'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['ConversationList', 'UMI']
})('Can update the UMI of section after being removed by different company contact', async (t: TestController) => {
  const loginUser = h(t).rcData.mainCompany.users[5];
  const anotherUser = h(t).rcData.mainCompany.users[6];

  const guest = h(t).rcData.guestCompany.users[0];

  await h(t).glip(loginUser).init();

  await h(t).scenarioHelper.resetProfileAndState(guest);

  const chatWithGuest = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, guest],
  };

  const chatWithAnother = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, anotherUser],
  };


  await h(t).withLog('Given User A is a guest for User B(The first post is sent from B to A)', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([chatWithGuest, chatWithAnother]);
    await h(t).scenarioHelper.sendTextPost(uuid(), chatWithAnother, anotherUser);
    await h(t).scenarioHelper.sendTextPost(uuid(), chatWithAnother, anotherUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter as User A(guest) with ${loginUser.company.number}#${loginUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  await h(t).withLog(`And I collapses the DM section and Team section`, async () => {
    await directMessagesSection.fold();
  });

  let countOfDMUmi = 2;
  let countOfMessagesUmi = 2;

  await h(t).withLog('And User A: The umi of DM section is n(n>=2)', async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(countOfDMUmi);
  });

  await h(t).withLog('And User A: The UMI of navigation panel Messages is m(m>=n)', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(countOfMessagesUmi)
  });


  await h(t).withLog(`When User B send a new message to User A (guest) with ${guest.company.number}#${guest.extension} `, async () => {
    await h(t).scenarioHelper.sendTextPost(`post: ${uuid()}`, chatWithGuest, guest);
  });

  await h(t).withLog(`Then User A: The UMI of DM section is n + 1: ${countOfDMUmi + 1}`, async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(countOfDMUmi + 1);
  });

  await h(t).withLog('And User A: The UMI of navigation panel Messages is m +1', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(countOfMessagesUmi + 1)
  });

  await h(t).withLog(`When User B  remove the guest of User A: ${guest.rcId}`, async () => {
    await h(t).glip(loginUser).removeGuest(guest.rcId);
  });

  await h(t).withLog(`Then User A: The UMI of DM section is n`, async () => {
    await directMessagesSection.headerUmi.shouldBeNumber(countOfDMUmi);
  });

  await h(t).withLog('And User A: The UMI of navigation panel Messages is m', async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(countOfMessagesUmi)
  });

});
