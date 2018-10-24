/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 17:16:38
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { GlipSdk } from '../../v2/sdk/glip';

fixture('ConversationList/LeftRail')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('Sections Order', ['P0', 'JPT-2', 'LeftRail']),
  async (t: TestController) => {
    // await directLogin(t)
    //   .shouldNavigateTo(LeftRail)
    //   .log('check leftRail section order')
    //   .checkSectionsOrder('Favorites', 'Direct Messages', 'Teams'); // 'Unread', 'Mentions', 'Bookmarks',
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    await h(t).withLog(
      `When I login Jupiter with this extension: ${user.company.number}#${
        user.extension
      }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
  },
);
