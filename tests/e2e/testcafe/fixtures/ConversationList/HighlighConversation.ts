/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 14:25:44
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

import * as assert from 'assert';

fixture('ConversationList/HighlightConversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-144'],
  keywords: ['ConversationList'],
  maintainers: ['potar.he']
})('Open last conversation when login and group show in the top of conversation list', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  const directMessageSection = app.homePage.messageTab.directMessagesSection;
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  let group = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[0]]
  }

  await h(t).withLog('Given I have an extension with a group chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(group);
  });

  await h(t).withLog(`And the group chat ${group.glipId} is last group selected`, async () => {
    await h(t).glip(loginUser).setLastGroupId(group.glipId)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then the group should be opened automatically after login', async () => {
    await t.expect(h(t).href).match(new RegExp(`${group.glipId}$`));
  });

  await h(t).withLog('And the group is highlighted', async () => {
    const textStyle = await directMessageSection.conversationEntryById(group.glipId).self.find('p').style;
    await t.expect(textStyle.color).eql('rgb(255, 255, 255)');
  });

  await h(t).withLog('And the content is shown on the conversation page', async () => {
    await app.homePage.messageTab.conversationPage.groupIdShouldBe(group.glipId);
  });
});


test.meta(<ITestMeta>{
  priority: ['p2'],
  caseIds: ['JPT-143'],
  keywords: ['ConversationList'],
  maintainers: ['potar.he']
})('Highlight conversations should be kept when do anything except open any conversations', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];

  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  let chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, users[0]]
  }
  const highLightColor = 'rgb(255, 255, 255)';

  async function checkHighLight() {
    const textStyle = await firstConversation.self.find('p').style;
    assert.ok(textStyle.color == highLightColor, 'it was not highlighted');
  }

  await h(t).withLog('Given I have an extension with a chat', async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  const firstConversation = directMessagesSection.nthConversationEntry(0);
  await h(t).withLog('When I enter the first conversation of direct message section', async () => {
    await firstConversation.enter();
    await t.wait(3e3); //  send last_group_id to backend after open a conversation and 2s.
  });

  await h(t).withLog('And the group is highlighted', async () => {
    await checkHighLight();
  });

  await h(t).withLog('When I move mouse focus elsewhere', async () => {
    await app.homePage.header.hoverSelf();
  });

  await h(t).withLog('And the group is highlighted', async () => {
    await checkHighLight();
  });

  const leftRail = app.homePage.messageTab.leftRail;
  await h(t).withLog('When I Scroll the conversation list', async () => {
    const y = await leftRail.scrollDiv.scrollTop;
    await leftRail.scrollToY(50);
    await leftRail.scrollToY(y);
  });

  await h(t).withLog('And the group is highlighted', async () => {
    await checkHighLight();
  });

  await h(t).withLog('When I collapse then Expand Fav/DM/Teams section', async () => {
    await directMessagesSection.collapse();
    await directMessagesSection.expand();
  });

  await h(t).withLog('And the group is highlighted', async () => {
    await checkHighLight();
  });

  await h(t).withLog('When I Tap another app page (e.g. Tasks/Phone...) and then come back', async () => {
    await app.homePage.leftPanel.settingsEntry.enter();
    await t.wait(2e3);
    await app.homePage.leftPanel.messagesEntry.enter();
  });

  await h(t).withLog('And the group is highlighted', async () => {
    await t.wait(1e3);
    await checkHighLight();
  });
});
