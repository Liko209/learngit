/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('ConversationList/LeftRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P0'],
  caseIds: ['JPT-2'],
  maintainers: ['Chris.Zhan'],
  keywords: ['DefaultView']
})('The default view of conversation list.', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('The I can find the conversation sections in correct order', async () => {
    const order = ['Favorites', 'Direct Messages', 'Teams'];
    const sections = app.homePage.messageTab.sections;
    for (let i = 0; i < order.length; i++) {
      await t.expect(sections.nth(i).getAttribute('data-name')).eql(order[i]);
      await t.expect(sections.nth(i).find(`[data-test-automation-id="conversation-list-section-header"]`).textContent).eql(order[i]);
    }
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-3'],
  maintainers: ['potar.he'],
  keywords: ['DefaultView', 'highCost']
})('For new user, Me conversation and All hands displayed by default.', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  let myName: string;
  let meConversationName: string;
  let meConversationId: string;
  let allHandsTeamId: string;
  await h(t).withLog('Given I have a new account (via resetGlipAccount)', async () => {
    await h(t).resetGlipAccount(loginUser);
    await h(t).glip(loginUser).init();
    myName = await h(t).glip(loginUser).getPersonPartialData('display_name');
    meConversationName = `${myName} (me)`;
    meConversationId = await h(t).glip(loginUser).getMeChatId();
    allHandsTeamId = await h(t).glip(loginUser).getCompanyTeamId();
  });

  await h(t).withLog(`When I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const meConversation = app.homePage.messageTab.favoritesSection.conversationEntryByName(meConversationName);
  await h(t).withLog('The I can find Me conversation {name} favorite section.', async (step) => {
    step.setMetadata('name', meConversationName)
    await meConversation.ensureLoaded();
    await meConversation.groupIdShouldBe(meConversationId);
  });

  const allHandsTeam = app.homePage.messageTab.teamsSection.conversationEntryById(allHandsTeamId);
  await h(t).withLog('The I can find All hands team {teamName} in Check team section', async (step) => {
    await allHandsTeam.ensureLoaded();
    const allHandsTeamName = await allHandsTeam.name;
    step.setMetadata('teamName', allHandsTeamName)
  });
},
);
