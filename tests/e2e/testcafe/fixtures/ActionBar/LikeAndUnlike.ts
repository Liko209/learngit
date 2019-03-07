/*
 * @Author: Potar He (potar.he@ringcentral.com)
 * @Date: 2018-12-18 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import * as assert from 'assert';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { BrandTire, SITE_URL } from '../../config'
import { IGroup } from '../../v2/models';

fixture('ActionBar/LikeAndUnlike')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Operating a message that you first like then unlike', ['JPT-304', 'P2', 'Like', 'Potar.He']), async (t) => {
  const users = h(t).rcData.mainCompany.users
  const userA = users[4];
  const userB = users[5];
  const app = new AppRoot(t);
  await h(t).glip(userB).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    members: [userA, userB],
    owner: userA
  }

  let postId;
  let currentNumber = 0;
  await h(t).withLog(`Given I one team named: "${team.name}" and one message in it`, async () => {
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, userA);
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const postCard = conversationPage.postItemById(postId);

  await h(t).withLog(`And I login extension with useA: ${userA.company.number}#${userA.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, userA);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the team ${team.name} and hover the message`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await t.hover(postCard.self);
  });

  await h(t).withLog(`Then Appear action bar and there have hollow "like" icon `, async () => {
    await t.hover(postCard.likeToggleOnActionBar);
  });

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 1;
  });

  await h(t).withLog(`Then action bar 'like' icon change to solid 'unlike', and message card appear solid "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.unlikeIconOnActionBar.exists).ok();
    await t.expect(postCard.unlikeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB check the message with like number should be ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click solid 'unlike' icon on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 0;
  });

  await h(t).withLog(`Then Action bar solid "unlike" icon change to hollow "like" icon and like number should be ${currentNumber} on message card `, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeIconOnActionBar.exists).ok();
    await t.expect(postCard.likeButtonOnFooter.exists).notOk();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 1;
  });

  await h(t).withLog(`Then action bar 'like' icon change to solid 'unlike', and message card appear solid "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.unlikeIconOnActionBar.exists).ok();
    await t.expect(postCard.unlikeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB  check the message with like number should be ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click solid 'unlike' icon on message card`, async () => {
    await postCard.clickLikeButtonOnFooter();
    currentNumber = 0;
  });

  await h(t).withLog(`Then Action bar solid "unlike" icon change to hollow "like" icon and like number should be ${currentNumber} on message card`, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeIconOnActionBar.exists).ok();
    await t.expect(postCard.likeButtonOnFooter.exists).notOk();
    await postCard.likeShouldBe(currentNumber);
  });;

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });
});

test(formalName('Like a message that you not first like then unlike', ['JPT-308', 'P2', 'Like', 'Potar.He']), async (t) => {
  const users = h(t).rcData.mainCompany.users
  const userA = users[4];
  const userB = users[5];
  const userC = users[6];

  const app = new AppRoot(t);
  await h(t).glip(userB).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    members: [userA, userB, userC],
    owner: userA
  }

  let postId, currentNumber;
  await h(t).withLog(`Given I one team named: "${team.name}" and one message (userC like it) in it`, async () => {
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, userA);
    await h(t).scenarioHelper.likePost(postId, userC);
    currentNumber = 1;
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const postCard = conversationPage.postItemById(postId);

  await h(t).withLog(`And I login extension with useA: ${userA.company.number}#${userA.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, userA);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the team ${team.name} and hover the post`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await t.hover(postCard.self);
  });

  await h(t).withLog(`Then Appear action bar and there have hollow "like" icon And like number should be ${currentNumber} on message card`, async () => {
    await t.hover(postCard.likeToggleOnActionBar);
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 2;
  });

  await h(t).withLog(`Then action bar and message card hollow 'like' icon change to solid 'unlike', and message card appear solid "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.unlikeIconOnActionBar.exists).ok();
    await t.expect(postCard.unlikeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB check the message with like number should be ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click solid 'unlike' icon on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 1;
  });

  await h(t).withLog(`Then Action bar and message card solid "unlike" icon change to hollow "like" icon and like number should be ${currentNumber} on message card `, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeIconOnActionBar.exists).ok();
    await t.expect(postCard.likeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 2;
  });

  await h(t).withLog(`Then action bar and message card 'like' icon change to solid 'unlike', and message card appear solid "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.unlikeIconOnActionBar.exists).ok();
    await t.expect(postCard.unlikeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB  check the message with like number should be ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click solid 'unlike' icon on message card`, async () => {
    await postCard.clickLikeButtonOnFooter();
    currentNumber = 1;
  });

  await h(t).withLog(`Then Action bar and message card solid "unlike" icon change to hollow "like" icon and like number should be ${currentNumber} on message card`, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeIconOnActionBar.exists).ok();
    await t.expect(postCard.likeIconOnFooter.exists).ok();
    await postCard.likeShouldBe(currentNumber);
  });;

  await h(t).withLog(`and userB check like number should be ${currentNumber} on the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });
});