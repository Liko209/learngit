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

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2848'],
  maintainers: ['Mia.cai'],
  keywords: ['SwitchConversation']
})(`Should jump to correct conversation in switch conversation`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  let shortcuts;
  const getUA = ClientFunction(() => navigator.userAgent);
  const uaParser = new UAParser(await getUA());
  const osName = uaParser.getOS().name;
  // should consider os (command/ctrl + k)
  if(osName.indexOf('Mac') >= 0){
    shortcuts = 'ctrl+k';
  }else{
    shortcuts = 'command+k';
  }
  let team01 = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team02 = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  const app = new AppRoot(t);
  const recentConversationDialog = app.homePage.recentConversationDialog;

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I have a team named: ${team01.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team01);
    await h(t).scenarioHelper.createTeam(team02);
  });

  await h(t).withLog(`And I press ${shortcuts}`, async () => {
    await recentConversationDialog.openRecentConversationDialogWithShortcuts(shortcuts);
  });
  await h(t).withLog(`Then show the recent conversation dialog`, async () => {
    await recentConversationDialog.ensureLoaded();
  });

  await h(t).withLog(`When I select one conversation`, async () => {
    await recentConversationDialog.clickConversationWithName(team01.name);
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team01.name);
  });

  // todo search one conversation to open the conversation
  // search team02
  await h(t).withLog(`And I press ${shortcuts}`, async () => {
    await recentConversationDialog.openRecentConversationDialogWithShortcuts(shortcuts);
  });
  await h(t).withLog(`Then show the recent conversation dialog`, async () => {
    await recentConversationDialog.ensureLoaded();
  });

  await h(t).withLog(`When I search one conversation ${team02.name}`, async () => {
    await recentConversationDialog.enterNameInSearchBox(team02.name);
  });

  await h(t).withLog(`When I select the conversation ${team02.name}`, async () => {
    await recentConversationDialog.clickConversationWithName(team02.name);
  });
  await h(t).withLog(`And I click enter`, async () => {
    await recentConversationDialog.clickEnter();
  });
  await h(t).withLog(`Then jump to the conversation`, async () => {
    await app.homePage.messageTab.conversationPage.titleShouldBe(team02.name);
  });

});


