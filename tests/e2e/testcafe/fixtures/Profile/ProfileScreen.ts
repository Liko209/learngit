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
import { ITestMeta } from '../../v2/models';
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

  let teamT1Id;
  let title;
  let listClientHeight;
  let listScrollHeight;

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  title = 'Given team T1 initial member only login user.';
  await h(t).withLog(title, async () => {
    teamT1Id = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  const messageTab = app.homePage.messageTab;
  const profileDialog = app.homePage.profileDialog;

  const openTeamT1Profile = async () => {
    await messageTab.teamsSection.conversationEntryById(teamT1Id).openMoreMenu();
    await messageTab.moreMenu.profile.enter();
    await profileDialog.ensureLoaded();
  }

  title = `Given I login with ${loginUser.company.number}#${loginUser.extension}`;
  await h(t).withLog(title, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  title = 'When I open team T1 profile.';
  await h(t).withLog(title, openTeamT1Profile);

  title = 'Then should no scroll bar in the member list.';
  await h(t).withLog(title, async () => {
    listClientHeight = await profileDialog.visualList.clientHeight;
    listScrollHeight = await profileDialog.visualList.scrollHeight;

    const hasNoScrollBar = listScrollHeight - listClientHeight === 0;

    await t.expect(hasNoScrollBar).ok();
  });

  title = 'When I add one member.';
  await h(t).withLog(title, async () => {
    await h(t).platform(loginUser).addTeamMember(otherUsers.slice(0, 1), teamT1Id);
  });

  title = 'Then dialog height increase';
  await h(t).withLog(title, async () => {
    const lastListClientHeight = listClientHeight;

    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;

      const isHeightIncreased = listClientHeight - lastListClientHeight > 0;

      assert.ok(isHeightIncreased, "Dialog height doesn't increase correctly.");
    });
  });

  title = 'And no dialog scroll bar';
  await h(t).withLog(title, async () => {
    listScrollHeight = await profileDialog.visualList.scrollHeight;

    const hasNoScrollBar = listScrollHeight - listClientHeight === 0;

    await t.expect(hasNoScrollBar).ok();
  });

  title = 'When I add members until members count equal six.';
  await h(t).withLog(title, async () => {
    await await h(t).platform(loginUser).addTeamMember(otherUsers.slice(1, 5), teamT1Id);
  });

  title = 'Then member list show scroll bar';
  await h(t).withLog(title, async () => {
    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;
      listScrollHeight = await profileDialog.visualList.scrollHeight;

      const hasScrollBar = listScrollHeight - listClientHeight > 0;

      assert.ok(hasScrollBar, "Member list doesn't show scroll bar");
    });
  });

  title = 'When I zoom out web page width less 640px';
  await h(t).withLog(title, async () => {
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();

    await t.resizeWindow(639, windowHeight - 1);
  });

  title = 'Then the team profile will in full page and display more member list';
  await h(t).withLog(title, async () => {
    const lastListClientHeight = listClientHeight;
    const profileClientHeight = await profileDialog.self.clientHeight;
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();

    listClientHeight = await profileDialog.visualList.clientHeight;

    const isProfileFullPage = profileClientHeight - windowHeight === 0;
    const isDisplayMoreMembers = listClientHeight - lastListClientHeight > 0;

    await t.expect(isProfileFullPage).ok();
    await t.expect(isDisplayMoreMembers).ok();
  });

  title = 'When I add member until members count equal 11';
  await h(t).withLog(title, async () => {
    await await h(t).platform(loginUser).addTeamMember(otherUsers.slice(5, 10), teamT1Id);
  });

  title = 'Then member search box should be displayed';
  await h(t).withLog(title, async () => {
    await H.retryUntilPass(async () => {
      assert.ok(profileDialog.memberSearch, "Member search box haven't been displayed");
    });
  });

  title = 'When I close T1 team profile and restore full screen';
  await h(t).withLog(title, async () => {
    await profileDialog.clickCloseButton();
    const windowHeight = await ClientFunction(() => window.innerHeight || document.body.clientHeight)();
    const screenWidth = await ClientFunction(() => window.screen.availWidth)();

    await t.resizeWindow(screenWidth, windowHeight);
  });

  title = 'And I reopen team T1 profile';
  await h(t).withLog(title, openTeamT1Profile);

  title = 'And I search one member';
  await h(t).withLog(title, async () => {
    const vInput = profileDialog.memberSearch.find('input');
    const userName = await h(t).glip(loginUser).getPersonPartialData('display_name', otherUsers[0].id);

    await t.typeText(vInput, userName, { replace: true, paste:true });
  });

  title = 'Then the profile height is adaptive and display one members';
  await h(t).withLog(title, async () => {
    await H.retryUntilPass(async () => {
      listClientHeight = await profileDialog.visualList.clientHeight;
      listScrollHeight = await profileDialog.visualList.scrollHeight;

      const hasNoScrollBar = listScrollHeight - listClientHeight === 0;

      assert.ok(hasNoScrollBar, "The profile height isn't adaptive.");
    });

    await profileDialog.countOnMemberListShouldBe(1);
  });
});
