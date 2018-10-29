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
    const user = users[4];
    const userPlatform = await h(t).getPlatform(user);
    const glipSDK = await h(t).sdkHelper.sdkManager.getGlip(user);

    let pvtChat, group, conversation1, conversation2;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 group chat B',
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
        await glipSDK.updateProfile(user.rcId, {
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
      'Then I check conversation A and B exists',
      async () => {
        const directMessagesSection =
          app.homePage.messagePanel.directMessagesSection;
        await directMessagesSection.expand();
        conversation1 = directMessagesSection.conversations.filter(`[data-group-id="${pvtChat.data.id}"]`)
        conversation2 = directMessagesSection.conversations.filter(`[data-group-id="${group.data.id}"]`)
      },
    );

    await h(t).withLog(
      `And I enter conversation A to type message "${msg}"`,
      async () => {
        await t.click(conversation1)
        const inputField = app.homePage.messagePanel.conversationPage.find('.ql-editor')
        await t.typeText(inputField, msg)
      },
    );

    await h(t).withLog(
      'When I enter conversation B',
      async () => {
        await t.click(conversation2);
      },
    );

    await h(t).withLog(
      'Then I can find "Draft" in Conversation A name',
      async () => {
        await t.expect(conversation1.textContent).contains('Draft');
      },
    );

    await h(t).withLog(
      `When I enter conversation A`,
      async () => {
        await t.click(conversation1);
      }
    );

    await h(t).withLog(
      `Then I can find input field still is ${msg}`,
      async () => {
        const inputField = app.homePage.messagePanel.conversationPage.find('.ql-editor')
        await t.expect(inputField.textContent).eql(msg)
      }
    );
  });