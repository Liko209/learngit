/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../libs/filter';
import { h } from '../v2/helpers'
import { setupCase, teardownCase } from '../init';
import { SITE_URL } from '../config';
import { AppRoot } from "../v2/page-models/AppRoot";

fixture('Demo')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Sign In Success', ['P0', 'SignIn', 'demo']), async (t) => {

  // every test case should start with following to line
  const user = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  // using Given-When-Then statements to write report
  await h(t).logAsync(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).logAsync('Then I can toggle left panel', async () => {
    await app.homePage.leftPanel.expand();
    await app.homePage.leftPanel.fold();
    await app.homePage.leftPanel.expand();
  });

  await h(t).logAsync('Then I can navigate each entry in left panel', async () => {
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

  await h(t).logAsync('Then I can toggle each section in message panel', async () => {
    await app.homePage.leftPanel.messagesEntry.enter();
    await app.homePage.messagePanel.favoritesSection.expand();
    await app.homePage.messagePanel.favoritesSection.fold();
    await app.homePage.messagePanel.favoritesSection.expand();
    await app.homePage.messagePanel.teamsSection.expand();
    await app.homePage.messagePanel.teamsSection.fold();
    await app.homePage.messagePanel.teamsSection.expand();
    await app.homePage.messagePanel.directMessagesSection.expand();
    await app.homePage.messagePanel.directMessagesSection.fold();
    await app.homePage.messagePanel.directMessagesSection.expand();
  });

  // print attributes of conversions in directMessagesSection
  await h(t).mapSelectorsAsync(app.homePage.messagePanel.directMessagesSection.conversations, async (item, i) => {
    console.log(await item.attributes);
  });

  // navigate each conversations
  const conversationsCount = await app.homePage.messagePanel.directMessagesSection.conversations.count;
  for (let i = 0; i < conversationsCount; i++) {
    await app.homePage.messagePanel.directMessagesSection.enterNthConversation(i);
  }

  // print attributes of posts in a specific conversation
  await h(t).mapSelectorsAsync(app.homePage.messagePanel.conversationSection.posts, async (post, i) => {
    console.log(await post.attributes);
  });

});
