/*
* @Author: Potar He (potar.he@ringcentral.com)
* @Date: 2018-12-20 16:30:30
* Copyright © RingCentral. All rights reserved.
*/

import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';
import * as assert from 'assert';

fixture('Profile/MiniProfile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open mini profile via post avatar then open conversation', ['JPT-449', 'P1', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const app = new AppRoot(t);

  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage;

  let teamId, myPost, otherUserPost;
  await h(t).withLog('Given I have one team, one post which I send, one post which other user send ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });

    const myPostId = await h(t).platform(loginUser).sentAndGetTextPostId(`My post ${uuid()}`, teamId);
    myPost = await conversationPage.postItemById(myPostId);

    const otherUserPostId = await h(t).platform(otherUser).sentAndGetTextPostId(`Other post ${uuid()}`, teamId);
    otherUserPost = conversationPage.postItemById(otherUserPostId);
  });

  const postList = {
    myPost: myPost,
    otherPost: otherUserPost
  }

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  for (let key in postList) {
    const post = postList[key];
    let top, left, postUserName;
    await h(t).withLog(`When I enter the create team and then click ${key} avatar`, async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
      top = await post.avatar.getBoundingClientRectProperty('top');
      left = await post.avatar.getBoundingClientRectProperty('left');
      postUserName = await post.name.textContent;
      await post.clickAvatar()
    });

    await h(t).withLog('Then the mini profile card should be showed', async () => {
      await miniProfile.shouldBePopUp();
      await miniProfile.shouldBeName(postUserName);
    });

    await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the listed people', async () => {
      await H.retryUntilPass(async () => {
        const minTop = await miniProfile.avatar.getBoundingClientRectProperty('top');
        const minLeft = await miniProfile.avatar.getBoundingClientRectProperty('left');
        assert.strictEqual(top, minTop);
        assert.strictEqual(left, minLeft);
      })
    }, true);

    await h(t).withLog('When I click "message" button of the mini profile', async () => {
      await miniProfile.goToMessages();
    });

    await h(t).withLog(`Then the "${postUserName}" conversation should be open`, async () => {
      await t.expect(conversationPage.title.textContent).contains(postUserName);
    });
  }
});

test(formalName('Open mini profile via @mention', ['JPT-436', 'P2', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const app = new AppRoot(t);
  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage

  let teamId, meMentionPost, contactMentionPost, teamMentionPost;
  await h(t).withLog('Given I have one team with some mention posts ', async () => {
    teamId = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, otherUser.rcId],
    });
    const meMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Person](${loginUser.rcId})`,
      teamId,
    );
    meMentionPost = conversationPage.postItemById(meMentionPostId);

    const contactMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Person](${otherUser.rcId})`,
      teamId,
    );
    contactMentionPost = conversationPage.postItemById(contactMentionPostId);

    const teamMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Team](${teamId})`,
      teamId
    );
    teamMentionPost = conversationPage.postItemById(teamMentionPostId);
  });

  const postList = {
    meMention: meMentionPost,
    contactMention: contactMentionPost,
    teamMention: teamMentionPost,
  }

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}, and enter the created team`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
  });

  for (let key in postList) {
    const post = postList[key];
    await h(t).withLog(`When I click the ${key}`, async () => {
      await t.click(post.mentions);
    });

    await h(t).withLog('Then the mini profile dialog should be showed', async () => {
      await miniProfile.shouldBePopUp();
      await H.retryUntilPass(async () => {
        const mentionName = await post.mentions.textContent
        const miniProfileName = await miniProfile.getName();
        assert.strictEqual(mentionName, miniProfileName);
      });
    }, true);

    await h(t).withLog('And I can cancel Mini Profile via click other area', async () => {
      await t.click(conversationPage.messageInputArea);
    });
  }
});

// skip due to the requirement is not implement.
test.skip(formalName('Open mini profile via global search then open profile', ['JPT-385', 'P1', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const app = new AppRoot(t);
  const teamName = uuid();
  const otherUserName = await h(t).glip(loginUser).getPerson(users[5].rcId)
    .then(res => res.data.display_name);

  const steps = async (i: number, count: number, searchItem, type: string) => {
    const top = await searchItem.avatar.getBoundingClientRectProperty('top');
    const left = await searchItem.avatar.getBoundingClientRectProperty('left');
    const id = await searchItem.getId();
    await h(t).withLog(`When I click the avatar of ${i + 1}/${count}  ${type} result`, async () => {
      await searchItem.clickAvatar();
    });
    await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the clicked result', async () => {
      await H.retryUntilPass(async () => {
        const miniTop = await miniProfile.avatar.getBoundingClientRectProperty('top');
        const miniLeft = await miniProfile.avatar.getBoundingClientRectProperty('left');
        await t.expect(top).eql(miniTop);
        await t.expect(left).eql(miniLeft);
      });
    });
    await h(t).withLog(`And the mini profile id should be ${id}`, async () => {
      const miniProfileId = await miniProfile.getId();
      await t.expect(miniProfileId).eql(id);
    });

    await h(t).withLog('When I click "Profile" button on MiniProfile', async () => {
      await miniProfile.openProfile();
    });
    await h(t).withLog('Then the profile dialog should be popup', async () => {
      await profileDialog.shouldBePopUp();
    });
    await h(t).withLog(`And the profile dialog id should be same as mini Profile id: ${id}`, async () => {
      const profileDialogId = await profileDialog.getId();
      await t.expect(profileDialogId).eql(id)
      await profileDialog.close();
    });
  }

  await h(t).withLog(`Given I have a team, a group, a privateChat that all include user: ${otherUserName}`, async () => {
    await h(t).platform(loginUser).createGroup({
      isPublic: true,
      name: teamName,
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      type: 'Group',
      members: [loginUser.rcId, users[5].rcId, users[6].rcId],
    });
    await h(t).platform(loginUser).createGroup({
      type: 'PrivateChat',
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const search = app.homePage.header.search;
  await h(t).withLog(`When I type people keyword ${otherUserName} in search input area`, async () => {
    await search.typeText(otherUserName, { replace: true, paste: true });
    await t.wait(3e3);
  });

  let peopleCount: number;
  await h(t).withLog('Then I should find at least one people result', async () => {
    await t.expect(search.peoples.count).gte(1);
    peopleCount = await search.peoples.count;
  }, true);

  const miniProfile = app.homePage.miniProfile;
  const profileDialog = app.homePage.profileDialog;

  for (let i = 0; i < peopleCount; i++) {
    await steps(i, peopleCount, search.nthPeople(i), "People");
  }

  await h(t).withLog(`When I type people keyword ${otherUserName} in search input area`, async () => {
    await search.typeText(otherUserName, { replace: true, paste: true });
    await t.wait(3e3);
  });

  let GroupCount: number;
  await h(t).withLog('Then I should find at least one group result', async () => {
    await t.expect(search.groups.count).gte(1);
    GroupCount = await search.groups.count;
  }, true);

  for (let i = 0; i < GroupCount; i++) {
    await steps(i, peopleCount, search.nthGroup(i), "Group");
  };

  await h(t).withLog(`When I type teamName: ${teamName} in search input area`, async () => {
    await search.typeText(teamName, { replace: true, paste: true });
    await t.wait(3e3);
  });

  let teamCount
  await h(t).withLog('Then I should find at least team result', async () => {
    await t.expect(search.teams.count).gte(1);
    teamCount = await search.teams.count;
  }, true);

  for (let i = 0; i < teamCount; i++) {
    await steps(i, teamCount, search.nthTeam(i), "Team")
  }
});