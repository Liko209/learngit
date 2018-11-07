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
import { SITE_URL } from '../../config';
import { GlipSdk } from '../../v2/sdk/glip';

fixture('ConversationList/TeamSection')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Team section display the conversation which the login user as one of the team member',
['P2', 'JPT-12', 'Team section']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    let team;
    await h(t).withLog('Given I have an extension with certain team', async () => {
      team = await user.sdk.platform.createGroup({
        type: 'Team',
        name: uuid(),
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('And the team should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${team.data.id}`]: false,
      });
    }); 
    
    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${ user.extension }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can find the team in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t
        .expect(app.homePage.messagePanel.teamsSection.conversationByIdEntry(team.data.id).self.exists)
        .ok(team.data.id, { timeout: 5e3 });
    }, true);

    //TODO: other steps follow Einstein case.
  },
);

test(formalName('Each conversation should be represented by the team name.',
  ['P0', 'JPT-13', 'Team section',]),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);
    const randomTeamName = uuid();
    
    let team, newName;
    await h(t).withLog(`Given I have an extension with certain team named ${randomTeamName}`, async () => {
      team = await user.sdk.platform.createGroup({
        type: 'Team',
        name: randomTeamName,
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('And the team should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${team.data.id}`]: false,
      });
    });

    await h(t).withLog( `When I login Jupiter with this extension: ${user.company.number}#${ user.extension }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('Then I can find the team by name in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t
        .expect(teamsSection.conversationByNameEntry(randomTeamName).self.exists)
        .ok(randomTeamName,{ timeout: 5e3 });
    }, true);

    await h(t).withLog('hen I modify the team name', async () => {
      newName = `New Name ${uuid()}`;
      await user.sdk.glip.updateGroup(team.data.id, { set_abbreviation: newName });
    });

    await h(t).withLog('Then I should find the team by new name in Teams section', async () => {
      const teamsSection = app.homePage.messagePanel.teamsSection;
      await teamsSection.expand();
      await t
        .expect(teamsSection.conversationByNameEntry(newName).self.exists)
        .ok(newName, { timeout: 5e3 });
    }, true,);
  },
);

test(
  formalName('Conversation that received post should be moved to top',
  ['JPT-47', 'P2', 'ConversationList']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);

    let team1, team2;
    await h(t).withLog('Given I have an extension with two teams', async () => {
      team1 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `1 ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });

      team2 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: `2 ${uuid()}`,
        members: [user.rcId, users[5].rcId],
      });
    });

    await h(t).withLog('And the team should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${team1.data.id}`]: false,
        [`hide_group_${team2.data.id}`]: false,
      });
    });

    await h(t).withLog('Send a new post to team1', async () => {
      await user.sdk.platform.createPost(
        { text: 'test move team to top' },
        team1.data.id,
      );
    });

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${ user.extension }`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    const teamsSection = app.homePage.messagePanel.teamsSection;
    await h(t).withLog('Then I can find team1 on the top of Team section', async () => {
      await teamsSection.expand();
      await t
        .expect(teamsSection.conversations.nth(0).getAttribute('data-group-id'))
        .eql(team1.data.id);
    }, true);

    await h(t).withLog('When send a new post to team2', async () => {
      await user.sdk.platform.createPost(
        { text: 'test move team to top' },
        team2.data.id,
      );
    });

    await h(t).withLog('Then I can find team2 on the top of Team section', async () => {
      await teamsSection.expand();
      await t.wait(1e3);
      await t
        .expect(teamsSection.conversations.nth(0).getAttribute('data-group-id'))
        .eql(team2.data.id);
    }, true);
  },
);
