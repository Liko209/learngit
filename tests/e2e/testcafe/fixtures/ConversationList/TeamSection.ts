/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-10-24 16:11:54
 * Copyright © RingCentral. All rights reserved.
 */
import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('ConversationList/TeamSection')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Team section display the conversation which the login user as one of the team member',
  ['P2', 'JPT-12', 'Team section']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();


    let teamId;
    await h(t).withLog('Given I have an extension with certain team', async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: `Team ${uuid()}`,
        members: [loginUser.rcId, users[5].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can find the team in Teams section', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await t
        .expect(app.homePage.messageTab.teamsSection.conversationEntryById(teamId).exists)
        .ok(teamId, { timeout: 5e3 });
    }, true);

    //TODO: other steps follow Einstein case.
  },
);

test(formalName('Each conversation should be represented by the team name.',
  ['P0', 'JPT-13', 'Team section',]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[7];
    await h(t).platform(loginUser).init();
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).resetProfileAndState();

    const teamName = `Team ${uuid()}`;

    let teamId, newName;
    await h(t).withLog(`Given I have an extension with certain team named ${teamName}`, async () => {
      teamId = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Team',
        name: teamName,
        members: [loginUser.rcId, users[5].rcId],
      });
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can find the team by name in Teams section', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await t
        .expect(teamsSection.conversationEntryByName(teamName).exists)
        .ok(teamName, { timeout: 5e3 });
    }, true);

    await h(t).withLog('hen I modify the team name', async () => {
      newName = `New Name ${uuid()}`;
      await h(t).glip(loginUser).updateGroup(teamId, { set_abbreviation: newName });
    });

    await h(t).withLog('Then I should find the team by new name in Teams section', async () => {
      const teamsSection = app.homePage.messageTab.teamsSection;
      await teamsSection.expand();
      await t
        .expect(teamsSection.conversationEntryByName(newName).exists)
        .ok(newName, { timeout: 5e3 });
    }, true);
  },
);

test(formalName('Conversation that received post should be moved to top', ['JPT-47', 'P2', 'Chris.Zhan', 'ConversationList']), async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[7];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).resetProfileAndState();

  let teamOneId, teamTwoId;
  await h(t).withLog('Given I have an extension with two teams', async () => {
    const meChatId = await h(t).glip(loginUser).getPerson().then(res => res.data.me_group_id);
    await h(t).glip(loginUser).setLastGroupId(meChatId); // see https://jira.ringcentral.com/browse/FIJI-3008
    teamOneId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `Team 1 ${uuid()}`,
      members: [loginUser.rcId, users[5].rcId],
    });

    teamTwoId = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: `Team 2 ${uuid()}`,
      members: [loginUser.rcId, users[5].rcId],
    });
  });

  await h(t).withLog('Send a new post to team1', async () => {
    await h(t).platform(loginUser).sendTextPost('test move team to top', teamOneId);
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('Then I can find team1 on the top of Team section', async () => {
    await teamsSection.expand();
    await teamsSection.nthConversationEntry(0).groupIdShouldBe(teamOneId);
  }, true);

  await h(t).withLog('When send a new post to team2', async () => {
    await h(t).platform(loginUser).sendTextPost('test move team to top', teamTwoId);
  });

  await h(t).withLog('Then I can find team2 on the top of Team section', async () => {
    await teamsSection.nthConversationEntry(0).groupIdShouldBe(teamTwoId);
  }, true);
});

test(formalName('Can expand and collapse the team section by clicking the section name.',
  ['JPT-11', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const loginUser = h(t).rcData.mainCompany.users[0];

    await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
      })

    let teamSection = app.homePage.messageTab.teamsSection;
    await h(t).withLog('Then Team section should be expanded by default', async () => {
      await t.expect(teamSection.isExpand).ok();
    });

    const teamSectionName = teamSection.toggleButton.child().withExactText('Teams');
    await h(t).withLog('When I click the team section name', async () => {
      await t.click(teamSectionName);
    });
    await h(t).withLog('Then the team section should be collapsed.', async () => {
      await t.expect(teamSection.isExpand).notOk();
    });

    await h(t).withLog('When I click the team section name again', async () => {
      await t.click(teamSectionName);
    });

    await h(t).withLog('Then the team section should be expanded.', async () => {
      await t.expect(teamSection.isExpand).ok();
    });
  }
);