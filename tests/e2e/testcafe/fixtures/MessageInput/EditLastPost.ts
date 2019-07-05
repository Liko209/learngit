/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright Â© RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import  * as _ from 'lodash'


fixture('Edit Messages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Type up arrow to edit previously sent message', ['P2', 'JPT-2334']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
    
  let groupId:number
  await h(t).withLog(`And I create one new teams`, async () => {
    groupId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: uuid(),
      members: [loginUser.rcId, users[5].rcId],
    });
  });
    
  const postIds=[]
  await h(t).withLog('And I send 3 posts in order via API', async () => {      
    const msgList = _.range(3).map(i => `${i} ${uuid()}`);
    for (const msg of msgList) {
        const { data: { id } } = await h(t).platform(loginUser).createPost({ text: msg }, `${groupId}`);
        postIds.push(id)
        await t.wait(1e3)
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
  await h(t).withLog('And last Editable post will be highlighted', async () => {
      await conversationPage.postItemById(postIds[2]).shouldBeHighLight();
  });
  await h(t).withLog('Then last but two post should be in edit mode', async () => {
      await t.expect(conversationPage.postItemById(postIds[2]).editTextArea.exists).ok();
      await conversationPage.sendMessage('edit')
  });
    
  await h(t).withLog('And I send another post', async () => {      
    const msg = `${4} ${uuid()}`;
    conversationPage. sendMessage(msg)
    await t.wait(1e3)
  });
    
  await h(t).withLog('When I press up arrow in keyboard', async () => {
    await conversationPage.upArrowToEditLastMsg();
  });
    
  await h(t).withLog('Then last but one post will be highlighted', async () => {
      await conversationPage.lastPostItem.shouldBeHighLight();
  });
  await h(t).withLog('Then last but one post should be in edit mode', async () => {
    await t.expect(conversationPage.lastPostItem.editTextArea.exists).ok();
  });
});
