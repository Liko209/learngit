/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-30 15:28:36
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ContentPanel/PageHeader')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test.skip(
  formalName('When update custom status, can sync dynamically in page header', [
    'JPT-252',
    'P2',
    'ConversationStream',
  ]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[4];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const user5Glip = await h(t).getGlip(users[5]);
    const directMessagesSection =
      app.homePage.messageTab.directMessagesSection;

    let chat;
    await h(t).withLog(
      'Given I have an extension with a private chat with user5',
      async () => {
        chat = await userPlatform.createGroup({
          type: 'PrivateChat',
          members: [user.rcId, users[5].rcId],
        });
      },
    );

    await h(t).withLog(
      'And the conversations should not be hidden before login',
      async () => {
        await userGlip.showGroups(user.rcId, chat.data.id);
      },
    );

    await h(t).withLog(
      'Given user5 have custom status "In a meeting"',
      async () => {
        await user5Glip.updatePerson(null, { away_status: 'In a meeting' });
      },
    );

    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
        user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I open the private chat with user5', async () => {
      await t.click(
        directMessagesSection.conversations.filter(
          `[data-group-id="${chat.data.id}"]`,
        ),
      );
      await t.wait(1e3);
    });

    // fail here due to known backend bug: https://jira.ringcentral.com/browse/FIJI-1032
    await h(t).withLog(
      'Then I should find the custom status right after the user name on the page header',
      async () => {
        await t
          .expect(
            app.homePage.messageTab.conversationPage.header.find(
              '[data-test-automation-id="conversation-page-header-status"]',
            ).textContent,
          )
          .contains('In a meeting');
      },
    );

    await h(t).withLog(
      'Then I modify user5\'s custom status to "content of user modify"',
      async () => {
        await user5Glip.updatePerson(null, {
          away_status: 'content of user modify',
        });
      },
    );

    await h(t).withLog(
      'Then I should find the custom status right after the user name on the page header',
      async () => {
        await t
          .expect(
            app.homePage.messageTab.conversationPage.header.find(
              '[data-test-automation-id="conversation-page-header-status"]',
            ).textContent,
          )
          .contains('content of user modify');
      },
      true,
    );

    await h(t).withLog("Then I delete user5's custom status", async () => {
      await user5Glip.updatePerson(null, {
        away_status: null,
      });
    });

    await h(t).withLog(
      'Then I should not find the custom status on the page header',
      async () => {
        await t
          .expect(
            app.homePage.messageTab.conversationPage.header.find(
              '[data-test-automation-id="conversation-page-header-status"]',
            ).textContent,
          )
          .notContains('content of user modify');
      },
      true,
    );
  },
);
