/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */


import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h,H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

fixture('Send Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Enter text in the conversation input box', ['P0', 'JPT-77']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I create one new teams`, async () => {
    await h(t).platform(loginUser).createGroup({
      type: 'Team',
      name: uuid(),
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.teamsSection.expand();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  const identifier = uuid();
  const message = `${faker.lorem.sentence()} ${identifier}`;

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I can send message to this conversation', async () => {
    await conversationPage.sendMessage(message);
  });

  await h(t).withLog('And I can read this message from post list', async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(identifier).exists).ok();
  }, true);
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-89'],
  keywords: ['Send Messages'],
  maintainers: ['Mia.Cai']
})(`Check some texts that can't be send in a conversation`,  async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const app = new AppRoot(t);
  const MSG1 = ' ';
  const MSG2 = faker.random.alphaNumeric(10001);
  const TIP_MSG2 = 'A maximum of 10000 characters can be sent';
  const MSG3 = '<script>';
  const TIP_MSG3 = 'Javascript not allowed';
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I create one new teams`, async () => {
    await h(t).platform(loginUser).createGroup({
      type: 'Team',
      name: uuid(),
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.teamsSection.expand();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  await h(t).withLog('And I send message with space to the conversation', async () => {
    await conversationPage.sendMessage(MSG1);
  });

  await h(t).withLog(`Then save your input but it can't be sent`, async () => {
    await t.expect(conversationPage.nthPostItem(-1).body.withText(MSG1).exists).notOk();
    await t.typeText(conversationPage.messageInputArea, '1')
    await t.expect(inputField.textContent).eql(H.escapePostText(MSG1+'1')); // No space in the DOME when the input is space only
  }, true);

  // ctrl+enter,shift+enter
  await h(t).withLog('When I "ctrl+enter" in the conversation', async () => {
    await t.click(conversationPage.messageInputArea).pressKey('ctrl+enter')
  });

  await h(t).withLog(`Then save your input but it can't be sent`, async () => {
    await conversationPage.existBlankLine(1);
    await t.expect(conversationPage.nthPostItem(-1).body.exists).notOk();
  }, true);

  await h(t).withLog('When I enter "shift + enter" in the conversation', async () => {
    await t.click(conversationPage.messageInputArea).pressKey('shift+enter')
  });

  await h(t).withLog(`Then save your input but it can't be sent`, async () => {
    await conversationPage.existBlankLine(2);
    await t.expect(conversationPage.nthPostItem(-1).body.exists).notOk();
  }, true);

  await h(t).withLog(`When I send message with '${MSG3}' to the conversation`, async () => {
    await conversationPage.sendMessage(MSG3, { replace: true, paste: true });
  });

  await h(t).withLog(`Then prompt '${TIP_MSG3}' but it can't be sent`, async () => {
    await t.expect(inputField.textContent).contains(MSG3);
    await t.expect(conversationPage.nthPostItem(-1).body.withText(MSG3).exists).notOk();
    await t.expect(conversationPage.messageInputTips.withText(TIP_MSG3)).ok();
  }, true);

  await h(t).withLog('When I send message with more than 10000 characters to the conversation', async () => {
    await conversationPage.sendMessage(MSG2, { replace: true, paste: true });
  });

  await h(t).withLog(`Then prompt '${TIP_MSG2}' but it can't be sent`, async () => {
    await t.expect(inputField.textContent).contains(MSG2);
    await t.expect(conversationPage.nthPostItem(-1).body.withText(MSG2).exists).notOk();
    await t.expect(conversationPage.messageInputTips.withText(TIP_MSG2)).ok();
  }, true);

});

// bug id https://jira.ringcentral.com/browse/FIJI-7075
test.skip.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-420'],
  keywords: ['Send Messages'],
  maintainers: ['Mia.Cai']
})(`Click outside of the search result list or Esc keyboard can close the search list`,  async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, users[0],users[1],users[5]]
  }

  await h(t).withLog(`And I create one new teams`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.teamsSection.expand();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;

  // await h(t).withLog('And I type @ in the conversation', async () => {
  //   await conversationPage.typeAtSymbol()
  // });

  // await h(t).withLog(`Then I can see members list`, async () => {
  //   await t.expect(conversationPage.mentionUserList.self.exists).ok();
  //   await conversationPage.mentionUserList.ensureDismiss();
  // }, true);

  // Can't simulate click the outside of the members list. Potar will help to solve this problem
  // await h(t).withLog('When I click outside of the members list ', async () => {
  //   todo
  // });

  // await h(t).withLog(`Then I can't see members list`, async () => {
  //   await t.expect(conversationPage.mentionUserList.self.exists).notOk();
  // }, true);

  await h(t).withLog('When I type @ in the conversation', async () => {
    await conversationPage.typeAtSymbol()
  });

  await h(t).withLog(`Then I can see members list`, async () => {
    await t.expect(conversationPage.mentionUserList.self.exists).ok();
    await conversationPage.mentionUserList.ensureDismiss();
  }, true);

  await h(t).withLog('And I tap ESC on the keyboard ', async () => {
    await t.pressKey('ESC');
  });

  await h(t).withLog(`Then I can't see members list`, async () => {
    await t.expect(conversationPage.mentionUserList.self.exists).notOk();
  }, true);

});