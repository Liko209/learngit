/*
* @Author: Aaron Huo (Aaron.Huo@ringcentral.com)
* @Date: 2019-04-12 10:00:00
* Copyright © RingCentral. All rights reserved.
*/
import { ClientFunction } from 'testcafe';
import * as assert from 'assert'
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { ITestMeta, IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';

fixture('Profile/ProfileScreen')
  .beforeEach(setupCase(BrandTire.RC_USERS_20))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P3'],
  caseIds: ['JPT-1312'],
  maintainers: ['Aaron Huo'],
  keywords: ['ProfileScreen'],
})('Check the height adaptive of the profile dialog', async (t) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const company = h(t).rcData.mainCompany;
  const [loginUser, ...rest] = company.users;
  const otherUsers = rest.map(({ rcId: id }) => ({ id }));
  const app = new AppRoot(t);

  let listClientHeight;
  let listScrollHeight;

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser],
  };

  await h(t).withLog('Given team named: "{name}" initial member only login user.', async (step) => {
    step.setMetadata('name', team.name);
    await h(t).scenarioHelper.createTeam(team);
  });

  const messageTab = app.homePage.messageTab;
  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  const openTeamT1Profile = async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
  }

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open this team profile.', openTeamT1Profile);

  await h(t).withLog('Then should no scroll bar in the member list.', async () => {
    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;
      listScrollHeight = await profileDialog.visualList.scrollHeight;
      assert.ok(listScrollHeight - listClientHeight === 0, "error: have scroll");
    });
  });

  await h(t).withLog('When I add one member.', async () => {
    await h(t).platform(loginUser).addTeamMember(otherUsers.slice(0, 1), team.glipId);
  });

  await h(t).withLog('Then dialog height increase', async () => {
    const lastListClientHeight = listClientHeight;

    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;

      const isHeightIncreased = listClientHeight - lastListClientHeight > 0;

      assert.ok(isHeightIncreased, "Dialog height doesn't increase correctly.");
    });
  });

  await h(t).withLog('And no dialog scroll bar', async () => {
    await H.retryUntilPass(async () => {
      listScrollHeight = await profileDialog.visualList.scrollHeight;
      assert.ok(listScrollHeight - listClientHeight === 0, "error: have scroll");
    });
  });

  await h(t).withLog('When I add members until members count equal six.', async () => {
    await await h(t).platform(loginUser).addTeamMember(otherUsers.slice(1, 5), team.glipId);
  });

  await h(t).withLog('Then the member list just display 5.5 members and has scroll bar', async () => {
    let itemHeight = await profileDialog.visualList.find('[data-id]').nth(0).clientHeight;
    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;
      listScrollHeight = await profileDialog.visualList.scrollHeight;
      const hasScrollBar = listScrollHeight - listClientHeight > 0;
      const displayFiveMemberCount = listClientHeight / itemHeight === 5.5;
      assert.ok(hasScrollBar, "Error: no scroll bar");
      assert.ok(displayFiveMemberCount, `Error: display members: ${listClientHeight / itemHeight}`)
    });
  });


  await h(t).withLog('When I zoom out web page width less 640px', async () => {
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
    await t.resizeWindow(639, windowHeight - 1);
  });

  await h(t).withLog('Then the team profile will in full page and display more member list', async () => {
    await H.retryUntilPass(async () => {
      const lastListClientHeight = listClientHeight;
      const profileClientHeight = await profileDialog.self.clientHeight;
      const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
      listClientHeight = await profileDialog.visualList.clientHeight;
      const isProfileFullPage = profileClientHeight - windowHeight === 0;
      const isDisplayMoreMembers = listClientHeight - lastListClientHeight > 0;

      assert.ok(isProfileFullPage, "Error: it is not full page");
      assert.ok(isDisplayMoreMembers, "Error: it is not display more members");
    });
  });

  await h(t).withLog('When I add member until members count equal 11', async () => {
    await await h(t).platform(loginUser).addTeamMember(otherUsers.slice(5, 10), team.glipId);
  });

  await h(t).withLog('Then member search box should be displayed', async () => {
    await H.retryUntilPass(async () => {
      assert.ok(profileDialog.memberSearch, "Member search box haven't been displayed");
    });
  });

  await h(t).withLog('When I close T1 team profile and restore full screen', async () => {
    await profileDialog.clickCloseButton();
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
    const screenWidth = await ClientFunction(() => window.screen.availWidth)();
    await t.resizeWindow(screenWidth, windowHeight);
  });

  await h(t).withLog('And I reopen team T1 profile', openTeamT1Profile);

  await h(t).withLog('And I search one member', async () => {
    const vInput = profileDialog.memberSearch.find('input');
    const userName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUsers[0].id);

    await t.typeText(vInput, userName, { replace: true, paste: true });
  });

  await h(t).withLog('Then the profile height is adaptive and display one members', async () => {
    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;
      listScrollHeight = await profileDialog.visualList.scrollHeight;
      const hasNoScrollBar = listScrollHeight - listClientHeight === 0;
      assert.ok(hasNoScrollBar, "The profile height isn't adaptive.");
    });

    await profileDialog.countOnMemberListShouldBe(1);
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2402'],
  maintainers: ['Spike Yang'],
  keywords: ['ProfileScreen'],
})('If the user can access Mini Profile from Team Member View', async (t) => {
  const company = h(t).rcData.mainCompany;
  const [loginUser, ...rest] = company.users;
  const app = new AppRoot(t);

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given team T1 initial member only login user.', async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const messageTab = app.homePage.messageTab;
  const profileDialog = app.homePage.profileDialog;
  const miniProfile = app.homePage.miniProfile;
  const conversationPage = app.homePage.messageTab.conversationPage;

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I open team T1 profile.', async () => {
    await messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
    await conversationPage.headerMoreMenu.openProfile();
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('And click member avatar.', async () => {
    await profileDialog.clickMembersAvatar();
  });

  await h(t).withLog('Then Display the mini profile dialog.', async () => {
    await t.expect(miniProfile.self.exists).ok();
  });
});
