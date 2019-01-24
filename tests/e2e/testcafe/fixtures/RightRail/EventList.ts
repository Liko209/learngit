/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 16:28:11
 * Copyright © RingCentral. All rights reserved.
 */

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('RightRail')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check the create event and display on the right rail', ['Shining', 'P1', 'JPT-843']), async t => {
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
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('And I click Event Tab', async () => {
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
    await rightRail.eventsEntry.shouldBeOpened();
  })
  // step 2 create a event
  await h(t).withLog('Then User create a event', async () => {
    await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
    await rightRail.eventsTab.waitUntilEventsItemExist();
    await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).ok();
  });
});

test(formalName('Check the create event and update event', ['Shining', 'P2', 'JPT-845']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  const eventUpdateTitle = 'New Title';
  let eventId;
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
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('And I click Event Tab', async () => {
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
    await rightRail.eventsEntry.shouldBeOpened();
  })
  // step 2 create a event
  await h(t).withLog('Then User create a event', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
    eventId = resp.data._id;
    await rightRail.eventsTab.waitUntilEventsItemExist();
    await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).ok();
  });

  // step 3 update a event
  await h(t).withLog('Then user update event title', async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      text: eventUpdateTitle,
    });
    await rightRail.eventsTab.waitUntilEventsItemExist();
    await t.expect(eventsTab.nthItem(0).withText(eventUpdateTitle).exists).ok();
  })
});

test(formalName('Check the create event and delete event', ['Shining', 'P2', 'JPT-844']), async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  let eventId;
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
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('And I click Event Tab', async () => {
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
    await rightRail.eventsEntry.shouldBeOpened();
  })
  // step 2 create a event
  await h(t).withLog('Then User create a event', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
    eventId = resp.data._id;
    await rightRail.eventsTab.waitUntilEventsItemExist();
    await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).ok();
  });

  // step 3 delete a event
  await h(t).withLog('Then user delete a event', async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      deactivated: true,
    });
    await rightRail.eventsTab.waitUntilEventsItemExist();
    await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).notOk();
  })
});

// test(formalName('Check the create event and expired event', ['Shining', 'P2', 'JPT-844']), async t => {
//   const app = new AppRoot(t);
//   const rightRail = app.homePage.messageTab.rightRail;
//   const loginUser = h(t).rcData.mainCompany.users[4];
//   const eventTitle = uuid();
//   let eventId;
//   await h(t).platform(loginUser).init();
//   await h(t).glip(loginUser).init();

//   let teamId;
//   await h(t).withLog('Given I have a team before login ', async () => {
//     teamId = await h(t).platform(loginUser).createAndGetGroupId({
//       name: uuid(),
//       type: 'Team',
//       members: [loginUser.rcId],
//     });
//   });

//   await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
//     await h(t).directLoginWithUser(SITE_URL, loginUser);
//     await app.homePage.ensureLoaded();
//     await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
//   });

//   const eventsTab = rightRail.eventsTab;
//   await h(t).withLog('And I click Event Tab', async () => {
//     await rightRail.openMore();
//     await rightRail.eventsEntry.enter();
//     await rightRail.eventsEntry.shouldBeOpened();
//   })
//   // step 2 create a event
//   await h(t).withLog('Then User create a event', async () => {
//     const resp = await h(t).glip(loginUser).createSimpleEvent(teamId, eventTitle, loginUser.rcId);
//     eventId = resp.data._id;
//     await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).ok();
//   });

//   // step 3 expired a event
//   await h(t).withLog('Then event is expired', async () => {
//     await h(t).glip(loginUser).updateEvent(eventId, {
//       start: 0,
//       end: 0,
//     });
//     await t.expect(eventsTab.nthItem(0).withText(eventTitle).exists).notOk();
//   })
// });
