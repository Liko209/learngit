/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 16:28:11
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail/EventList')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('New event will show under Events tab', ['Shining', 'P1', 'JPT-843', 'EventList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create a event
  await h(t).withLog('When User create a event', async () => {
    await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
  });

  await h(t).withLog('Then The new events shows under Events tab immediately', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.countInListShouldBe(1);
    // await rightRail.eventsTab.countOnSubTitleShouldBe(1);
    await eventsTab.nthItemTitleShouldBe(0, eventTitle);
  });
});

test(formalName('Event info will sync immediately when update', ['Shining', 'P2', 'JPT-845', 'EventList']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  const eventUpdateTitle = 'New Title';

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let eventId, teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create a event
  await h(t).withLog('When User create a event', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
    eventId = resp.data._id;
  });

  await h(t).withLog('Then The new events shows under Events tab immediately', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await eventsTab.nthItemTitleShouldBe(0, eventTitle);
  });

  // step 3 update a event
  await h(t).withLog('When user update event title', async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      text: eventUpdateTitle,
    });
  })

  await h(t).withLog(`Then All event's elements are updated immediately`, async () => {
    await eventsTab.nthItemTitleShouldBe(0, eventUpdateTitle);
    await rightRail.eventsTab.countInListShouldBe(1);
  });
});

test(formalName('Deleted event will NOT show under Events tab', ['Shining', 'P2', 'JPT-844']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let eventId, teamId;
  await h(t).withLog('Given I have a team before login ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create 2 event
  await h(t).withLog('When User create Event A and Event B', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
    eventId = resp.data._id;
    await h(t).glip(loginUser).createSimpleEvent(teamId, uuid(), loginUser.rcId);
  });

  await h(t).withLog('Then The new events shows under Events tab immediately', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.shouldHasTitle(eventTitle);
    await rightRail.eventsTab.countInListShouldBe(2);
    // await rightRail.eventsTab.countOnSubTitleShouldBe(2);
  });

  // step 3 delete a event
  await h(t).withLog('When user delete Event A', async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      deactivated: true,
    });
  });

  await h(t).withLog(`Then The 'Event A' is removed from Events tab immediately`, async () => {
    await rightRail.eventsTab.shouldHasNoTitle(eventTitle);
    await rightRail.eventsTab.countInListShouldBe(1);
    // await rightRail.eventsTab.countOnSubTitleShouldBe(1);
  });
});
