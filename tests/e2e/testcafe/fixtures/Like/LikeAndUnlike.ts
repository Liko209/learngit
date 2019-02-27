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

fixture('LikeAndUnlike')
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
  await h(t).withLog(`Given I one team named: "${team.name}" and one post M1 in it`, async () => {
    await h(t).scenarioHelper.createTeam(team);
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(uuid(), team, userA);
  });

  const conversationPage = app.homePage.messageTab.conversationPage
  const postCard = conversationPage.postItemById(postId);

  await h(t).withLog(`And I login extension with useA: ${userA.company.number}#${userA.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, userA);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I open the team ${team.name} and hover the post`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await t.hover(postCard.self)
  });

  await h(t).withLog(`Then Appear action bar and there have hollow "like" icon `, async () => {
    await t.hover(postCard.likeToggleOnActionBar);
     await postCard.showTooltip('Like')
  });

  let currentNumber = 0;
  await h(t).withLog(`and userB check no one like the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on M1 action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 1
  });

  await h(t).withLog(`Then M1 action bar 'like' icon change to bold 'unlike', and M1 card footer appear bold "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup');
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB check the message with like number ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click bold 'unlike' icon on action bar`, async () => {
    await postCard.clickLikeOnActionBar();
    currentNumber = 0
  });

  await h(t).withLog(`Then Action bar bold "unlike" icon change to hollow "like" icon and no like or unlike on M1 footer `, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`and userB check no one like the message via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click hollow "like" button on M1 action bar`, async () => {
   await postCard.clickLikeOnActionBar();
   currentNumber = 1
  });

  await h(t).withLog(`Then M1 action bar 'like' icon change to bold 'unlike', and M1 card footer appear bold "unlike" icon with number ${currentNumber}`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup');
    await postCard.likeShouldBe(currentNumber);
  });

  await h(t).withLog(`And userB  check the message with like number ${currentNumber} via Api`, async () => {
    await H.retryUntilPass(async () => {
      const likeCount = await h(t).glip(userB).getPostLikesCount(postId);
      assert.deepStrictEqual(currentNumber, likeCount, `likeCount expect ${currentNumber}, actual ${likeCount}`);
    });
  });

  await h(t).withLog(`When userA click bold 'unlike' icon on footer`, async () => {
    await postCard.clickLikeButtonOnFooter();
    currentNumber = 0
  });

  await h(t).withLog(`Then Action bar bold "unlike" icon change to hollow "like" icon and no like or unlike on M1 footer`, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(currentNumber);
  });;

  await h(t).withLog(`and userB check no one like the message via Api`, async () => {
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

  const app = new AppRoot(t);

  let teamId, postId;
  await h(t).withLog(`Given I 1 team chat (T1) have members userA(${userA.company.number}#${userA.extension}) and userB(${userB.company.number}#${userB.extension}) and 1 post (M1) in T1.`, async () => {
    teamId = await h(t).platform(userA).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [userA.rcId, userB.rcId, users[6].rcId],
    });
    postId = await h(t).platform(userA).sentAndGetTextPostId(
      `test "like" ${uuid()}`,
      teamId
    );
  });

  const enterSpecifyTeam = async (app) => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  }
  const roleA = await h(t).userRole(userA, enterSpecifyTeam);
  const roleB = await h(t).userRole(userB, enterSpecifyTeam);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const postCard = conversationPage.postItemById(postId);

  await h(t).withLog(`And userC like the M1`, async () => {
    await h(t).glip(users[6]).init();
    await h(t).glip(users[6]).likePost(postId);
  })

  await h(t).withLog(`When userA open T1`, async () => {
    await t.useRole(roleA);
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon with number 1 at M1 footer`, async () => {

    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  await h(t).withLog(`When userB open T1`, async () => {
    await t.useRole(roleB);
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon with number 1 at M1 footer`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  await h(t).withLog(`When userA hover M1`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon on Action Bar`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  // A click like on Action Bar
  await h(t).withLog(`When userA click "unlike" icon on Action Bar`, async () => {
    await postCard.clickLikeOnActionBar();
  })

  await h(t).withLog(`Then the both hollow "unlike" icon change to solid "like" icon and the post Like number should be 2 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup');
    await postCard.likeShouldBe(2);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 2 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(2);
  });

  await h(t).withLog(`When userA click the solid "like" icon`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeOnActionBar();
  });

  await h(t).withLog(`Then the both solid "unlike" icon change to hollow icon and the post Like number should be 1 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 1 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  // A click like on footer
  await h(t).withLog(`When userA click "unlike" icon on M1 footer`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeButtonOnFooter();
  })

  await h(t).withLog(`Then the both hollow "unlike" icon change to solid "like" icon and the post Like number should be 2 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup');
    await postCard.likeShouldBe(2);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 2 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(2);
  });

  await h(t).withLog(`When userA click the solid "like" icon on footer`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeButtonOnFooter();
  });

  await h(t).withLog(`Then the both solid "unlike" icon change to hollow icon and the post Like number should be 1 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumbup_border');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await conversationPage.waitUntilPostsBeLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 1 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumbup_border');
    await postCard.likeShouldBe(1);
  });
});