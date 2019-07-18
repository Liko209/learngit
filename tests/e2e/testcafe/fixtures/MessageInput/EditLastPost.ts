/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright Â© RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';

import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import * as _ from 'lodash'
import { ITestMeta, IGroup } from '../../v2/models';


fixture('Edit Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2334'],
  keywords: ['Edit Messages'],
  maintainers: ['Andy.Hu', 'Potar.He']
})('Check Type up arrow to edit previously sent message', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I create one new team name: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const postIds = []
  await h(t).withLog('And I send 3 posts in order via API', async () => {
    const msgList = _.range(3).map(i => `${i} ${uuid()}`);
    for (const msg of msgList) {
      const { data: { id } } = await h(t).platform(loginUser).createPost({ text: msg }, team.glipId);
      postIds.push(id);
      await t.wait(1e3);
    }
  });

  await h(t).withLog('And I enter the conversation', async () => {
    await app.homePage.messageTab.teamsSection.expand();
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And I send an image without text`, async () => {
    await conversationPage.uploadFilesToMessageAttachment('../../sources/1.png');
    await conversationPage.pressEnterWhenFocusOnMessageInputArea();
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });
  await h(t).withLog('When I press up arrow in keyboard', async () => {
    await conversationPage.upArrowToEditLastMsg();
  });

  await h(t).withLog('Then last Editable post will be highlighted', async () => {
    await conversationPage.postItemById(postIds[2]).shouldBeHighLight();
  });

  await h(t).withLog('Then last Editable post should be in edit mode', async () => {
    await t.expect(conversationPage.postItemById(postIds[2]).editTextArea.exists).ok();
  });

  await h(t).withLog('When I quit edit mode and send another post', async () => {
    await conversationPage.postItemById(postIds[2]).editMessage('-edit');
    await t.wait(1e3);
    const msg = `${4} ${uuid()}`;
    await conversationPage.sendMessage(msg);
    await conversationPage.lastPostItem.waitForPostToSend();
  });

  await h(t).withLog('When I press up arrow in keyboard', async () => {
    await conversationPage.upArrowToEditLastMsg();
  });

  await h(t).withLog('Then last post will be highlighted', async () => {
    await conversationPage.lastPostItem.shouldBeHighLight();
  });

  await h(t).withLog('Then last post should be in edit mode', async () => {
    await t.expect(conversationPage.lastPostItem.editTextArea.exists).ok();
  });
});
