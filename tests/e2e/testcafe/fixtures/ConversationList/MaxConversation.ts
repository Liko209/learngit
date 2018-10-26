/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 22:02:08
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { GlipSdk } from '../../v2/sdk/glip';

fixture('ConversationList/maxConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('maxConversation', ['JPT-57', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const MAX_NUMBER = 20;
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).sdkHelper.sdkManager.getPlatform(user);
    const teamsSection = app.homePage.messagePanel.teamsSection;

    await h(t).withLog(
      'Given I have an extension with at least on team',
      async () => {
        await userPlatform.createGroup({
          type: 'Team',
          name: 'My Team',
          members: [user.rcId, users[5].rcId],
        });
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
    let initialCount;
    await h(t).withLog(
      'I will count the team items in Team Section',
      async () => {
        initialCount = await teamsSection.conversations.count;
      },
    );

    const newTeamIds = [];
    await h(t).withLog(
      `Initially there are ${initialCount} teams. Then I creat ${MAX_NUMBER} new teams`,
      async () => {
        for (let i = 0; i < MAX_NUMBER; i++) {
          const newTeam = await userPlatform.createGroup({
            type: 'Team',
            name: `MAX ${Date.now()}`,
            members: [user.rcId, users[5].rcId],
          });

          newTeamIds.push(newTeam.data.id);
        }
      },
    );

    await h(t).withLog(
      'All new teams should be found in the team section',
      async () => {
        for (let i = 0; i < MAX_NUMBER; i++) {
          await t
            .expect(
              teamsSection.conversations.filter(
                `[data-group-id="${newTeamIds[i]}"]`,
              ).exists,
            )
            .ok();
        }
      },
    );

    await h(t).withLog(
      `Max conversation count should be exceeded, total number should be ${MAX_NUMBER +
      initialCount}`,
      async () => {
        const count = await teamsSection.conversations.count;
        await t.expect(count).eql(MAX_NUMBER + initialCount);
      },
    );
  },
);
