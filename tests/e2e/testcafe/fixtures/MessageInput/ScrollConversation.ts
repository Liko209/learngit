/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.com)
 * @Date: 5/03/2019 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';

import {formalName} from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import {IGroup} from "../../v2/models";
import * as _ from "lodash";

fixture('Scroll Conversation')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('JPT-60 Can scroll up/down when have more than 1 page posts.', ['JPT-60', 'P0', 'ali.naffaa']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    const otherUser = users[5];
    await h(t).platform(otherUser).init();

    let postsId = [];
    let positionY;

    let team = <IGroup>{
      type: "Team",
      name: uuid(),
      owner: loginUser,
      members: [loginUser, otherUser],
    };

    await h(t).withLog('Given I have an extension with 1 dm and I team', async () => {
      await h(t).scenarioHelper.createTeamsOrChats([team]);
    });


    await h(t).withLog('And send 20 messages to conversation', async () => {
      for (let i of _.range(20)) {
        postsId.push(await h(t).platform(otherUser).sentAndGetTextPostId(i + ` post:${uuid()}`, team.glipId));
      }
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );
    const conversationPage = app.homePage.messageTab.conversationPage;
    await h(t).withLog('And Make sure current opened conversation isn\'t older team)', async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
      positionY = await conversationPage.getScrollHeight();
    });

    let res;
    await h(t).withLog('When I try to Scroll down', async () => {
      res = await conversationPage.isPossibleToScrollBottom();
    });

    await h(t).withLog('Then I cannot to scroll down', async () => {
      await t.expect(res).notOk();
    });

    await h(t).withLog('When I scroll up to the first post in \'C1\'', async () => {
      await conversationPage.scrollUpToViewPostById(postsId[0]);
      await conversationPage.scrollToTop();
    });

    await h(t).withLog('Then I see first post in \'C1\'', async () => {
      await conversationPage.postByIdExpectVisible(postsId[0],true);
    });

    await h(t).withLog('When I try to scroll up', async () => {
      res = await conversationPage.isPossibleToScrollUp();
    });

    await h(t).withLog('Then I cannot scroll up', async () => {
      await t.expect(res).notOk();
    });

    await h(t).withLog('When I scroll down', async () => {
      await conversationPage.scrollToY(positionY);
    });

    await h(t).withLog('Then I see post directly', async () => {
      await conversationPage.postByIdExpectVisible(postsId[19],true);
    });
  });
