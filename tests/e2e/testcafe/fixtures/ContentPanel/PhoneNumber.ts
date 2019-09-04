/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-22 16:05:46
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';
import { ITestMeta, IGroup } from '../../v2/models';


fixture('ContentPanel/CodeSnippet')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1802'],
  keywords: ['PhoneNumber'],
  maintainers: ['Potar.He']
})("Call is placed via RingCentral directly when login app with RC users and web phone is enabled", async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[1];
  const anotherUser = users[2]
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    type: 'Team',
    name: uuid(),
    members: [loginUser, anotherUser],
    owner: loginUser
  }

  const phoneNumberType1 = '1234567';
  const phoneNumberType2 = '+6508300756';
  const phoneNumberType3 = '1(650)830-0756';
  const phoneNumberType4 = '123456789012345';


  let taskPostId, eventPostId, notePostId, textPostId;
  await h(t).withLog(`Given I have an extension with one conversation named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I have one Task that its description contains ${phoneNumberType1}`, async () => {
    const item = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, uuid(), {
      notes: `${phoneNumberType1}test${uuid()}`
    });
    taskPostId = item.data.post_ids[0];
  });

  await h(t).withLog(`And I have one Event that its description contains ${phoneNumberType2}`, async () => {
    const item = await h(t).glip(loginUser).createSimpleEvent({
      groupIds: team.glipId,
      title: uuid(),
      description: `${phoneNumberType2}test${uuid()}`
    });
    eventPostId = item.data.post_ids[0];
  });

  await h(t).withLog(`And I have one Note that its description contains ${phoneNumberType3}`, async () => {
    const item = await h(t).glip(loginUser).createSimpleNote(team.glipId, uuid(), {
      body: `${phoneNumberType3}test${uuid()}`
    });
    notePostId = item.data.post_ids[0];
  });

  await h(t).withLog(`And I have one textPost contains ${phoneNumberType4}`, async () => {
    textPostId = await h(t).scenarioHelper.sentAndGetTextPostId(`![:Person](${loginUser.rcId})${phoneNumberType4}test${uuid()}`, team, anotherUser);
  });

  await h(t).withLog(`And I bookmark above posts`, async () => {
    await h(t).glip(loginUser).bookmarkPosts([taskPostId, eventPostId, notePostId, textPostId]);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(team.glipId).enter();
  }, true);

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`Then I can find hyperlinked ${phoneNumberType1} in the task post`, async () => {
    const postItem = conversationPage.postItemById(taskPostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType1).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType1).textContent).eql(phoneNumberType1);
  });

  await h(t).withLog(`And I can find hyperlinked ${phoneNumberType2} in the event post`, async () => {
    const postItem = conversationPage.postItemById(eventPostId);
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType2).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType2).textContent).eql(phoneNumberType2);
  });

  await h(t).withLog(`And I can not find hyperlinked ${phoneNumberType3} in the note post [FIJI-7757]`, async () => {
    const postItem = conversationPage.postItemById(notePostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType3).exists).notOk();
  });

  await h(t).withLog(`And I can find hyperlinked ${phoneNumberType4} in the text post`, async () => {
    const postItem = conversationPage.postItemById(textPostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).textContent).eql(phoneNumberType4);
  });


  await h(t).withLog(`When I click hyperlinked ${phoneNumberType1} in the task post`, async () => {
    const postItem = conversationPage.postItemById(taskPostId);
    await t.click(postItem.phoneLinkByDataId(phoneNumberType1));
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
    await telephonyDialog.ensureLoaded();
    await t.wait(5e3);
    await telephonyDialog.clickHangupButton();
    await t.wait(5e3);
  });


  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType2} in the event post`, async () => {
  //   const postItem = conversationPage.postItemById(eventPostId);
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType2));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);

  // });

  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType3} in the note post`, async () => {
  //   const postItem = conversationPage.postItemById(notePostId);
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType3));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);

  // });

  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType3} in the text post`, async () => {
  //   const postItem = conversationPage.postItemById(textPostId)
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType4));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);
  // });

  const bookmarkPage = app.homePage.messageTab.bookmarkPage;
  await h(t).withLog('When I enter Bookmark page ', async () => {
    await app.homePage.messageTab.bookmarksEntry.enter();
    await bookmarkPage.ensureLoaded();
  }, true);

  await h(t).withLog(`Then I can find hyperlinked ${phoneNumberType1} in the task post`, async () => {
    const postItem = bookmarkPage.postItemById(taskPostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType1).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType1).textContent).eql(phoneNumberType1);
  });

  await h(t).withLog(`And I can find hyperlinked ${phoneNumberType2} in the event post`, async () => {
    const postItem = bookmarkPage.postItemById(eventPostId);
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType2).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType2).textContent).eql(phoneNumberType2);
  });

  await h(t).withLog(`And I can not find hyperlinked ${phoneNumberType3} in the note post [FIJI-7757]`, async () => {
    const postItem = bookmarkPage.postItemById(notePostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType3).exists).notOk();
  });

  await h(t).withLog(`And I can find hyperlinked ${phoneNumberType4} in the text post`, async () => {
    const postItem = bookmarkPage.postItemById(textPostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).textContent).eql(phoneNumberType4);
  });


  await h(t).withLog(`When I click hyperlinked ${phoneNumberType1} in the task post`, async () => {
    const postItem = bookmarkPage.postItemById(taskPostId);
    await t.click(postItem.phoneLinkByDataId(phoneNumberType1));
  });

  await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
    await telephonyDialog.ensureLoaded();
    await t.wait(5e3);
    await telephonyDialog.clickHangupButton();
    await t.wait(5e3);
  });

  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType2} in the event post`, async () => {
  //   const postItem = bookmarkPage.postItemById(eventPostId);
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType2));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);

  // });

  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType3} in the note post`, async () => {
  //   const postItem = bookmarkPage.postItemById(notePostId);
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType3));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);

  // });

  // await h(t).withLog(`When I click hyperlinked ${phoneNumberType3} in the text post`, async () => {
  //   const postItem = bookmarkPage.postItemById(textPostId)
  //   await t.click(postItem.phoneLinkByDataId(phoneNumberType4));
  // });

  // await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
  //   await telephonyDialog.ensureLoaded();
  //   await t.wait(5e3);
  //   await telephonyDialog.clickHangupButton();
  //   await t.wait(5e3);
  // });

  const mentionPage = app.homePage.messageTab.mentionPage;
  await h(t).withLog('When I enter Mention page ', async () => {
    await app.homePage.messageTab.mentionsEntry.enter();
    await mentionPage.ensureLoaded();
  }, true);

  await h(t).withLog(`Then I can find hyperlinked ${phoneNumberType4} in the text post`, async () => {
    const postItem = mentionPage.postItemById(textPostId)
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).exists).ok();
    await t.expect(postItem.phoneLinkByDataId(phoneNumberType4).textContent).eql(phoneNumberType4);
  });

  await h(t).withLog(`When I click hyperlinked ${phoneNumberType4} in the test post`, async () => {
    const postItem = mentionPage.postItemById(textPostId);
    await t.click(postItem.phoneLinkByDataId(phoneNumberType4));
  });

  await h(t).withLog(`Then the telephony dialog should be popup`, async () => {
    await telephonyDialog.ensureLoaded();
    await t.wait(5e3);
    await telephonyDialog.clickHangupButton();
    await t.wait(5e3);
  });
});
