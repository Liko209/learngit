/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 16:28:11
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as moment from 'moment';

fixture('RightRail/EventList')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-843'],
  keywords: ['Event', 'EventList'],
  maintainers: ['Shining', 'Potar.He']
})('New event will show under Events tab', async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [loginUser],
    owner: loginUser
  }

  await h(t).withLog(`Given I have a team named : ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create a event
  await h(t).withLog('When User create a event', async () => {
    await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitle });
  });

  await h(t).withLog('Then The new events shows under Events tab immediately', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.countInListShouldBe(1);
    // await rightRail.eventsTab.countOnSubTitleShouldBe(1);
    await eventsTab.nthItemTitleShouldBe(0, eventTitle);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-845'],
  keywords: ['Event', 'EventList'],
  maintainers: ['Shining', 'Potar.He']
})('Event info will sync immediately when update', async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();
  const eventUpdateTitle = 'New Title';

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();


  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [loginUser],
    owner: loginUser
  }

  await h(t).withLog(`Given I have a team named : ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create a event
  let eventId;
  await h(t).withLog('When User create a event', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitle });
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

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-844'],
  keywords: ['Event', 'EventList'],
  maintainers: ['Shining', 'Potar.He']
})('Deleted event will NOT show under Events tab', async t => {
  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [loginUser],
    owner: loginUser
  }

  await h(t).withLog(`Given I have a team named : ${team.name} before login`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  // step 2 create 2 event
  let eventId;
  await h(t).withLog('When User create Event A and Event B', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitle });
    eventId = resp.data._id;
    await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: uuid() });
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


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-847'],
  maintainers: ['Allen.Lian'],
  keywords: ['Event', 'RightRail']
})('Display of the event list view', async t => {

  const app = new AppRoot(t);
  const rightRail = app.homePage.messageTab.rightRail;
  const loginUser = h(t).rcData.mainCompany.users[4];
  const eventTitle = uuid();

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have a team before login ', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const eventsTab = rightRail.eventsTab;
  await h(t).withLog('When I enter a conversation and I click Event Tab', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then Event Tab should be opened', async () => {
    await rightRail.eventsEntry.shouldBeOpened();
  });

  let startTime = '';
  await h(t).withLog('When User create an event', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitle, rcIds: loginUser.rcId });
    const eventStartTime = resp.data.start;
    const time = moment(eventStartTime);
    startTime = `${time.format('l')} ${time.format('LT')}`;
  });


  await h(t).withLog('Then The new events shows under Events tab immediately', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.shouldHasTitle(eventTitle);
    await rightRail.eventsTab.shouldHasEventTime(startTime);
    await rightRail.eventsTab.shouldHasEventIcon;
  });

});

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-964'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['Event', 'RightRail'],
})('Expired event will NOT show under Events tab', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).scenarioHelper.resetProfileAndState(loginUser);
  let eventTitles = ['Event A', 'Event B', 'Event C'];

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  };

  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const now = new Date().getTime();
  let event = null;
  await h(t).withLog('And create events \'Event A\', \'Event B\', \'Event C\' in this team', async () => {
    await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitles[0], rcIds: loginUser.rcId });
    const startDate = moment(now).subtract(1, 'days').valueOf();
    const endDate = moment(now).valueOf();
    event = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitles[1], rcIds: loginUser.rcId, start: startDate, end: endDate });
    await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: eventTitles[2], rcIds: loginUser.rcId });
  });

  await h(t).withLog(`And I login Jupiter as User A: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog('When I open a team with events', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await rightRail.openMore();
    await rightRail.eventsEntry.enter();
  });

  await h(t).withLog('Then the 3 events should exist in rightRail', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.countInListShouldBe(3);
    for (const title of eventTitles) {
      await rightRail.eventsTab.shouldHasTitle(title);
    }
  });

  await h(t).withLog(`When the \'Event B\' expired (via update event start and end time) -> Refresh screen`, async () => {
    const expiredStartDate = moment(now).subtract(1, 'days').subtract(10, 'minutes').valueOf();
    const expiredEndDate = moment(now).subtract(1, 'days').valueOf();
    await h(t).glip(loginUser).updateEvent(event.data._id, { start: expiredStartDate, end: expiredEndDate });
    await h(t).reload();
    await app.homePage.ensureLoaded();
    await rightRail.eventsTab.ensureLoaded(30e3);
  });

  await h(t).withLog('Then the \'Event B\' is removed from Events tab', async () => {
    await rightRail.eventsTab.waitUntilItemsListExist();
    await rightRail.eventsTab.countInListShouldBe(2);
    const expiredEventTitle = eventTitles.splice(1, 1);
    await rightRail.eventsTab.shouldHasNoTitle(expiredEventTitle[0]);
    for (const title of eventTitles) {
      await rightRail.eventsTab.shouldHasTitle(title);
    }
  });
});
