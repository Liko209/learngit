/*
 * @Author: Konstantin Kolotov (konstantin.kolotov@ringcentral.com)
 * @Date: 2019-06-04 15:10:21
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

const moreTooltipText = 'More';

fixture('ConversationList/Tooltips')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-3119'],
  maintainers: ['Konstantin Kolotov'],
  keywords: ['ConversationList', 'Tooltips']
})('Tooltips related to conversation list', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let teamId;
  await h(t).withLog('Given I have an extension with certain team', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `Team ${uuid()}`,
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then "More" tooltip is displayed when I hover "More" menu next to the conversation entry', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    const teamEntry = teamsSection.conversationEntryById(teamId);
    await teamEntry.hoverMoreButton();
    await teamEntry.showTooltip(moreTooltipText);
  }, true);
},
);
