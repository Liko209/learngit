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


test(formalName('Show massage draft when refreshing App', ['P2', 'JPT-2360']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  const msg = uuid();

  await h(t).withLog('Given I have a extension that has at least 1 team', async (step) => {
    const oldTeams: any[] = await h(t).glip(loginUser).getTeams().then(res => res.data.teams
      .filter(team => !team.is_archived && !team.deactivated && !!team.members));
    if (oldTeams.length == 0) {
      let team = <IGroup>{
        type: "Team",
        name: uuid(),
        owner: loginUser,
        members: [loginUser],
      };
      await h(t).scenarioHelper.createTeam(team)
    }
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });;

  const teamSection = app.homePage.messageTab.teamsSection;
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  await h(t).withLog(`When I enter first conversation to type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await teamSection.nthConversationEntry(0).enter();
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I refresh App', async () => {
    await h(t).reload();
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then I can find input field still is ${msg}`, async () => {
    await t.expect(teamSection.nthConversationEntry(0).hasDraftMessage).notOk();
    await t.expect(inputField.textContent).eql(msg);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-139'],
  keywords: ['draft'],
  maintainers: ['isaac.liu', 'potar']
})('Check can mark draft icon in the conversation list when a conversation has the draft message', async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[4];
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I am a member of a team named: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
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

  await h(t).withLog(`When I type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await t.typeText(inputField, msg, { replace: true, paste: true })
  }, true);

  await h(t).withLog('Then The text/files displayed in the input box', async () => {
    await t.expect(conversationPage.messageInputArea.textContent).eql(msg);
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When I enter the team', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then The text/files still in the input box', async () => {
    await t.expect(conversationPage.messageInputArea.textContent).eql(msg);
  });

  await h(t).withLog('When I press "enter" to send post', async () => {
    await t.pressKey("enter");
  });

  await h(t).withLog('Then the input box is clear', async () => {
    await t.expect(conversationPage.messageInputArea.textContent).eql('');
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then there is not "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).notOk();
  });

  // file
  const filePath = '../../sources/1.txt';
  const filename = '1.txt';

  await h(t).withLog('When I enter the team', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog(`select file in the attachment area`, async () => {
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);

  await h(t).withLog('Then there is "{filename}" in the attachment area', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  await h(t).withLog('When I enter the team', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog('Then The text/files still in the input box', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
  });

  await h(t).withLog('When I press "enter" to send post', async () => {
    await t.pressKey("enter");
  });

  await h(t).withLog('Then the input box is clear', async () => {
    await t.expect(conversationPage.fileNamesOnMessageArea.exists).notOk();
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then there is not "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).notOk();
  });
});

test(formalName(`Check shouldn't mark draft icon in the conversation list when remove/archived team or can't send the message in a team`, ['P2', 'JPT-1372', 'Potar.He', 'Draft']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const adminUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: adminUser,
    members: [loginUser, adminUser]
  }

  await h(t).withLog(`Given I am a member of a team named: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
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
  await h(t).withLog(`When I type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await t.typeText(inputField, msg, { replace: true, paste: true })
  }, true);

  await h(t).withLog('And I enter other conversation(meChat)', async () => {
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

  await h(t).withLog('Then "{msg}" in the input box', async (step) => {
    step.setMetadata('msg', msg);
    await t.expect(inputField.textContent).eql(msg);
  });

  // remove from team
  await h(t).withLog(`When I type message "{msg}" (replace)`, async (step) => {
    step.setMetadata('msg', msg);
    await t.typeText(inputField, msg, { replace: true, paste: true })
  }, true);

  await h(t).withLog('And I enter other conversation(meChat)', async () => {
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

  await h(t).withLog('Then "{msg}" in the input box', async (step) => {
    step.setMetadata('msg', msg);
    await t.expect(inputField.textContent).eql(msg);
  });

  // archive team
  await h(t).withLog(`When I type message "{msg}" (replace)`, async (step) => {
    step.setMetadata('msg', msg);
    await t.typeText(inputField, msg, { replace: true, paste: true })
  }, true);

  await h(t).withLog('And I enter other conversation(meChat)', async () => {
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

  await h(t).withLog('Then "{msg}" in the input box', async (step) => {
    step.setMetadata('msg', msg);
    await t.expect(inputField.textContent).eql(msg);
  });

  //file
  const filePath = '../../sources/1.txt';
  const filename = '1.txt';

  // team post permission
  await h(t).withLog(`When I select a file "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);

  await h(t).withLog('And I enter other conversation(meChat)', async () => {
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

  await h(t).withLog('Then there is "{filename}" in the attachment area', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
  });

  // remove from team

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

  await h(t).withLog('Then there is "{filename}" in the attachment area', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
  });

  // archive team
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

  await h(t).withLog('Then there is "{filename}" in the attachment area', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
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

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamSection = app.homePage.messageTab.teamsSection;
  const conversation1 = teamSection.conversationEntryById(team1.glipId);
  const conversation2 = teamSection.conversationEntryById(team2.glipId);
  await h(t).withLog('Then I can check conversation A and B exist', async () => {
    await teamSection.expand();

    await t.expect(conversation1.exists).ok({ timeout: 10e3 });
    await t.expect(conversation2.exists).ok({ timeout: 10e3 });
  });

  const msg = uuid();
  const inputField = app.homePage.messageTab.conversationPage.messageInputArea;
  const url = new URL(SITE_URL)
  const Conversation1_URL = `${url.origin}/messages/${team1.glipId}`;
  await h(t).withLog(`When I enter conversation A to type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
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
    await conversation1.hoverSelf();
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

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

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
  await h(t).withLog(`And I enter conversation A to type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await conversation1.enter();
    await t.typeText(inputField, msg)
  }, true);

  await h(t).withLog('When I enter conversation B', async () => {
    await conversation2.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of Conversation A name', async () => {
    await t.expect(conversation1.hasDraftMessage).ok();
  });

  await h(t).withLog(`When I re-login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
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

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

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
  await h(t).withLog(`When I enter conversation A to type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await conversation1.enter();
    await t.typeText(inputField, msg);
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


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1935'],
  maintainers: ['Potar.He'],
  keywords: ['draft']
})('Show the draft icon and draft when admin restore the permission of post message', async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  const adminUser = users[5];
  await h(t).glip(loginUser).init();
  await h(t).glip(adminUser).init();

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: adminUser,
    members: [loginUser, adminUser]
  }

  await h(t).withLog(`Given I am a member of a team named: {teamName}`, async (step) => {
    step.setMetadata('teamName', team.name);
    await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });;

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
  await h(t).withLog(`When I type message "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await t.typeText(inputField, msg)
  }, true);

  let permissions;
  await h(t).withLog(`And the team admin change team permission that not allow member send message `, async () => {
    permissions = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data.permissions);
    permissions.user.level = 0;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then conversation page should be read only mode', async () => {
    await conversationPage.shouldBeReadOnly();
  });

  await h(t).withLog(`When the team admin change team permission that allow member send message`, async () => {
    permissions.user.level = 1;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then display draft message "{msg}" in the input box', async (step) => {
    step.setMetadata('msg', msg);
    await t.expect(inputField.textContent).eql(msg);
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

  //file
  const filePath = '../../sources/1.txt';
  const filename = '1.txt';

  // team post permission
  await h(t).withLog('When I enter the teem', async () => {
    await teamEntry.enter();
  });

  await h(t).withLog(`And I clear the input message field select a file "{msg}"`, async (step) => {
    step.setMetadata('msg', msg);
    await conversationPage.clearMessageInputField();
    await conversationPage.uploadFilesToMessageAttachment(filePath);
  }, true);

  await h(t).withLog(`And the team admin change team permission that not allow member send message `, async () => {
    permissions = await h(t).glip(adminUser).getGroup(team.glipId).then(res => res.data.permissions);
    permissions.user.level = 0;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then conversation page should be read only mode', async () => {
    await conversationPage.shouldBeReadOnly();
  });

  await h(t).withLog(`When the team admin change team permission that  allow member send message`, async () => {
    permissions.user.level = 1;
    await h(t).glip(adminUser).updateGroup(team.glipId, { permissions });
  });

  await h(t).withLog('Then there is "{filename}" in the attachment area', async (step) => {
    step.setMetadata('filename', filename);
    await t.expect(conversationPage.fileNamesOnMessageArea.withText(filename).exists).ok();
  });

  await h(t).withLog('When I enter other conversation(meChat)', async () => {
    await otherChatEntry.enter();
  });

  await h(t).withLog('Then I can find "Draft" icon on right of team name', async () => {
    await t.expect(teamEntry.hasDraftMessage).ok();
  });

});
