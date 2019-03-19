/*
 * @Author: Potar.He 
 * @Date: 2019-03-04 17:01:03 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-03-04 18:19:51
 */
import * as _ from 'lodash';
import * as assert from 'assert';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { BrandTire, SITE_URL } from '../../config'
import { IGroup } from '../../v2/models';

fixture('ActionBar/PinAndUnpin')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Click Pin option to pin a post', ['JPT-1264', 'P1', 'Pin', 'Potar.He']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4]
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  const postText = uuid();
  let postId;
  await h(t).log(`Given I have an extension "${loginUser.company.number}#${loginUser.extension}"`);
  await h(t).withLog(`And there is a team named "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And a text post "${postText}" in the team`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  const postCard = app.homePage.messageTab.conversationPage.postItemById(postId);

  await h(t).withLog(`And I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter team: "${team.name}" and hover the post`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryByName(team.name).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await t.hover(postCard.self);
  });

  await h(t).withLog(`Then I could see the pin button`, async () => {
    await t.expect(postCard.pinButton.exists).ok();
  });


  await h(t).withLog(`When I click the pin button to pin post `, async () => {
    await postCard.clickPinToggle();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`Then the post should be displayed in the pinned section on the right shelf`, async () => {
    await rightRail.pinnedEntry.enter();
    await rightRail.pinnedEntry.shouldBeOpened();
    await rightRail.pinnedTab.countInListShouldBe(1);
    await rightRail.pinnedTab.nthItem(0).shouldBePostId(postId);
    await rightRail.pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog(`And the pin button should be replaced by the unpin button`, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.pinButton.exists).notOk();
    await t.expect(postCard.unpinButton.exists).ok();
  });

});


test(formalName('Click Unpin option to unpin a post', ['JPT-1266', 'P1', 'Pin', 'Potar.He']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4]
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  const postText = uuid();
  let postId;
  await h(t).log(`Given I have an extension "${loginUser.company.number}#${loginUser.extension}"`);
  await h(t).withLog(`And there is a team named "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And a pinned text post "${postText}" in the team `, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
    await h(t).glip(loginUser).updateGroup(team.glipId, {
      "pinned_post_ids": [+postId]
    });
  });

  const app = new AppRoot(t);
  const postCard = app.homePage.messageTab.conversationPage.postItemById(postId);

  await h(t).withLog(`And I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter team: "${team.name}"`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryByName(team.name).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
  });
  
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`Then the post should be displayed in the pinned section on the right shelf`, async () => {
    await rightRail.pinnedEntry.enter();
    await rightRail.pinnedEntry.shouldBeOpened();
    await rightRail.pinnedTab.countInListShouldBe(1);
    await rightRail.pinnedTab.nthItem(0).shouldBePostId(postId);
    await rightRail.pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog(`When I hover the post`, async () => {
    await t.hover(postCard.self);
  });

  await h(t).withLog(`Then I could see the unpin button`, async () => {
    await t.expect(postCard.unpinButton.exists).ok();
  });


  await h(t).withLog(`When I click the unpin button to unpin post `, async () => {
    await postCard.clickPinToggle();
  });

  await h(t).withLog(`Then The pined item disappear from Pinned tab immediately`, async () => {
    await rightRail.pinnedEntry.enter();
    await rightRail.pinnedEntry.shouldBeOpened();
    await rightRail.pinnedTab.countInListShouldBe(0);
  });

  await h(t).withLog(`And the pin button should be replaced by the unpin button`, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.unpinButton.exists).notOk();
    await t.expect(postCard.pinButton.exists).ok();
  });

});

test(formalName('Click Pin option to pin a post', ['JPT-1337', 'P1', 'Pin', 'Potar.He']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4]
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  const postText = uuid();
  let postId;
  await h(t).log(`Given I have an extension "${loginUser.company.number}#${loginUser.extension}"`);
  await h(t).withLog(`And there is a team named "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And a text post ${postText} in the team`, async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(postText, team, loginUser);
  });

  const app = new AppRoot(t);
  const postCard = app.homePage.messageTab.conversationPage.postItemById(postId);

  await h(t).withLog(`And I login Jupiter with the extension`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter team: "${team.name}" and hover the post`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryByName(team.name).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
    await t.hover(postCard.self);
  });

  await h(t).withLog(`Then I could see the pin button`, async () => {
    await t.expect(postCard.pinButton.exists).ok();
  });


  await h(t).withLog(`When I click the pin button to pin post `, async () => {
    await postCard.clickPinToggle();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`Then the post should be displayed in the pinned section on the right shelf`, async () => {
    await rightRail.pinnedEntry.enter();
    await rightRail.pinnedEntry.shouldBeOpened();
    await rightRail.pinnedTab.countInListShouldBe(1);
    await rightRail.pinnedTab.nthItem(0).shouldBePostId(postId);
    await rightRail.pinnedTab.nthItem(0).postTextShouldBe(postText);
  });

  await h(t).withLog(`When I delete the pin post`, async () => {
    await postCard.clickMoreItemOnActionBar();
    await postCard.actionBarMoreMenu.deletePost.enter();
    await app.homePage.messageTab.deletePostModal.delete();
  });

  await h(t).withLog(`Then the pined item disappear from Pinned tab immediately`, async () => {
    await rightRail.pinnedTab.countInListShouldBe(0);
  });

});