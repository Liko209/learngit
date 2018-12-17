/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';

fixture('DirectMessageSection')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Show the 1:1 conversation and group conversation in the Direct Message section', ['JPT-5', 'P2', 'ConversationList']), 
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    user.sdk = await h(t).getSdk(user);

    let chat, group;
    await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat', async () => {
      chat = await user.sdk.platform.createGroup({
        type: 'PrivateChat', members: [user.rcId, users[5].rcId],
      });
      group = await user.sdk.platform.createGroup({
        type: 'Group', members: [user.rcId, users[5].rcId, users[6].rcId],
      });
      await user.sdk.glip.showGroups(user.rcId, [chat.data.id, group.data.id]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then I can find 1 private chat and 1 group chat in direct messages section', async () => {
      const directMessagesSection = app.homePage.messageTab.directMessagesSection;
      await directMessagesSection.expand();
      await t.expect(directMessagesSection.conversationEntryById(chat.data.id).exists).ok()
      await t.expect(directMessagesSection.conversationEntryById(group.data.id).exists).ok()
    }, true);
  });