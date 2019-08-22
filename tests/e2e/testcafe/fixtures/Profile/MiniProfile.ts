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
import { IGroup } from '../../v2/models';

fixture('Profile/MiniProfile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open mini profile via post avatar then open conversation', ['JPT-449', 'P1', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const app = new AppRoot(t);

  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage;

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let myPost, otherUserPost;
  await h(t).withLog('Given I have one team, one post which I send, one post which other user send ', async () => {
    await h(t).scenarioHelper.createTeam(team);
    const myPostId = await h(t).platform(loginUser).sentAndGetTextPostId(`My post ${uuid()}`, team.glipId);
    myPost = conversationPage.postItemById(myPostId);

    const otherUserPostId = await h(t).platform(otherUser).sentAndGetTextPostId(`Other post ${uuid()}`, team.glipId);
    otherUserPost = conversationPage.postItemById(otherUserPostId);
  });

  const postList = {
    myPost: myPost,
    otherPost: otherUserPost
  }

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  for (const key in postList) {
    const post = postList[key];
    let top, left, postUserName;
    await h(t).withLog(`When I enter the create team and then click ${key} avatar`, async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
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

test(formalName('Open mini profile via @mention then open profile', ['JPT-436', 'P2', 'Potar.He', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const app = new AppRoot(t);
  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }


  let meMentionPost, contactMentionPost, teamMentionPost;
  await h(t).withLog('Given I have one team with some mention posts ', async () => {
    await h(t).scenarioHelper.createTeam(team);

    const meMentionPostId = await h(t).platform(otherUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Person](${loginUser.rcId})`,
      team.glipId,
    );
    meMentionPost = conversationPage.postItemById(meMentionPostId);

    const contactMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Person](${otherUser.rcId})`,
      team.glipId,
    );
    contactMentionPost = conversationPage.postItemById(contactMentionPostId);

    const teamMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Team](${team.glipId})`,
      team.glipId
    );
    teamMentionPost = conversationPage.postItemById(teamMentionPostId);
  });

  const postList = {
    meMention: meMentionPost,
    contactMention: contactMentionPost,
    teamMention: teamMentionPost,
  }

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And enter the created team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  for (const key in postList) {
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

    const miniProfileId = await miniProfile.getId();
    await h(t).withLog('When I click "Profile" button on MiniProfile', async () => {
      await miniProfile.openProfile();
    });

    await h(t).withLog('Then the profile dialog should be popup', async () => {
      await profileDialog.ensureLoaded();
    });

    await h(t).withLog(`And the profile dialog id should be same as mini Profile id: ${miniProfileId}`, async () => {
      const profileDialogId = await profileDialog.getId();
      await t.expect(profileDialogId).eql(miniProfileId);
      await profileDialog.clickCloseButton();
    });
  }
});


test(formalName('Favorite/Unfavorite a conversation from mini profile', ['JPT-568', 'P2', 'Skye.wang', 'Profile']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const otherUser = users[5];
  await h(t).platform(otherUser).init();

  const app = new AppRoot(t);
  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const favoritesSection = app.homePage.messageTab.favoritesSection;

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser]
  }
  const chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let contactMentionPost, teamMentionPost;
  await h(t).withLog('Given I an extension with 1 private chat and one team with some mention posts ', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, chat]);

    const contactMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Person](${otherUser.rcId})`,
      team.glipId,
    );
    contactMentionPost = conversationPage.postItemById(contactMentionPostId);

    const teamMentionPostId = await h(t).platform(loginUser).sentAndGetTextPostId(
      `Hi AtMention, ![:Team](${team.glipId})`,
      team.glipId
    );
    teamMentionPost = conversationPage.postItemById(teamMentionPostId);
  });

  const postList = {
    contactMention: contactMentionPost,
    teamMention: teamMentionPost,
  }
  const groupIdList = {
    contactMention: chat.glipId,
    teamMention: team.glipId,
  }

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`And enter the created team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  for (const key in postList) {
    const post = postList[key];
    await h(t).withLog(`When I click the ${key}`, async () => {
      await t.click(post.mentions);
    });

    await h(t).withLog('Then the mini profile dialog should be showed', async () => {
      await miniProfile.shouldBePopUp();
    });

    await h(t).withLog('`When I click "unfavorite" icon', async () => {
      await t.click(miniProfile.unFavoriteStatusIcon);
    });

    await h(t).withLog(`The "unfavorite" icon change to "favorite" icon`, async () => {
      await t.expect(miniProfile.unFavoriteStatusIcon.exists).notOk();
      await t.expect(miniProfile.favoriteStatusIcon.exists).ok();
    });

    await h(t).withLog('And I can cancel Mini Profile via click other area', async () => {
      await t.click(conversationPage.messageInputArea);
    });

    const chatId = groupIdList[key];
    await h(t).withLog(`And The ${key} conversation move to favorites section`, async () => {
      await t.expect(favoritesSection.conversationEntryById(chatId).exists).ok();
    });

    await h(t).withLog(`When I click the ${key}`, async () => {
      await t.click(post.mentions);
    });

    await h(t).withLog('Then the mini profile dialog should be showed', async () => {
      await miniProfile.shouldBePopUp();
    });

    await h(t).withLog('`When I click "favorite" icon', async () => {
      await t.click(miniProfile.favoriteStatusIcon);
    });

    await h(t).withLog(`The "favorite" icon change to "unfavorite" icon`, async () => {
      await t.expect(miniProfile.favoriteStatusIcon.exists).notOk();
      await t.expect(miniProfile.unFavoriteStatusIcon.exists).ok();
    });

    await h(t).withLog('And I can cancel Mini Profile via click other area', async () => {
      await t.click(conversationPage.messageInputArea);
    });

    await h(t).withLog(`And The ${key} conversation move to original section`, async () => {
      await t.expect(favoritesSection.conversationEntryById(chatId).exists).notOk();
    });
  }
});
