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
import { Http2ServerRequest } from 'http2';

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
  })

  await app.homePage.ensureLoaded();

  await app.homePage.leftPanel.expand();
  await app.homePage.leftPanel.fold();
  await app.homePage.leftPanel.expand();

  await app.homePage.leftPanel.meetingsEntry.enter();
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

  console.log(await app.homePage.messagePanel.favoritesSection.items());

  await h(t).mapSelectorsAsync(app.homePage.messagePanel.directMessagesSection.items, async (item, i) => {
    console.log(await item.attributes);
  });

});
