/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-25 16:12:08
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';
import { setupCase, teardownCase } from '../../init';
import { IGroup } from '../../v2/models';


fixture('MessageInput/markupTips')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check markup tips for new message field', ['P2', 'JPT-2379']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    let team = <IGroup>{
      type: "Team",
      name: uuid(),
      owner: loginUser,
      members: [loginUser, otherUser],
    };

    let conversation;

    await h(t).withLog('Given I have an extension with 1 team', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([team]);
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    const msg = uuid();
    const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
    await h(t).withLog(`And I enter conversation 1 to type message`, async () => {
      conversation = teamSection.conversationEntryById(team.glipId)
      await conversation.enter();
      await t.typeText(inputField, msg)
    }, true);

    await h(t).withLog(`Then I can see markupTips displayed under messageInputArea`, async () => {
      const markupTips = app.homePage.messageTab.conversationPage.markupTips;
      await t.expect(markupTips.exists).ok({ timeout: 10e3 });
    }, true);

    await h(t).withLog(`And I clear input in messageInputArea`, async () => {
      await t.selectText(inputField).pressKey('delete');
    }, true);

    await h(t).withLog(`Then I can see no markupTips under messageInputArea`, async () => {
      const markupTips = app.homePage.messageTab.conversationPage.markupTips;
      await t.expect(markupTips.exists).notOk({ timeout: 10e3 });
    }, true);
  })
