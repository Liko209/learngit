/*
* @Author: Sherwin.Su
* @Date: 2019-05-16 18:40:37
* Copyright © RingCentral. All rights reserved.
*/

import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import * as uuid from 'uuid';
import * as moment from 'moment';
import * as assert from 'assert';

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
  const startTime = new Date().getTime() + 1800000;
  const endTime = new Date().getTime() + 3600000;

  const utcOffset = await H.getUtcOffset();

  const format = "h:mm A";
  const a = moment(startTime).utcOffset(-utcOffset).format(format);
  const b = moment(endTime).utcOffset(-utcOffset).format(format);
  const dueTime = `${a} - ${b}`;

  await h(t).withLog(`And the team has a event (title, location, description)`, async () => {
    await h(t).glip(loginUser).init();
    const res = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: team.glipId,
      title,
      start: startTime,
      end: endTime,
      location,
      description,
      color
    });
    postId = res.data['post_ids'][0]
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
    await H.retryUntilPass(async () => {
      const eventIconStyle = await conversationPage.postItemById(postId).itemCard.eventIcon.find('svg').style;
      const eventTitleStyle = await conversationPage.postItemById(postId).itemCard.title.style;
      assert.ok(eventIconStyle['fill'] == "rgb(255, 55, 55)", "icon color is not correct");
      assert.ok(eventTitleStyle['color'] == "rgb(255, 55, 55)", "title color is not correct");
      await t.expect(conversationPage.postItemById(postId).itemCard.title.textContent).eql(title);
      await t.expect(conversationPage.postItemById(postId).itemCard.eventLocation.textContent).eql(location);
      await t.expect(conversationPage.postItemById(postId).itemCard.eventDue.textContent).contains(dueTime);
      await t.expect(conversationPage.postItemById(postId).itemCard.eventDescription.textContent).eql(description);
    });
  });
});

