import {setupCase, teardownCase} from "../../init";
import {BrandTire, SITE_URL} from "../../config";
import {formalName} from "../../libs/filter";
import {AppRoot} from "../../v2/page-models/AppRoot";
import {h} from "../../v2/helpers";
import {IGroup} from "../../v2/models";
import {v4 as uuid} from 'uuid';

fixture('AtTeam')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Should minus the UMI if delete one team contains unread message', ['P2', 'JPT-1117']), async t => {
  const app = new AppRoot(t);
  const [admin, user1] = h(t).rcData.mainCompany.users.slice(4);

  const {teamA} = await preConditions({t, admin, user1});

  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamAConversation = teamsSection.conversationEntryById(teamA.glipId);

  await h(t).withLog(`When user1 login Jupiter with ${user1.company.number}#${user1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then the teamA should have 1 umi`, async () => {
    await teamAConversation.umi.shouldBeNumber(1);
  });

  await h(t).withLog(`When admin delete the teamA`, async () => {
    await h(t).scenarioHelper.deleteTeam(teamA, admin);
  });

  await h(t).withLog(`Then the UMI of section should have 0 umi`, async () => {
    await teamAConversation.umi.shouldBeNumber(0);
  });

  await h(t).withLog(`and the UMI of navigation panel Messages should have 0 umi`, async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(0);
  });
});

test(formalName('Should minus the UMI if archive one team contains unread message', ['P2', 'JPT-1134']), async t => {
  const app = new AppRoot(t);
  const [admin, user1] = h(t).rcData.mainCompany.users.slice(4);

  const {teamA} = await preConditions({t, admin, user1});

  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamAConversation = teamsSection.conversationEntryById(teamA.glipId);

  await h(t).withLog(`When user1 login Jupiter with ${user1.company.number}#${user1.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`Then the teamA should have 1 umi`, async () => {
    await teamAConversation.umi.shouldBeNumber(1);
  });

  await h(t).withLog(`When admin archive the teamA`, async () => {
    await h(t).scenarioHelper.archiveTeam(teamA, admin);
  });

  await h(t).withLog(`Then the UMI of section should have 0 umi`, async () => {
    await teamAConversation.umi.shouldBeNumber(0);
  });

  await h(t).withLog(`and the UMI of navigation panel Messages should have 0 umi`, async () => {
    await app.homePage.leftPanel.messagesEntry.umi.shouldBeNumber(0);
  });
});

test(formalName('Check UMI when receive @team message', ['P2', 'JPT-2619']), async t => {
  const app = new AppRoot(t);
  const [admin, user1, user2] = h(t).rcData.mainCompany.users.slice(4);

  let teamA = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: admin,
    members: [admin, user1, user2]
  };

  let teamB = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: admin,
    members: [admin, user1, user2]
  };

  await h(t).glip(admin).init();
  await h(t).glip(user1).init();

  await h(t).withLog('Given I have an extension with 2 teams', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA, teamB]);
  });

  await h(t).withLog('and clear all UMIs before login', async () => {
    await cleanUmi({t, user: admin});
    await cleanUmi({t, user: user1});
    await cleanUmi({t, user: user2});
  });

  await h(t).withLog('and turn on @team mention', async () => {
    await turnOnAtTeamMention({t, admin, team: teamA});
    await turnOnAtTeamMention({t, admin, team: teamB});
  });

  await h(t).withLog('and admin send one message with @team to the teamA', async () => {
    await sendOneMessageWithAtTeam({t, user: admin, team: teamA})
  });

  await h(t).withLog('and user1 send one message with @team to the teamB', async () => {
    await sendOneMessageWithAtTeam({t, user: user1, team: teamB})
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamAConversation = teamsSection.conversationEntryById(teamA.glipId);
  const teamBConversation = teamsSection.conversationEntryById(teamB.glipId);

  const login = async (user, description, logined: boolean) => {
    await h(t).withLog(`When ${description} login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: user.company.number,
        extension: user.extension,
      });
      if (logined) {
        await app.homePage.openSettingMenu();
        await app.homePage.settingMenu.clickLogout();
      }
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });
  };

  const expectResult = async (count1, count2) => {
    await h(t).withLog(`Then the teamA should have ${count1} umi`, async () => {
      await teamAConversation.umi.shouldBeNumber(count1);
    });

    await h(t).withLog(`Then the teamB should have ${count2} umi`, async () => {
      await teamBConversation.umi.shouldBeNumber(count2);
    });
  };

  await login(admin, 'admin', false);
  await expectResult(0, 1);

  await login(user1, 'user1', true);
  await expectResult(1, 0);

  await login(user2, 'user2', true);
  await expectResult(1, 1);
});

test(formalName('Should update @team UMI in Teams when mark conversations as read/unread', ['P2', 'JPT-2622']), async t => {
  const app = new AppRoot(t);
  const [admin, user1] = h(t).rcData.mainCompany.users.slice(4);

  let teamA = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: admin,
    members: [admin, user1]
  };

  await h(t).glip(admin).init();

  await h(t).withLog('Given I have an extension with one team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA]);
  });

  await h(t).withLog('and clear all UMIs before login', async () => {
    await cleanUmi({t, user: user1});
  });

  await h(t).withLog('and turn on @team mention', async () => {
    await turnOnAtTeamMention({t, admin, team: teamA});
  });

  await h(t).withLog('and admin send one message with @team to the team', async () => {
    await sendOneMessageWithAtTeam({t, user: admin, team: teamA})
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  const teamConversation = teamsSection.conversationEntryById(teamA.glipId);

  await h(t).withLog(`When user1 login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: user1.company.number,
      extension: user1.extension
    });
    await h(t).directLoginWithUser(SITE_URL, user1);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`and set the new message badge count to be "All new messages"`, async () => {
    await h(t).glip(user1).setNewMessageBadges('all');
  });

  await h(t).withLog(`Then the team should have 1 umi with orange color`, async () => {
    await teamConversation.umi.shouldBeNumber(1);
    await teamConversation.umi.shouldBeAtMentionStyle();
  });

  await h(t).withLog(`When mark the team as read`, async () => {
    await teamConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.clickSelf();
  });

  await h(t).withLog(`Then the team should have 0 umi`, async () => {
    await teamConversation.umi.shouldBeNumber(0);
  });

  await h(t).withLog(`When mark the team as unread`, async () => {
    await teamConversation.openMoreMenu();
    await app.homePage.messageTab.moreMenu.markAsReadOrUnread.clickSelf();
  });

  await h(t).withLog(`Then the team should have 1 umi`, async () => {
    await teamConversation.umi.shouldBeNumber(1);
  });
});

async function cleanUmi({t, user}) {
  await h(t).scenarioHelper.resetProfile(user);
  await h(t).scenarioHelper.clearAllUmi(user);
}

async function preConditions({t, admin, user1}) {
  let teamA = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: admin,
    members: [admin, user1]
  };

  await h(t).withLog('Given I have an extension with one team', async () => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA]);
  });

  await h(t).withLog('and clear all UMIs before login', async () => {
    await cleanUmi({t, user: admin});
    await cleanUmi({t, user: user1});
  });

  await h(t).withLog('and admin send one message with @team to the teamA', async () => {
    await sendOneMessageWithAtTeam({t, user: admin, team: teamA})
  });

  return {teamA}
}

async function sendOneMessageWithAtTeam({t, user, team}) {
  await h(t).withLog(`And the team has a post with @Team`, async () => {
    const text = `Hi all, <a class='at_mention_compose' rel='{"id":-1}'>@Team</a>`;
    await h(t).glip(user).sendPost(+team.glipId, text, {
      is_team_mention: true,
    });
  });
}

async function turnOnAtTeamMention({t, admin, team}) {
  const permissions = await h(t).glip(admin).getGroup(team.glipId).then(res => res.data.permissions);
  permissions.user.level = 47;
  await h(t).glip(admin).updateGroup(team.glipId, { permissions });
}
