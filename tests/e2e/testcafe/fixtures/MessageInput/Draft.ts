/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { SITE_URL } from '../../config';
import { setupCase, teardownCase } from '../../init';

fixture('send messages draft')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('draft', ['P0', 'JPT-139', 'Show massage draft when switching conversation']), 
async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const user = users[1];
  const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
  const glipSDK = await h(t).sdkHelper.sdkManager.getGlip(user);

  let pvtChat, group, conversation1, conversation2;
  await h(t).withLog(
    'Given I have an extension with 1 private chat and 1 group chat',
    async () => {
      pvtChat = await userPlatform.createGroup({
        type: 'PrivateChat',
        members: [user.rcId, users[5].rcId],
      });
      group = await userPlatform.createGroup({
        type: 'Group',
        members: [user.rcId, users[5].rcId, users[6].rcId],
      });
    },
  );

  await h(t).withLog(
    'Both conversation should not be hidden before login',
    async () => {
      await glipSDK.updateProfileByGlipId(user.glipId, {
        [`hide_group_${pvtChat.data.id}`]: false,
        [`hide_group_${group.data.id}`]: false,
      });
    },
  );


  const msg = `${Date.now()}`; // Have a trap, no spaces
  await h(t).withLog(
    `When I login Jupiter with this extension: ${user.company.number}#${
      user.extension
    }`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    },
  );

  await h(t).withLog(
    `select A conversation, input typing message ${msg}`,
    async () => {
      const directMessagesSection =
        app.homePage.messagePanel.directMessagesSection;
      await directMessagesSection.expand();
      conversation1 = directMessagesSection.conversations.filter(`[data-group-id="${pvtChat.data.id}"]`)
      conversation2 = directMessagesSection.conversations.filter(`[data-group-id="${group.data.id}"]`)
      await t.click(conversation1)
      const inputField = app.homePage.messagePanel.conversationPage.find('.ql-editor')
      await t.typeText(inputField, msg)
    },
    true,
  );

  await h(t).withLog(
    'select B conversation, expect A conversation name has "Draft"',
    async () => {
      await t.click(conversation2);
      await t.expect(conversation1.textContent).contains('Draft');
    },
    true,
  );

  await h(t).withLog(
    `select A conversation, check input field has ${msg}`,
    async () => {
      await t.click(conversation1);
      const inputField = app.homePage.messagePanel.conversationPage.find('.ql-editor')
      await t.expect(inputField.textContent).contains(msg)
    },
    true,
  );
});