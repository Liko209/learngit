/*
 * @Author: Potar.He 
 * @Date: 2019-08-28 13:24:19 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-08-29 08:39:36
 */

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';

import { v4 as uuid } from 'uuid';

fixture('Telephony')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  caseIds: ['JPT-2892'],
  priority: ['P0'],
  maintainers: ['Potar.he'],
  keywords: ['conference'],
})('Start an audio conference call', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const conferenceName = 'Conference call';
  let conferenceNumber = undefined;
  const conferenceAvatarAttribute = '[href="#icon-icon-conference"]';


  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension (with digital line) with a team', async () => {
    await h(t).glip(loginUser).init();
    await h(t).scenarioHelper.createTeam(team);
  });

  let postId;
  await h(t).withLog('And I @mention team self in the team', async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}, ![:team](${team.glipId})`, team, loginUser);
  });

  let postCount = 1
  const app = new AppRoot(t);
  await h(t).withLog(`Adn I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const conversationPage = app.homePage.messageTab.conversationPage;

  // header
  await h(t).withLog('When I enter the group and click conference icon', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.clickConferenceButton();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  const checkTelephonyAndLastPost = async () => {
    await h(t).withLog('Then should open dialer to make a call ', async () => {
      await telephonyDialog.ensureLoaded();
      await t.expect(telephonyDialog.name.textContent).eql(conferenceName);
      await t.expect(telephonyDialog.avatar.find(conferenceAvatarAttribute).exists).ok();
      if (!conferenceNumber) {
        conferenceNumber = await telephonyDialog.phoneNumber.textContent
      } else {
        await t.expect(telephonyDialog.phoneNumber.textContent).eql(conferenceNumber);
      }

    });

    await h(t).withLog(`And I can find the last post is a audio conference`, async () => {
      postCount += 1;
      await t.expect(conversationPage.posts.count).eql(postCount);
      await t.expect(conversationPage.lastPostItem.headerNotification.withText('started an audio conference').exists).ok();
      await t.expect(conversationPage.lastPostItem.audioConference.icon.exists).ok();
      await t.expect(conversationPage.lastPostItem.audioConference.title.exists).ok();
      await t.expect(conversationPage.lastPostItem.audioConference.phoneNumber.textContent).eql(conferenceNumber);
    });


    await h(t).withLog(`Final I hangup the call`, async () => {
      await telephonyDialog.clickHangupButton();
    });

  };

  await checkTelephonyAndLastPost();


  // profile
  await h(t).withLog('When I open the Group profile dialog', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await profileDialog.clickConferenceIcon();
  });

  await checkTelephonyAndLastPost();

  const miniProfile = app.homePage.miniProfile;

  // mini profile
  await h(t).withLog('When I open the team mini profile', async () => {
    await conversationPage.postItemById(postId).clickNthMentions();
    await miniProfile.ensureLoaded();
  });

  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await miniProfile.clickConferenceButton();
  });

  await checkTelephonyAndLastPost();

  // search 
  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog
  await h(t).withLog('When I search the team', async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
  });

  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await searchDialog.instantPage.conversationEntryByCid(team.glipId).hoverAndClickConferenceButton();
  });

  await checkTelephonyAndLastPost();

});
test.meta(<ITestMeta>{
  caseIds: ['JPT-2891'],
  priority: ['P2'],
  maintainers: ['Potar.he'],
  keywords: ['conference'],
  accountType: BrandTire.RCOFFICE
})('Display toast when starting conference but no digital line', async (t) => {
  const [loginUser, ...restUsers] = h(t).rcData.mainCompany.users;
  const TOAST = 'Your extension is not allowed to make outbound calls with the RingCentral app currently, please contact your account representative for an upgrade.';

  await h(t).platform(loginUser).init();
  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, restUsers[0], restUsers[1]]
  }

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension (no digital line) with a group and a team', async () => {
    await h(t).glip(loginUser).init();

    await h(t).scenarioHelper.createTeamsOrChats([group, team]);
    await h(t).scenarioHelper.sendTextPost(uuid(), group, loginUser)
  });

  let postId;
  await h(t).withLog('And I @mention the team in the group', async () => {
    postId = await h(t).scenarioHelper.sentAndGetTextPostId(`${uuid()}, ![:team](${team.glipId})`, group, loginUser);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`Adn I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  const conversationPage = app.homePage.messageTab.conversationPage;

  // header
  await h(t).withLog('When I enter the group and click conference icon', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.clickConferenceButton();
  });

  const alertDialog = app.homePage.alertDialog;
  const checkAndCloseToast = async () => {
    await h(t).withLog('Then Display a toast: "{TOAST}"', async (step) => {
      step.initMetadata({ TOAST });
      await alertDialog.shouldBeShowMessage(TOAST);
    });

    await h(t).withLog('Final I close toast', async () => {
      await alertDialog.clickDismissButton()
    });
  }

  await checkAndCloseToast();

  // profile
  await h(t).withLog('When I open the Group profile dialog', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await profileDialog.clickConferenceIcon();
  });

  await checkAndCloseToast();

  const miniProfile = app.homePage.miniProfile;

  // mini profile
  await h(t).withLog('When I open the team mini profile', async () => {
    await conversationPage.postItemById(postId).clickNthMentions();
    await miniProfile.ensureLoaded();
  });

  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await miniProfile.clickConferenceButton();
  });

  await checkAndCloseToast();

  // search 
  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog
  await h(t).withLog('When I search the team', async () => {
    await searchBar.clickSelf();
    await searchDialog.typeSearchKeyword(team.name);
  });

  await h(t).withLog('And click audio conference besides the message icon', async () => {
    await searchDialog.instantPage.conversationEntryByCid(team.glipId).hoverAndClickConferenceButton();
  });

  await checkAndCloseToast();

});

