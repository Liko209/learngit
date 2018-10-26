/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { AppRoot } from "../v2/page-models/AppRoot";
import { SITE_URL } from '../config';

fixture('Demo').skip
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Sign In Success', ['P0', 'SignIn', 'demo']), async (t) => {

  // every test case should start with following lines
  const user = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  // using Given-When-Then statements to write report
  await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  }, true);

  await h(t).withLog('Then I can toggle left panel', async () => {
    await app.homePage.leftPanel.expand();
    await app.homePage.leftPanel.fold();
    await app.homePage.leftPanel.expand();
  });

  await h(t).withLog('And I can open add action menu', async () => {
    await app.homePage.openAddActionMenu();
    await t.wait(1e3);
    await app.homePage.addActionMenu.createTeamEntry.enter();
    await t.wait(1e3);
    await app.homePage.createTeamModal.clickCancelButton();
  });

  await h(t).withLog('And I can navigate every entry in left panel', async () => {
    await app.homePage.leftPanel.dashboardEntry.enter();
    await app.homePage.leftPanel.messagesEntry.enter();
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.leftPanel.meetingsEntry.enter();
    await app.homePage.leftPanel.contactsEntry.enter();
    await app.homePage.leftPanel.calendarEntry.enter();
    await app.homePage.leftPanel.tasksEntry.enter();
    await app.homePage.leftPanel.notesEntry.enter();
    await app.homePage.leftPanel.filesEntry.enter();
    await app.homePage.leftPanel.settingsEntry.enter();
  });

  await h(t).withLog('And I can toggle every section in message panel', async () => {
    await app.homePage.leftPanel.messagesEntry.enter();
    console.log(await app.homePage.leftPanel.messagesEntry.getUmi());
    await app.homePage.messagePanel.favoritesSection.expand();
    await app.homePage.messagePanel.favoritesSection.fold();
    await app.homePage.messagePanel.favoritesSection.expand();
    await app.homePage.messagePanel.favoritesSection.fold();
    await app.homePage.messagePanel.teamsSection.expand();
    await app.homePage.messagePanel.teamsSection.fold();
    await app.homePage.messagePanel.teamsSection.expand();
    await app.homePage.messagePanel.teamsSection.fold();
    await app.homePage.messagePanel.directMessagesSection.expand();
    await app.homePage.messagePanel.directMessagesSection.fold();
    await app.homePage.messagePanel.directMessagesSection.expand();
    await app.homePage.messagePanel.directMessagesSection.fold();
  });

  await h(t).withLog('When I expand teams sections', async () => {
    await app.homePage.messagePanel.teamsSection.expand();
  })

  await h(t).withLog('Then I can read attributes of every conversation in teams section', async () => {
    await h(t).waitUntilNotEmpty(app.homePage.messagePanel.teamsSection.conversations);
    await h(t).mapSelectorsAsync(app.homePage.messagePanel.teamsSection.conversations, async (item, i) => {
      console.log(await item.attributes);
    });
  });

  await h(t).withLog('When I enter first conversation in teams section', async () => {
    await app.homePage.messagePanel.teamsSection.nthConversationEntry(0).openMoreMenu();
    await t.wait(1e3);
    if (await app.homePage.messagePanel.moreMenu.close.exists) {
      await app.homePage.messagePanel.moreMenu.close.enter();
      await t.wait(1e3);
      await app.homePage.messagePanel.closeConversationModal.confirm();
    }
    await app.homePage.messagePanel.teamsSection.nthConversationEntry(0).enter();
  });

  await h(t).withLog('Then I can read all posts in first teams section', async () => {
    await t.wait(1e3);
    await h(t).mapSelectorsAsync(app.homePage.messagePanel.conversationSection.posts, async (post, i) => {
      console.log(await post.attributes);
    });
  });

  await h(t).withLog('And I can enter every conversation in teams section', async () => {
    const conversationsCount = await app.homePage.messagePanel.teamsSection.conversations.count;
    for (let i = 0; i < conversationsCount; i++) {
      console.log(await app.homePage.messagePanel.teamsSection.nthConversationEntry(i).getUmi());
      await app.homePage.messagePanel.teamsSection.nthConversationEntry(i).enter();
    }
  });

});
