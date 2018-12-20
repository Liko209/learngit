/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/LeftRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('The default view of conversation list.', ['P0', 'JPT-2', 'Chris.Zhan', 'DefaultView',]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('The I can find the conversation sections in correct order', async () => {
      const order = ['Favorites', 'Direct Messages', 'Teams'];
      for (let i = 0; i < order.length; i++) {
        await t
          .expect(app.homePage.messageTab.conversationListSections.nth(i).getAttribute('data-name'))
          .eql(order[i]);
      }
    });
  },
);
