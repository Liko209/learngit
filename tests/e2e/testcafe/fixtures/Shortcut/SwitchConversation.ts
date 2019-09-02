/*
 * @Author: Mia Cai (mia.cai@ringcentral.com)
 * @Date: 2019-08-27 17:10:29
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';
import { ClientFunction } from 'testcafe';
import { UAParser } from 'ua-parser-js';


fixture('Shortcut/SwitchConversation')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

let shortcuts;
const getUA = ClientFunction(() => navigator.userAgent);
test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2848'],
  maintainers: ['Mia.cai'],
  keywords: ['SwitchConversation']
})(`Should jump to correct conversation in switch conversation`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const uaParser = new UAParser(await getUA());
  const osName = uaParser.getOS().name;
  // should consider os (command/ctrl + k)
  if(osName.indexOf('Mac') >= 0){
    shortcuts = 'meta+k';
  }else{
    shortcuts = 'ctrl+k';
  }
  let team01 = <IGroup>{
    type: "Team",
    name: 'team01_'+uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team02 = <IGroup>{
    type: "Team",
    name: 'team02_'+uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  const app = new AppRoot(t);
  const recentConversationDialog = app.homePage.recentConversationDialog;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I have 2 teams: team01/team02`, async () => {
    await h(t).scenarioHelper.createTeam(team01);
    await h(t).scenarioHelper.createTeam(team02);
  });

  await h(t).withLog(`When I press ${shortcuts}`, async () => {
    await t.pressKey(shortcuts);
  });
  await h(t).withLog(`Then show the recent conversation dialog`, async () => {
    await recentConversationDialog.ensureLoaded();
  });

  await h(t).withLog(`When I select the conversation team01`, async () => {
    await recentConversationDialog.clickConversationWithName(team01.name);
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team01.name);
  });

  // Search one conversation to open the conversation
  await h(t).withLog(`When I press ${shortcuts}`, async () => {
    await t.pressKey(shortcuts);
  });
  await h(t).withLog(`Then show the recent conversation dialog`, async () => {
    await recentConversationDialog.ensureLoaded();
  });

  await h(t).withLog(`When I search the conversation ${team02.name}`, async () => {
    await recentConversationDialog.enterNameInSearchBox(team02.name);
  });
  await h(t).withLog(`Then show clear button`, async () => {
    await recentConversationDialog.existClearButton();
  });

  await h(t).withLog(`When I click the clear button`, async () => {
    await recentConversationDialog.clickClearButton();
  });
  await h(t).withLog(`Then back to the previous list`, async () => {
    await recentConversationDialog.existConversationInList(team01.name);
  });

  await h(t).withLog(`When I search the conversation ${team02.name}`, async () => {
    await recentConversationDialog.enterNameInSearchBox(team02.name);
  });
  await h(t).withLog(`And I select the conversation ${team02.name}`, async () => {
    await recentConversationDialog.clickConversationWithName(team02.name);
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team02.name);
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2804','JPT-2792'],
  maintainers: ['Mia.cai'],
  keywords: ['SwitchConversation']
})(`Open dialog should reset search box;User can select a conversation and jump the conversation via keyboard`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const uaParser = new UAParser(await getUA());
  const osName = uaParser.getOS().name;
  // should consider os (command/ctrl + k)
  if(osName.indexOf('Mac') >= 0){
    shortcuts = 'meta+k';
  }else{
    shortcuts = 'ctrl+k';
  }
  let team01 = <IGroup>{
    type: "Team",
    name: 'team01_'+uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team02 = <IGroup>{
    type: "Team",
    name: 'team02_'+uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  const app = new AppRoot(t);
  const recentConversationDialog = app.homePage.recentConversationDialog;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I have 2 teams: team01/team02`, async () => {
    await h(t).scenarioHelper.createTeam(team01);
    await h(t).scenarioHelper.createTeam(team02);
  });

  //case JPT-2804
  await h(t).withLog(`When I press ${shortcuts}`, async () => {
    await t.pressKey(shortcuts);
  });
  await h(t).withLog(`Then show the recent conversation dialog`, async () => {
    await recentConversationDialog.ensureLoaded();
  });

  await h(t).withLog(`When I enter 'team01'  in the search box`, async () => {
    await recentConversationDialog.enterNameInSearchBox('team01');
  });
  await h(t).withLog(`And I close the dialog`, async () => {
    await recentConversationDialog.clickCloseButton();
    await recentConversationDialog.ensureDismiss();
  });
  await h(t).withLog(`And I press ${shortcuts} to open the dialog again`, async () => {
    await t.pressKey(shortcuts);
    await recentConversationDialog.ensureLoaded();
  });
  await h(t).withLog(`Then search box content should reset`, async () => {
    await t.expect(recentConversationDialog.searchBoxInput.getAttribute('value')).eql('');
  });

  //case JPT-2792
  await h(t).withLog(`When I enter down arrow via keyboard`, async () => {
    await t.pressKey('down');
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team01.name);
  });

  await h(t).withLog(`When I press ${shortcuts} to open the dialog again`, async () => {
    await t.pressKey(shortcuts);
    await recentConversationDialog.ensureLoaded();
  });
  await h(t).withLog(`And I click up arrow via keyboard`, async () => {
    await t.pressKey('down');
    await t.pressKey('up')
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team02.name);
  });

});

