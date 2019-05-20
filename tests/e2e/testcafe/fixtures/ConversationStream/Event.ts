/*
* @Author: Sherwin.Su
* @Date: 2019-05-16 18:40:37
* Copyright © RingCentral. All rights reserved.
*/

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import * as uuid from 'uuid';

fixture('ConversationStream/Event')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());
test(formalName(`Check the display of the Event in the conversation stream`, ['P2', 'JPT-262', 'Sherwin.Su']), async t => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const app = new AppRoot(t);

  const title = "testEvent";
  const location = "testLocation";
  const description = "testDescription";
  const color = "red";

  await h(t).log(`Given I have an extension ${loginUser.company.number}#${loginUser.extension}`);

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`And I have a team named:${team.name} `, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  //let eventId;
  const startTime = new Date().getTime() + 1800000;
  const startTimeHours = new Date(startTime).getHours() % 12 == 0 ? 12 : new Date(startTime).getHours() % 12;
  const startTimeMinutes = new Date(startTime).getMinutes() < 10 ? '0' + new Date(startTime).getMinutes() : new Date(startTime).getMinutes();
  const startTimeAmpm = new Date(startTime).getHours() >= 12 ? 'PM' : 'AM';

  const endTime = new Date().getTime() + 3600000;
  const endTimeHours = new Date(endTime).getHours() % 12 == 0 ? 12 : new Date(endTime).getHours() % 12;
  const endTimeMinutes = new Date(endTime).getMinutes() < 10 ? '0' + new Date(endTime).getMinutes() : new Date(endTime).getMinutes();
  const endTimeAmpm = new Date(endTime).getHours() >= 12 ? 'PM' : 'AM';

  const dueTime = startTimeHours + ":" + startTimeMinutes + " " + startTimeAmpm + " - " + endTimeHours + ":" + endTimeMinutes + " " + endTimeAmpm;
  await h(t).withLog(`And the team has a event (title, location, description)`, async () => {
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: team.glipId,
      title,
      location,
      description
    }, {
        color,
      });
    postId = res.data['post_ids'][0]
    //eventId = res.data['_id'];
  });

  await h(t).withLog(`And I login with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And check the display of the Event in the conversation stream`, async () => {
    // Check Event icon(with color)、Event title(with color)、Due time with repeat、Location、Description
    const eventIconStyle = await conversationPage.postItemById(postId).eventIcon.style;
    const eventTitleStyle = await conversationPage.postItemById(postId).eventTitle.style;
    // Check Event icon(with color)
    await t.expect(eventIconStyle['color']).eql("rgb(255, 55, 55)");
    // Check Event title(with color)
    await t.expect(eventTitleStyle['color']).eql("rgb(255, 55, 55)");
    await t.expect(conversationPage.postItemById(postId).eventTitle.textContent).eql(`${title}`);
    // Check Location
    await t.expect(conversationPage.postItemById(postId).eventLocation.textContent).eql(`${location}`);
    // Check Description(todo: automation id)
    // Check Due time with repeat
    await t.expect(conversationPage.postItemById(postId).eventDue.textContent).contains(`${dueTime}`);
  });
});

