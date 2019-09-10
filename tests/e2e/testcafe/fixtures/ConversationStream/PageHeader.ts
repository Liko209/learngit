/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-30 15:28:36
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta, IGroup } from '../../v2/models';
import * as uuid from 'uuid';

fixture('ContentPanel/PageHeader')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.skip(formalName('When update custom status, can sync dynamically in page header', ['JPT-252', 'P2', 'ConversationStream',]),
  async (t: TestController) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).glip(loginUser).init();

    const anotherUser = users[5];
    await h(t).glip(anotherUser).init();

    const chat = <IGroup>{
      type: 'DirectMessage',
      owner: loginUser,
      members: [loginUser, anotherUser]
    }

    await h(t).withLog('Given I have an extension with a private chat with user5', async () => {
      await h(t).scenarioHelper.createOrOpenChat(chat);
    });

    await h(t).withLog('And send a post to ensure this chat in list', async () => {
      await h(t).scenarioHelper.sendTextPost(uuid(), chat, loginUser);
    });

    await h(t).withLog('Given user5 have custom status "In a meeting"', async () => {
      await h(t).glip(anotherUser).updatePerson({ away_status: 'In a meeting' });
    });

    const app = new AppRoot(t);

    await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      })
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const directMessagesSection = app.homePage.messageTab.directMessagesSection;

    await h(t).withLog('When I open the private chat with user5', async () => {
      await directMessagesSection.conversationEntryById(chat.glipId).enter();
      await conversationPage.waitUntilPostsBeLoaded();
    });

    const conversationPage = app.homePage.messageTab.conversationPage;
    // fail here due to known backend bug: https://jira.ringcentral.com/browse/FIJI-1032
    await h(t).withLog('Then I should find the custom status right after the user name on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).contains('In a meeting');
    });

    await h(t).withLog('Then I modify user5\'s custom status to "content of user modify"', async () => {
      await h(t).glip(anotherUser).updatePerson({
        away_status: 'content of user modify',
      });
    });

    await h(t).withLog('Then I should find the custom status right after the user name on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).contains('content of user modify');
    }, true);

    await h(t).withLog("Then I delete user5's custom status", async () => {
      await h(t).glip(anotherUser).updatePerson({
        away_status: null,
      });
    });

    await h(t).withLog('Then I should not find the custom status on the page header', async () => {
      await t.expect(conversationPage.headerStatus.textContent).notContains('content of user modify');
    }, true);
  },
);


test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ['JPT-1368'],
  maintainers: ['Potar.He'],
  keywords: ['PageHeader']
})('Check user can clicking the icon(with count) to open the team/group profile', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser, users[0]],
  }
  let group = <IGroup>{
    type: "Group",
    owner: loginUser,
    members: [loginUser, users[0], users[1]]
  }

  await h(t).withLog('Given I have an extension with 1 group and 1 team', async () => {
    await h(t).scenarioHelper.resetProfileAndState(loginUser);
    await h(t).scenarioHelper.createTeamsOrChats([team, group]);
  });

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I enter the group conversation and click Click the member count icon(with count) on page header ', async () => {
    await app.homePage.messageTab.directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.clickMemberCountIcon();
  }, true);

  const profileDialog = app.homePage.profileDialog;
  await h(t).withLog("Then profile dialog should be opened", async () => {
    await profileDialog.ensureLoaded();
  });

  await h(t).withLog('And I close the profile dialog', async () => {
    await profileDialog.clickCloseButton()
  }, true);

  await h(t).withLog('When I enter the team conversation and click Click the member count icon(with count) on page header ', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.clickMemberCountIcon();
  }, true);

  await h(t).withLog("Then profile dialog should be opened", async () => {
    await profileDialog.ensureLoaded();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2260'],
  maintainers: ['Aaron.Huo'],
  keywords: ['PageHeader'],
})('Check has archive and delete team operation in a team conversation header', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.admin;
  const otherUser = h(t).rcData.mainCompany.users[0];

  await h(t).glip(loginUser).init();
  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  const teamAllHandsId = (await h(t).glip(loginUser).getCompanyTeamId())[0];
  const teamA = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser],
  };
  const teamB = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: otherUser,
    members: [otherUser, loginUser],
  };

  await h(t).withLog('Given I have an extension with 2 teams', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA, teamB]);
  });

  await h(t).withLog(`And I login Jupiter as company admin: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const headerMoreMenu = conversationPage.headerMoreMenu;

  await h(t).withLog('When I enter all hands team and click more icon on conversation header', async () => {
    await teamSection.conversationEntryById(teamAllHandsId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then no "Admin actions" in the operation list', async () => {
    await t.expect(headerMoreMenu.adminActions.exists).notOk();
    await headerMoreMenu.quitByPressEsc();
  });

  await h(t).withLog('When I enter teamB and click more icon on conversation header', async () => {
    await teamSection.conversationEntryById(teamB.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then no "Admin actions" in the operation list', async () => {
    await t.expect(headerMoreMenu.adminActions.exists).notOk();
    await headerMoreMenu.quitByPressEsc();
  });

  await h(t).withLog('When I enter teamA and click more icon on conversation header', async () => {
    await teamSection.conversationEntryById(teamA.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then display "Admin actions" in the operation list', async () => {
    await t.expect(headerMoreMenu.adminActions.exists).ok();
  });

  await h(t).withLog('And I enter "Admin actions"', async () => {
    await headerMoreMenu.enterAdminActions();
  });

  await h(t).withLog('When I click "Archive team"', async () => {
    await t.expect(headerMoreMenu.teamArchiveMenu.exists).ok();
    await headerMoreMenu.archiveTeam();
  });

  const archiveTeamDialog = app.homePage.archiveTeamDialog;

  await h(t).withLog('Then display archive team confirmation dialog', async () => {
    await t.expect(archiveTeamDialog.exists).ok();
  });

  await h(t).withLog('And I close archive team confirmation dialog', async () => {
    await archiveTeamDialog.clickCancel();
  });

  await h(t).withLog('And I enter "Admin actions" again', async () => {
    await conversationPage.openMoreButtonOnHeader();
    await headerMoreMenu.enterAdminActions();
  });

  await h(t).withLog('When I click "Delete team"', async () => {
    await t.expect(headerMoreMenu.teamDeleteMenu.exists).ok();
    await headerMoreMenu.deleteTeam();
  });

  const deleteTeamDialog = app.homePage.deleteTeamDialog;

  await h(t).withLog('Then display delete team confirmation dialog', async () => {
    await t.expect(deleteTeamDialog.exists).ok();
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2261'],
  maintainers: ['Aaron.Huo'],
  keywords: ['PageHeader'],
})('Add profile entry in the conversation head for team/group/1:1 conversation', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];
  const otherUser = h(t).rcData.mainCompany.users[1];
  const groupUser = h(t).rcData.mainCompany.users[2];

  await h(t).scenarioHelper.resetProfileAndState(loginUser);

  const team = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser, otherUser],
  };
  const group = <IGroup>{
    type: 'Group',
    owner: loginUser,
    members: [loginUser, otherUser, groupUser],
  };
  const chat = <IGroup>{
    type: 'DirectMessage',
    owner: loginUser,
    members: [loginUser, otherUser],
  };

  await h(t).withLog('Given I have an extension with a team, a group and a 1:1 conversations', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team, group, chat]);
  });

  await h(t).withLog('And send a message to ensure chat and group in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
    await h(t).scenarioHelper.sendTextPost('for appear in section', group, loginUser);
  });

  await h(t).withLog(`And I login Jupiter this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  const headerMoreMenu = conversationPage.headerMoreMenu;
  const directMessagesSection = app.homePage.messageTab.directMessagesSection;

  await h(t).withLog('When I enter team and click more icon on conversation header', async () => {
    await teamSection.conversationEntryById(team.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then display "Team details" button', async () => {
    await t.expect(headerMoreMenu.profile.withText('Team details').exists).ok();
  });

  await h(t).withLog('When I click "Team details" button', async () => {
    await headerMoreMenu.openProfile();
  });

  const profileDialog = app.homePage.profileDialog;

  await h(t).withLog('Then the team profile opened', async () => {
    await t.expect(profileDialog.exists).ok;
    await t.expect(await profileDialog.profileType).eql('team');
  });

  await h(t).withLog('And I close team profile', async () => {
    await profileDialog.clickCloseButton();
  });

  await h(t).withLog('When I enter group and click more menu again', async () => {
    await directMessagesSection.conversationEntryById(group.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then display "profile" button', async () => {
    await t.expect(headerMoreMenu.profile.withText('Profile').exists).ok();
  });

  await h(t).withLog('When I click "profile" button', async () => {
    await headerMoreMenu.openProfile();
  });

  await h(t).withLog('Then the group profile opened', async () => {
    await t.expect(profileDialog.exists).ok;
    await t.expect(await profileDialog.profileType).eql('group');
  });

  await h(t).withLog('And I close group profile', async () => {
    await profileDialog.clickCloseButton();
  });

  await h(t).withLog('When I enter 1:1 and click more menu again', async () => {
    await directMessagesSection.conversationEntryById(chat.glipId).enter();
    await conversationPage.openMoreButtonOnHeader();
  });

  await h(t).withLog('Then display "profile" button', async () => {
    await t.expect(headerMoreMenu.profile.withText('Profile').exists).ok();
  });

  await h(t).withLog('When I click "profile" button', async () => {
    await headerMoreMenu.openProfile();
  });

  await h(t).withLog('Then the 1:1 profile opened', async () => {
    await t.expect(profileDialog.exists).ok;
    await t.expect(await profileDialog.profileType).eql('chat');
  });
});
