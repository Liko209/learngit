/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-10-12 13:23:57
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { h } from '../../v2/helpers';
import { v4 as uuid } from 'uuid';
import { SITE_URL, BrandTire } from '../../config';
import { setupCase, teardownCase } from '../../init';
import { ITestMeta, IGroup } from '../../v2/models';


fixture('MessageInput/draft')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Show massage draft when switching conversation', ['P0', 'JPT-139']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 group chat B', async () => {
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId]
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId, users[6].rcId]
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I can check conversation A and B exist', async () => {
      await teamSection.expand();
      conversation1 = teamSection.conversationEntryById(teamId1);
      conversation2 = teamSection.conversationEntryById(teamId2);
      await t.expect(conversation1.exists).ok({ timeout: 10e3 });
      await t.expect(conversation2.exists).ok({ timeout: 10e3 });
    });

    const msg = uuid();
    const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
    await h(t).withLog(`And I enter conversation A to type message "${msg}"`, async () => {
      await conversation1.enter();
      await t.typeText(inputField, msg)
    }, true);

    await h(t).withLog('When I enter conversation B', async () => {
      await conversation2.enter();
    });

    await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
      await t.expect(conversation1.hasDraftMessage).ok();
    });

    await h(t).withLog(`When I enter conversation A`, async () => {
      await conversation1.enter();
    });

    await h(t).withLog(`Then I can find input field still is ${msg}`, async () => {
      await t.expect(conversation1.hasDraftMessage).notOk();
      await t.expect(inputField.textContent).eql(msg);
    });
  });

test(formalName('Show massage draft when refreshing App', ['P2', 'JPT-2360']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 group chat B', async () => {
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId]
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId, users[6].rcId]
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I can check conversation A and B exist', async () => {
      await teamSection.expand();
      conversation1 = teamSection.conversationEntryById(teamId1);
      conversation2 = teamSection.conversationEntryById(teamId2);
      await t.expect(conversation1.exists).ok({ timeout: 10e3 });
      await t.expect(conversation2.exists).ok({ timeout: 10e3 });
    });

    const msg = uuid();
    const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
    await h(t).withLog(`And I enter conversation A to type message "${msg}"`, async () => {
      await conversation1.enter();
      await t.typeText(inputField, msg)
    }, true);

    await h(t).withLog('When I refresh App', async () => {
      await h(t).reload();
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog(`Then I can find input field still is ${msg}`, async () => {
      await t.expect(conversation1.hasDraftMessage).notOk();
      await t.expect(inputField.textContent).eql(msg);
    });
  });

test(formalName('Show massage draft if only has files when switching conversation', ['P2', 'JPT-139']),
  async (t) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();

    const filesPath1 = ['../../sources/1.txt'];
    let teamId1, teamId2, conversation1, conversation2;
    await h(t).withLog('Given I have an extension with 1 private chat A and 1 group chat B', async () => {
      teamId1 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId]
      });
      teamId2 = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId, users[6].rcId]
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    const teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then I can check conversation A and B exist', async () => {
      await teamSection.expand();
      conversation1 = teamSection.conversationEntryById(teamId1);
      conversation2 = teamSection.conversationEntryById(teamId2);
      await t.expect(conversation1.exists).ok({ timeout: 10e3 });
      await t.expect(conversation2.exists).ok({ timeout: 10e3 });
    });

    await h(t).withLog('And I enter conversation A to select file', async () => {
      await conversation1.enter();
      const { conversationPage } = app.homePage.messageTab;
      await conversationPage.uploadFilesToMessageAttachment(filesPath1);
    }, true);

    await h(t).withLog('When I enter conversation B', async () => {
      await conversation2.enter();
    });

    await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
      await t.expect(conversation1.hasDraftMessage).ok();
    });

    await h(t).withLog(`Then I send the message, "Draft" icon should not exist `, async () => {
      await conversation1.enter();
      const { conversationPage } = app.homePage.messageTab;
      const msg = uuid();
      await conversationPage.sendMessage(msg);
      await t.expect(conversation1.hasDraftMessage).notOk();
    });

    await h(t).withLog('When I enter conversation B, the "Draft" icon should not show on right of Conversation A', async () => {
      await conversation2.enter();
      await t.expect(conversation1.hasDraftMessage).notOk();
    });
  });

test(formalName(`Check shouldn't mark draft icon in the conversation list when remove/archived team or can't send the message in a team`, ['P2', 'JPT-1372', 'Potar.He', 'Draft']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const adminUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: adminUser,
    members: [loginUser, adminUser]
  }

  await h(t).withLog(`Given I am a member of a team named: ${team.name}`, async () => {
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const favoritesSection = app.homePage.messageTab.favoritesSection;

  const teamEntry = teamSection.conversationEntryById(team.glipId);
  const otherChatEntry = favoritesSection.nthConversationEntry(0);
  await h(t).withLog('And I enter the team', async () => {
    await teamSection.expand();
    await teamEntry.enter();
  });

  const msg = uuid();
  const conversationPage = app.homePage.messageTab.conversationPage;
  const inputField = conversationPage.messageInputArea;

  // team post permission
  await h(t).withLog(`When I type message "${msg}"`, async () => {
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  let permissions;
  await h(t).withLog(`When the team admin change team permission that not allow member send message `, async () => {
    permissions = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data.permissions);
    permissions.user.level = 0;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then I should find no "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).notOk();
  });

  await h(t).withLog(`When the team admin change team permission that  allow member send message`, async () => {
    permissions.user.level = 1;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('And I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the input box', async () => {
    await t.expect(inputField.textContent).eql("");
  });

  // remove from team
  await h(t).withLog(`When I type message "${msg}"`, async () => {
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When admin remove loginUser from the team', async () => {
    await h(t).glip(adminUser).removeTeamMembers(team.glipId, loginUser.rcId);
  });

  await h(t).withLog('Then the team dismiss', async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog('When admin add loginUser to the team', async () => {
    await h(t).glip(adminUser).addTeamMembers(team.glipId, loginUser.rcId);
  });
  await h(t).withLog('Then the team appear', async () => {
    await t.expect(teamEntry.exists).ok();
  });
  await h(t).withLog('When I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the input box', async () => {
    await t.expect(inputField.textContent).eql("");
  });

  // archive team
  await h(t).withLog(`When I type message "${msg}"`, async () => {
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When admin archive the team', async () => {
    await h(t).platform(adminUser).archiveTeam(team.glipId);
  });

  await h(t).withLog('Then the team dismiss', async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog('When admin unArchive the team', async () => {
    await h(t).platform(adminUser).unArchiveTeam(team.glipId);
  });
  await h(t).withLog('Then the team appear', async () => {
    await t.expect(teamEntry.exists).ok();
  });
  await h(t).withLog('When I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the input box', async () => {
    await t.expect(inputField.textContent).eql("");
  });

  //file

  const filePath = '../../sources/1.txt';

  // team post permission
  await h(t).withLog(`When I select a file "${msg}"`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog(`When the team admin change team permission that not allow member send message `, async () => {
    permissions = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data.permissions);
    permissions.user.level = 0;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then I should find no "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).notOk();
  });

  await h(t).withLog(`When the team admin change team permission that  allow member send message`, async () => {
    permissions.user.level = 1;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('And I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.exists).notOk();
  });

  // remove from team
  await h(t).withLog(`When I select a file "${msg}"`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);;

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When admin remove loginUser from the team', async () => {
    await h(t).glip(adminUser).removeTeamMembers(team.glipId, loginUser.rcId);
  });

  await h(t).withLog('Then the team dismiss', async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog('When admin add loginUser to the team', async () => {
    await h(t).glip(adminUser).addTeamMembers(team.glipId, loginUser.rcId);
  });
  await h(t).withLog('Then the team appear', async () => {
    await t.expect(teamEntry.exists).ok();
  });
  await h(t).withLog('When I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.exists).notOk();
  });;

  // archive team
  await h(t).withLog(`When I select a file "${msg}"`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When admin archive the team', async () => {
    await h(t).platform(adminUser).archiveTeam(team.glipId);
  });

  await h(t).withLog('Then the team dismiss', async () => {
    await t.expect(teamEntry.exists).notOk();
  });

  await h(t).withLog('When admin unArchive the team', async () => {
    await h(t).platform(adminUser).unArchiveTeam(team.glipId);
  });
  await h(t).withLog('Then the team appear', async () => {
    await t.expect(teamEntry.exists).ok();
  });
  await h(t).withLog('When I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then no data in the attachment area', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.exists).notOk();
  });
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1380'],
  keywords: ['Draft'],
  maintainers: ['Mia.Cai']
})('Check can mark draft icon in the conversation list when refresh or close tab', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let conversation1, conversation2;
  let team1 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog('Given I have an extension with 2 teams', async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
  });

  await h(t).withLog('And I set user skip_close_conversation_confirmation is true before login', async () => {
    await h(t).glip(loginUser).skipCloseConversationConfirmation(true);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can check conversation A and B exist', async () => {
    await teamSection.expand();
    conversation1 = teamSection.conversationEntryById(team1.glipId);
    conversation2 = teamSection.conversationEntryById(team2.glipId);
    await t.expect(conversation1.exists).ok({ timeout: 10e3 });
    await t.expect(conversation2.exists).ok({ timeout: 10e3 });
  });

  const msg = uuid();
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  const url = new URL(SITE_URL)
  const Conversation1_URL = `${url.protocol}//${url.hostname}/messages/${team1.glipId}`;
  await h(t).withLog(`When I enter conversation A to type message "${msg}"`, async () => {
    await conversation1.enter();
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I refresh the app`, async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I close the conversation A`, async () => {
    await conversation1.openMoreMenu();
    await app.homePage.messageTab.moreMenu.close.enter();
  });

  await h(t).withLog(`And I reopen the conversation A`, async () => {
    await t.navigateTo(Conversation1_URL);
  });

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-140'],
  keywords: ['Draft'],
  maintainers: ['Mia.Cai']
})(`Check shouldn't mark massage draft when log out app`, async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let conversation1, conversation2;
  let team1 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }


  await h(t).withLog('Given I have 2 teams', async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can check conversation A and B exist', async () => {
    await teamSection.expand();
    conversation1 = teamSection.conversationEntryById(team1.glipId);
    conversation2 = teamSection.conversationEntryById(team2.glipId);
    await t.expect(conversation1.exists).ok({ timeout: 10e3 });
    await t.expect(conversation2.exists).ok({ timeout: 10e3 });
  });

  const msg = uuid();
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  await h(t).withLog(`And I enter conversation A to type message "${msg}"`, async () => {
    await conversation1.enter();
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I re-login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await app.homePage.logoutThenLoginWithUser(SITE_URL, loginUser);
  });

  await h(t).withLog('Then no "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).notOk();
  });

  await h(t).withLog(`When I enter conversation A`, async () => {
    await conversation1.enter();
  });

  await h(t).withLog(`Then no message on the input field`, async () => {
    await t.expect(conversation1.hasDraftMessage).notOk();
    await t.expect(inputField.textContent).eql("");
  });

});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-149'],
  keywords: ['Draft'],
  maintainers: ['Mia.Cai']
})(`Check shouldn't mark draft icon in the conversation list when deleting the draft information`, async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let conversation1, conversation2;
  let team1 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    type: 'Team',
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have 2 teams', async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    },
  );

  const teamSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can check conversation A and B exist', async () => {
    await teamSection.expand();
    conversation1 = teamSection.conversationEntryById(team1.glipId);
    conversation2 = teamSection.conversationEntryById(team2.glipId);
    await t.expect(conversation1.exists).ok({ timeout: 10e3 });
    await t.expect(conversation2.exists).ok({ timeout: 10e3 });
  });

  // Entry1: with text messages
  const msg = uuid();
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  await h(t).withLog(`When I enter conversation A to type message "${msg}"`, async () => {
    await conversation1.enter();
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I enter conversation A`, async () => {
    await conversation1.enter();
  });

  await h(t).withLog(`And I delete the draft information`, async () => {
    await t.selectText(inputField).pressKey('delete');
  });

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then no "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).notOk();
  });

  // Entry2: with files
  const file = ['../../sources/1.txt'];
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`When I enter conversation A to select file in the attachment area`, async () => {
    await conversation1.enter();
    await conversationPage.uploadFilesToMessageAttachment(file);
  }, true);

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I enter conversation A`, async () => {
    await conversation1.enter();
  });

  await h(t).withLog('And I remove the file from the conversation', async () => {
    await conversationPage.removeFileOnMessageArea();
  });

  await h(t).withLog('And I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then no "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).notOk();
  });

});