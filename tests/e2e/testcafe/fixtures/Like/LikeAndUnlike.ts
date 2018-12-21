/*
 * @Author: Potar He (potar.he@ringcentral.com)
 * @Date: 2018-12-18 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { BrandTire } from '../../config'

fixture('LikeAndUnlike')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Operating a message that you first like then unlike', ['JPT-304', 'P2', 'Like', 'Potar.He']), async (t) => {
  const users = h(t).rcData.mainCompany.users
  const userA = users[4];
  userA.sdk = await h(t).getSdk(userA);
  const userB = users[5];
  const app = new AppRoot(t);

  let teamId, postId;
  await h(t).withLog(`Given I 1 team chat (T1) have members userA(${userA.company.number}#${userA.extension}) and userB(${userB.company.number}#${userB.extension}) and 1 post (M1) in T1.`, async () => {
    teamId = (await userA.sdk.platform.createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [userA.rcId, userB.rcId],
    })).data.id;
    postId = (await userA.sdk.platform.sendTextPost(
      `test "like" ${uuid()}`,
      teamId
    )).data.id
  });

  const enterSpecifyTeam = async (app) => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  }
  const roleA = await h(t).userRole(userA, enterSpecifyTeam);
  const roleB = await h(t).userRole(userB, enterSpecifyTeam);
  const postCard = app.homePage.messageTab.conversationPage.postItemById(postId);

  await h(t).withLog(`When userA open T1, and hover M1 card`, async () => {
    await t.useRole(roleA);
    await postCard.ensureLoaded();
    await t.hover(postCard.self)
  });

  await h(t).withLog(`Then Appear action bar and there have hollow "unlike" icon `, async () => {
    await t.hover(postCard.likeToggleOnActionBar);
    await t.expect(postCard.prompt).eql('Like');
  });


  await h(t).withLog(`When userB hover the same M1 card `, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  });

  await h(t).withLog(`Then should check no one like the M1 `, async () => {
    await t.expect(await postCard.getLikeCount()).eql(0);
  });

  await h(t).withLog(`When userA click "unlike" button`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeOnActionBar();
  });

  await h(t).withLog(`Then M1 action bar 'unlike' icon change to 'like', and M1 card footer appear "like" icon with number 1`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userB view the message M1 card`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  });

  await h(t).withLog(`Then M1 should appear "like" icon with number 1`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });


  await h(t).withLog(`When userA click 'like' icon on action bar`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeOnActionBar();
  });

  await h(t).withLog(`Then there is hollow "unlike" icon on M1 action bar and no like or unlike on M1 footer `, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(0);
  });

  await h(t).withLog(`When userB view the message M1 card`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  });

  await h(t).withLog(`Then should check no one like the M1`, async () => {
    await t.expect(await postCard.getLikeCount()).eql(0);
  });

  await h(t).withLog(`When userA click "unlike" button`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeOnActionBar();
  });

  await h(t).withLog(`Then M1 action bar 'unlike' icon change to 'like', and M1 card footer appear "like" icon with number 1`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userB view the message M1 card`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  });

  await h(t).withLog(`Then M1 should appear "like" icon with number 1`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });


  await h(t).withLog(`When userA click 'like' icon on footer`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeButtonOnFooter();
  });

  await h(t).withLog(`Then there is hollow "unlike" icon on M1 action bar and no like or unlike on M1 footer `, async () => {
    await t.hover(postCard.self);
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(0);
  });

  await h(t).withLog(`When userB view the message M1 card`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  });

  await h(t).withLog(`Then should check no one like the M1`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(0);
  });
});

test(formalName('Like a message that you not first like then unlike', ['JPT-308', 'P2', 'Like', 'Potar.He']), async (t) => {
  const users = h(t).rcData.mainCompany.users
  const userA = users[4];
  userA.sdk = await h(t).getSdk(userA);
  const userB = users[5];
  const otherGlip = await h(t).getGlip(users[6]);
  const app = new AppRoot(t);

  let teamId, postId;
  await h(t).withLog(`Given I 1 team chat (T1) have members userA(${userA.company.number}#${userA.extension}) and userB(${userB.company.number}#${userB.extension}) and 1 post (M1) in T1.`, async () => {
    teamId = await userA.sdk.platform.createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [userA.rcId, userB.rcId, users[6].rcId],
    }).then(res => {
      return res.data.id
    });
    postId = await userA.sdk.platform.sendTextPost(
      `test "like" ${uuid()}`,
      teamId
    ).then(res => { return res.data.id });
  });

  const enterSpecifyTeam = async (app) => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  }
  const roleA = await h(t).userRole(userA, enterSpecifyTeam);
  const roleB = await h(t).userRole(userB, enterSpecifyTeam);
  const postCard = app.homePage.messageTab.conversationPage.postItemById(postId);

  await h(t).withLog(`And userC like the M1`, async () => {
    await otherGlip.likePost(postId);
  })
  await h(t).withLog(`When userA open T1`, async () => {
    await t.useRole(roleA);
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon with number 1 at M1 footer`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userB open T1`, async () => {
    await t.useRole(roleB);
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon with number 1 at M1 footer`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userA hover M1`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" icon on Action Bar`, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  // A click like on Action Bar
  await h(t).withLog(`When userA click "unlike" icon on Action Bar`, async () => {
    await postCard.clickLikeOnActionBar();
  })

  await h(t).withLog(`Then the both hollow "unlike" icon change to solid "like" icon and the post Like number should be 2 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(2);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 2 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(2);
  });

  await h(t).withLog(`When userA click the solid "like" icon`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeOnActionBar();
  });

  await h(t).withLog(`Then the both solid "unlike" icon change to hollow icon and the post Like number should be 1 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 1 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  // A click like on footer
  await h(t).withLog(`When userA click "unlike" icon on M1 footer`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeButtonOnFooter();
  })

  await h(t).withLog(`Then the both hollow "unlike" icon change to solid "like" icon and the post Like number should be 2 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).eql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).eql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(2);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 2 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(2);
  });

  await h(t).withLog(`When userA click the solid "like" icon on footer`, async () => {
    await t.useRole(roleA);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
    await postCard.clickLikeButtonOnFooter();
  });

  await h(t).withLog(`Then the both solid "unlike" icon change to hollow icon and the post Like number should be 1 `, async () => {
    await t.expect(postCard.likeToggleOnActionBar.textContent).notEql('thumb_up');
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });

  await h(t).withLog(`When userB check the M1`, async () => {
    await t.useRole(roleB);
    await app.homePage.ensureLoaded();
    await postCard.ensureLoaded();
  })

  await h(t).withLog(`Then there is a hollow "unlike" with number 1 on M1 footer`, async () => {
    await t.expect(postCard.likeButtonOnFooter.textContent).notEql('thumb_up');
    await t.expect(await postCard.getLikeCount()).eql(1);
  });
});
