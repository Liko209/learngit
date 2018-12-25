/*
* @Author: Potar He (potar.he@ringcentral.com)
* @Date: 2018-12-20 16:30:30
* Copyright © RingCentral. All rights reserved.
*/

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';


fixture('Profile/MiniProfile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());
  
test(formalName('Open mini profile via post avatar then open conversation', ['JPT-449', 'P1', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const otherUserPlatform = await h(t).getPlatform(users[5]);
  const app = new AppRoot(t);
  console.log(loginUser.rcId);


  let teamId, myPost, otherUserPost;
  await h(t).withLog('Given I have one team, one post which I send, one post which other user send ', async () => {
    teamId = await loginUser.sdk.platform.createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    }).then(res => {
      return res.data.id;
    });

    const myPostId = await loginUser.sdk.platform.sendTextPost(`My post ${uuid()}`, teamId).then(res => {
      return res.data.id;
    });
    myPost = await app.homePage.messageTab.conversationPage.postItemById(myPostId);

    const otherUserPostId = await otherUserPlatform.sendTextPost(`Other post ${uuid()}`, teamId).then(res => {
      return res.data.id;
    });
    otherUserPost = app.homePage.messageTab.conversationPage.postItemById(otherUserPostId);
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let top, left;
  await h(t).withLog('When I enter the create team and then click my avatar on my post', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    top = await myPost.getAvatarLeft();
    left = await myPost.getAvatarLeft();
    await myPost.clickAvatar()
  });

  await h(t).withLog('Then the mini profile dialog should be showed', async () => {


  }, true);

  await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the listed people', async () => {

  }, true);

});


test(formalName('Open mini profile via global search then open profile', ['JPT-385', 'P1', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const app = new AppRoot(t);
  const teamName = uuid();
  const keyword = 'John';

  await h(t).withLog('Given I have a team, a group, a privateChat ', async () => {
    await loginUser.sdk.platform.createGroup({
      isPublic: true,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await loginUser.sdk.platform.createGroup({
      type: 'Group',
      isPublic: true,
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });

    await loginUser.sdk.platform.createGroup({
      type: 'Group',
      isPublic: true,
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${keyword} in search input area`, async () => {
    await search.typeText(keyword);
  });

  let peopleCount: number, GroupCount;
  await h(t).withLog('Then I should find at least one people and group result', async () => {
    await t.expect(search.peoples.count).gte(1);
    await t.expect(search.groups.count).gte(1);
    peopleCount = await search.peoples.count;
    GroupCount = await search.groups.count;
  }, true);

  for (let i = 0; i < peopleCount; i++) {
    let top, left
    await h(t).withLog(`When I click the avatar of (${i + 1}) / ${peopleCount} people result`, async () => {
      top = await search.nthPeople(i).getAvatarTop();
      left = await search.nthPeople(i).getAvatarLeft();
      await search.nthPeople(i).clickAvatar();
    });

    await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the clicked result', async () => {
      console.log(top, left);
      //todo mini profile

    }, true);

    await h(t).withLog('And I can cancel Mini Profile', async () => {
      //todo mini profile

      await t.click(search.inputArea);
    }, true);
  }

  for (let i = 0; i < GroupCount; i++) {
    let top, left
    await h(t).withLog(`When I click the avatar of (${i + 1}) / ${GroupCount} groups result`, async () => {
      top = await search.nthGroup(i).getAvatarTop();
      left = await search.nthGroup(i).getAvatarLeft();
      await search.nthGroup(i).clickAvatar();
    });

    await h(t).withLog('Then the left-top of the avatar on profile dialog should be the same position as the avatar of the clicked result', async () => {
      console.log(top, left);
      //todo mini profile

    }, true);

    await h(t).withLog('And I can cancel Mini Profile', async () => {
      //todo mini profile

      await t.click(search.inputArea);
    }, true);
  };

  await h(t).withLog(`When I type teamName: ${teamName} in search input area`, async () => {
    await search.typeText(teamName, { replace: true });
  });

  let teamCount
  await h(t).withLog('Then I should find at least one people and group result', async () => {
    await t.expect(search.teams.count).gte(1);
    teamCount = await search.teams.count;
  }, true);

  for (let i = 0; i < teamCount; i++) {
    let top, left;
    await h(t).withLog(`When I click the avatar of (${i + 1})/${teamCount}  teams result`, async () => {
      top = await search.nthTeam(i).getAvatarTop();
      left = await search.nthTeam(i).getAvatarLeft();
      await search.nthTeam(i).clickAvatar();
    });

    await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the clicked result', async () => {
      console.log(top, left);
      //todo mini profile
    }, true);
  }
});


test(formalName('Open mini profile via @mention', ['JPT-4369', 'P2', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const otherUserPlatform = await h(t).getPlatform(users[5]);
  const app = new AppRoot(t);
  console.log(loginUser.rcId);


  let teamId, meMentionPost, contactMentionPost;
  await h(t).withLog('Given I have one team with some mention posts ', async () => {
    teamId = await loginUser.sdk.platform.createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    }).then(res => {
      return res.data.id;
    })
    const meMentionPostId = await otherUserPlatform.sendTextPost(`Hi AtMention, ![:Person](${loginUser.rcId})`, teamId).then(res => {
      return res.data.id;
    });
    meMentionPost = app.homePage.messageTab.conversationPage.postItemById(meMentionPostId);

    const contactMentionPostId = await loginUser.sdk.platform.sendTextPost(`Hi AtMention, ![:Person](${users[5].rcId})`, teamId).then(res => {
      return res.data.id;
    });
    contactMentionPost = app.homePage.messageTab.conversationPage.postItemById(contactMentionPostId);
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter the create team and click the me mention', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await t.click(meMentionPost.mentions);
  });

  await h(t).withLog('Then the mini profile dialog should be showed', async () => {

  }, true);

  await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the listed people', async () => {

  }, true);

});