/*
 * @Author: Ali Naffaa (ali.naffaa@ab-soft.com)
 * @Date: 5/08/2019 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { v4 as uuid } from 'uuid';
import * as assert from 'assert';
import * as moment from 'moment';

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('Event')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-296'],
  maintainers: ['Potar.He'],
  keywords: ['Event'],
})('Check the display of the Event be updated', async (t: TestController) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const otherUser = users[5];
  await h(t).glip(loginUser).init()
  await h(t).scenarioHelper.resetProfile(loginUser);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  const eventTitle = uuid();
  const color = 'red';
  const description = uuid();

  const newEventTitle = uuid();
  const newColor = 'blue';
  const newDescription = uuid();

  const location = 'xiamen';
  const start = new Date().getTime();
  const end = start + 1800000;
  const repeat = 'none';

  const newLocation = 'Beijing';
  const newEnd = end + 1800000;
  const newRepeat = 'daily';
  const repeat_ending = 'none';

  const expectRepeatInfo = 'repeating every day';

  await h(t).withLog(`Given I have 1:1 chat`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  let eventId: string, postId: string;
  await h(t).withLog(`And I create a event in it`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).createSimpleEvent({
      groupIds: chat.glipId,
      title: eventTitle,
      color,
      description,
      location,
      repeat,
      start,
      end,
    }).then(res => {
      eventId = res.data._id;
      postId = res.data.post_ids[0]
    });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And I enter the chat conversation`, async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(chat.glipId).enter();
  });

  // due time
  await h(t).withLog(`When I update title/color/description`, async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      text: newEventTitle,
      color: newColor,
      description: newDescription
    })
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const postItem = conversationPage.postItemById(postId);

  let oldDueTime: string;
  await h(t).withLog(`Then Update the old event card post with the new data`, async () => {
    await t.expect(postItem.itemCard.title.textContent).eql(newEventTitle);
    await t.expect(postItem.itemCard.eventDescription.textContent).eql(newDescription);
    // todo: color(this is a bug)
    const lastPostId = await conversationPage.lastPostItem.postId;
    assert.ok(lastPostId == postId, `there is a new event card`);
    oldDueTime = await postItem.itemCard.eventDue.textContent;
    oldDueTime = oldDueTime.trim();
  });

  let newPostId;
  await h(t).withLog(`When I update due end time of event`, async () => {
    await h(t).glip(loginUser).updateEvent(eventId, { end: newEnd }).then(res => {
      const mentionPostIds: any[] = res.data.at_mentioning_post_ids;
      newPostId = mentionPostIds[mentionPostIds.length - 1];
    });
    assert.ok(newPostId != postId, `there is a new event card`);
  });

  let newPostItem = conversationPage.postItemById(newPostId);
  let newDueTime: string;
  await h(t).withLog(`Then Receive a new post display the update event card`, async () => {
    await newPostItem.ensureLoaded();
    // here need automation id of new event card due time
    // newDueTime = await postItem.itemCard.eventDue.textContent;
  });

  await h(t).withLog(`And Has a "Show old" button in the update event card`, async () => {
    await t.expect(newPostItem.itemCard.eventShowOrHideOld.textContent).eql('Show old');
  });

  await h(t).withLog(`And Update the old event post with the new data`, async () => {
    await t.expect(postItem.itemCard.eventDue.withText(oldDueTime).exists).notOk();
    // here need automation id of new event card due time
    // await t.expect(postItem.itemCard.eventDue.textContent).eql(newDueTime);
  });

  await h(t).withLog(`When I click 'Show old' button`, async () => {
    await t.click(newPostItem.itemCard.eventShowOrHideOld);
  });

  await h(t).withLog(`And Display the old data before update`, async () => {
    await t.expect(newPostItem.itemCard.eventOldDue.withText(oldDueTime).exists).ok(oldDueTime);
  });

  // location
  await h(t).withLog(`When I update new location of event`, async () => {
    await h(t).glip(loginUser).updateEvent(eventId, { location: newLocation }).then(res => {
      const mentionPostIds: any[] = res.data.at_mentioning_post_ids;
      newPostId = mentionPostIds[mentionPostIds.length - 1];
    });
    assert.ok(newPostId != postId, `there is a new event card`);
  });

  newPostItem = conversationPage.postItemById(newPostId);
  await h(t).withLog(`Then Receive a new post display the update event card`, async () => {
    await newPostItem.ensureLoaded();
  });

  await h(t).withLog(`And Has a "Show old" button in the update event card`, async () => {
    await t.expect(newPostItem.itemCard.eventShowOrHideOld.textContent).eql('Show old');
  });

  await h(t).withLog(`And Update the old event post with the new data`, async () => {
    await t.expect(postItem.itemCard.eventLocation.textContent).eql(newLocation);
  });

  await h(t).withLog(`When I click 'Show old' button`, async () => {
    await t.click(newPostItem.itemCard.eventShowOrHideOld);
  });

  await h(t).withLog(`And Display the old data before update`, async () => {
    await t.expect(postItem.itemCard.eventLocation.textContent).eql(newLocation);
  });

  // repeat 
  await h(t).withLog(`When I update due end time of event`, async () => {
    oldDueTime = await postItem.itemCard.eventDue.textContent;
    oldDueTime = oldDueTime.trim();
    await h(t).glip(loginUser).updateEvent(eventId, { repeat: newRepeat, repeat_ending }).then(res => {
      const mentionPostIds: any[] = res.data.at_mentioning_post_ids;
      newPostId = mentionPostIds[mentionPostIds.length - 1];
    });
    assert.ok(newPostId != postId, `there is a new event card`);
  });

  newPostItem = conversationPage.postItemById(newPostId);
  await h(t).withLog(`Then Receive a new post display the update event card`, async () => {
    await newPostItem.ensureLoaded();
    // here need automation id of new event card due time
    // await t.expect(newPostItem.itemCard.eventDue.withText(expectRepeatInfo).exists).ok();
  });

  await h(t).withLog(`And Has a "Show old" button in the update event card`, async () => {
    await t.expect(newPostItem.itemCard.eventShowOrHideOld.textContent).eql('Show old');
  });

  await h(t).withLog(`And should Update the old event post with the new data`, async () => {
    await t.expect(postItem.itemCard.eventDue.withText(expectRepeatInfo).exists).ok();
  });

  await h(t).withLog(`When I click 'Show old' button`, async () => {
    await t.click(newPostItem.itemCard.eventShowOrHideOld);
  });

  await h(t).withLog(`And Display the old data before update`, async () => {
    await t.expect(newPostItem.itemCard.eventOldDue.withText(oldDueTime).exists).ok(oldDueTime);
  });
});