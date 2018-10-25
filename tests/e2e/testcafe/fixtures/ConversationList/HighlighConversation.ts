/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 14:25:44
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { ClientFunction } from 'testcafe';

fixture('HighlightConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('Open last conversation when login', [
    'JPT-144',
    'P2',
    'ConversationList',
  ]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
    const glipSDK = await h(t).sdkHelper.sdkManager.getGlip(user);
    const directMessageSection =
      app.homePage.messagePanel.directMessagesSection;

    let group;
    await h(t).withLog(
      'Given I have an extension with a group chat',
      async () => {
        group = await userPlatform.createGroup({
          type: 'Group',
          members: [user.rcId, users[5].rcId, users[6].rcId],
        });
      },
    );

    await h(t).withLog(
      'And the conversation should not be hidden',
      async () => {
        await glipSDK.updateProfileByGlipId(user.glipId, {
          [`hide_group_${group.data.id}`]: false,
        });
      },
    );

    await h(t).withLog(
      'Given the group chat is last group selected',
      async () => {
        await glipSDK.updateStateByGlipId(user.glipId, {
          last_group_id: group.data.id,
        });
      },
    );

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog(
      'Then the group should be opened automatically after login',
      async () => {
        await t.expect(h(t).href).match(new RegExp(`${group.data.id}$`));
      },
    );

    await h(t).withLog('And the group is highlighted', async () => {
      const textStyle = await directMessageSection.conversations
        .filter(`[data-group-id="${group.data.id}"]`)
        .find('p').style;
      await t.expect(textStyle.color).eql('rgb(6, 132, 189)');
    });

    await h(t).withLog(
      'And the content is shown on the conversation page',
      async () => {
        await t
          .expect(
            app.homePage.messagePanel.conversationPage.withAttribute(
              'data-group-id',
              group.data.id,
            ).exists,
          )
          .ok();
      },
    );
  },
);
