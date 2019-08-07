import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ContentPanel/JumpToUnreadButton')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2559'],
  maintainers: ['Cerrie.shen'],
  keywords: ['recentButton']
})('Should not display recent button ', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And there is not recent/most recent button`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).notOk()
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2575'],
  maintainers: ['Cerrie.shen'],
  keywords: ['recentButton']
})('Show jump to most recent button after unread button disappear ', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And conversationA has unread messages', async () => {
    const msgList = _.range(5).map(i => H.multilineString(20, `No. ${i}`, uuid()));
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, team, otherUser);
    }
  })

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button and without most recent button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).notOk()
  });

  await h(t).withLog('When I scroll to top', async () => {
    await conversationPage.scrollToTop();
  });

  await h(t).withLog(`And show jump recent button`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).ok()
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2594'],
  maintainers: ['Cerrie.shen'],
  keywords: ['recentButton']
})('Show jump to most recent button over 2000 pixel ', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And conversationA has unread messages', async () => {
    const msgList = _.range(5).map(i => H.multilineString(Math.round(80 / (i + 1)), `No. ${i}`, uuid()));
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, team, otherUser);
    }
  })

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  }, true);

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button and without most recent button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).notOk()
  });

  await h(t).withLog('When I click jump to first unread button', async () => {
    await conversationPage.clickJumpToFirstUnreadButton();
  });

  await h(t).withLog(`And show jump recent button`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I click jump to most recent button', async () => {
    await conversationPage.clickJumpToMostRecentButton();
  });

  await h(t).withLog('And I jump to bottom', async () => {
    await conversationPage.expectStreamScrollToBottom();
  });
});



test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2615', 'JPT-2616'],
  maintainers: ['Cerrie.shen'],
  keywords: ['recentButton']
})('Keep jump to most recent button after scroll and scroll to bottom disappear automatically', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const otherUser = users[5];

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have an extension with one conversation named ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('And conversationA has unread messages', async () => {
    const msgList = _.range(5).map(i => H.multilineString(Math.round(80 / (i + 1)), `No. ${i}`, uuid()));
    for (const msg of msgList) {
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, team, otherUser);
    }
  })

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  }, true);

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I should see unread button and without most recent button', async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).notOk()
  });

  await h(t).withLog('When I scroll to top', async () => {
    await conversationPage.scrollToTop();
    await conversationPage.expectStreamScrollToY(0);
  });

  await h(t).withLog(`And show jump recent button`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I scroll down', async () => {
    await conversationPage.scrollToY(100);
    await conversationPage.expectStreamScrollToY(100);
  });

  await h(t).withLog(`Keep jump recent button`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).ok()
  });

  await h(t).withLog('When I scroll to bottom ', async () => {
    await conversationPage.scrollToBottom();
    await conversationPage.expectStreamScrollToBottom();
  });

  await h(t).withLog(`Jump recent button disappear`, async () => {
    await t.expect(conversationPage.jumpToFirstUnreadButtonWrapper.exists).notOk();
    await t.expect(conversationPage.jumpToMostRecentButtonWrapper.exists).notOk()
  });
});
