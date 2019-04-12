/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-30 15:28:36
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as uuid from 'uuid';

fixture('ContentPanel/PageHeader')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.skip(formalName('When update custom status, can sync dynamically in page header', ['JPT-252', 'P2', 'ConversationStream',]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const otherUser = users[5];
    await h(t).glip(otherUser).init();

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    let chatId;
    await h(t).withLog('Given I have an extension with a private chat with user5', async () => {
      chatId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat',
        members: [loginUser.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('Given user5 have custom status "In a meeting"', async () => {
      await h(t).glip(otherUser).updatePerson({ away_status: 'In a meeting' });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I open the private chat with user5', async () => {
      await directMessagesSection.conversationEntryById(chatId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    // fail here due to known backend bug: https://jira.ringcentral.com/browse/FIJI-1032
    await h(t).withLog('Then I should find the custom status right after the user name on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).contains('In a meeting');
    });

    await h(t).withLog('Then I modify user5\'s custom status to "content of user modify"', async () => {
      await h(t).glip(otherUser).updatePerson({
        away_status: 'content of user modify',
      });
    });

    await h(t).withLog('Then I should find the custom status right after the user name on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).contains('content of user modify');
    }, true);

    await h(t).withLog("Then I delete user5's custom status", async () => {
      await h(t).glip(otherUser).updatePerson({
        away_status: null,
      });
    });

    await h(t).withLog('Then I should not find the custom status on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).notContains('content of user modify');
    }, true);
  },
);


test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ['JPT-1368'],
  maintainers: ['Potar.He'],
  keywords: ['PageHeader']
})('Check user can clicking the icon(with count) to open the team/group profile', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, users[0]],
  }
  let group = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[0], users[1]]
  }


  let chatId;
  await h(t).withLog('Given I have an extension with 1 group and 1 team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  });

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I enter the group conversation and click Click the member count icon(with count) on page header ', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.clickMemberCountIcon();
  }, true);

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog("Then profile dialog should be opened", async () => {
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('And I close the profile dialog', async () => {
    await profileDialog.clickCloseButton()
  }, true);

  await h(t).withLog('When I enter the team conversation and click Click the member count icon(with count) on page header ', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.clickMemberCountIcon();
  }, true);

  await h(t).withLog("Then profile dialog should be opened", async () => {
    await profileDialog.ensureLoaded();
  });
});