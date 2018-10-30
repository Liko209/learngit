/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { v4 as uuid } from 'uuid';
import { SITE_URL } from '../../config';
import { setupCase, teardownCase } from '../../init';

fixture('send messages draft')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());


test(formalName('draft', ['P0', 'JPT-139', 'Show massage draft when switching conversation']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    const userPlatform = await h(t).getPlatform(user);
    const userGlip = await h(t).getGlip(user);
    const teamSection = app.homePage.messagePanel.teamsSection;

    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog(
      'Given I have an extension with 1 private chat A and 1 group chat B',
      async () => {
        teamId1 = (await userPlatform.createGroup({
          type: 'Team',
          name: `1 ${uuid()}`,
          members: [user.rcId, users[5].rcId]
        })).data.id;
        teamId2 = (await userPlatform.createGroup({
          type: 'Team',
          name: `2 ${uuid()}`,
          members: [user.rcId, users[5].rcId, users[6].rcId]
        })).data.id;
      },
    );

    await h(t).withLog(
      'Both conversation should not be hidden before login',
      async () => {
        await userGlip.updateProfile(user.rcId, {
          [`hide_group_${teamId1}`]: false,
          [`hide_group_${teamId2}`]: false,
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
      'Then I check conversation A and B exsit',
      async () => {
        await teamSection.expand();
        conversation1 = teamSection.conversationByIdEntry(teamId1);
        conversation2 = teamSection.conversationByIdEntry(teamId2);
      },
    );

    await h(t).withLog(
      `And I enter conversation A to type message "${msg}"`,
      async () => {
        await conversation1.enter();
        const inputField = app.homePage.messagePanel.conversationPage.messageInputArea;
        await t.typeText(inputField, msg)
      },
    );

    await h(t).withLog(
      'When I enter conversation B',
      async () => {
        await conversation2.enter();
      },
    );

    await h(t).withLog(
      'Then I can find "Draft" in Conversation A name',
      async () => {
        // refactor: find a good way to get name.
        await t.expect(teamSection.conversations
          .filter(`[data-group-id="${teamId1}"]`)
          .child().withText('Draft')
          .exists)
          .ok();
      },
    );

    await h(t).withLog(
      `When I enter conversation A`,
      async () => {
        await conversation1.enter();
      }
    );

    await h(t).withLog(
      `Then I can find input field still is ${msg}`,
      async () => {
        const inputField = app.homePage.messagePanel.conversationPage.messageInputArea;
        await t.expect(inputField.textContent).eql(msg);
      }
    );
  });
