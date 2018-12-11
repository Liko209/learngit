import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('ConversationList/OpenConversation')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Should remains where it is when click a conversation in the conversation list.', ['P2', 'JPT-464', 'ConversationList', 'Yilia Hong']),
async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[7];
    user.sdk = await h(t).getSdk(user);
    const teamName1 = `Team 1 ${uuid()}`;
    const teamName2 = `Team 2 ${uuid()}`
    const teamsSection = app.homePage.messageTab.teamsSection;

    let team1, team2;
    await h(t).withLog('Given I have an extension with two conversation', async () => {
      team1 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: teamName1,
        members: [user.rcId, users[5].rcId],
      });

      team2 = await user.sdk.platform.createGroup({
        type: 'Team',
        name: teamName2,
        members: [user.rcId, users[6].rcId],
      });
    });

    await h(t).withLog('And the team should not be hidden before login', async () => {
      await user.sdk.glip.updateProfile(user.rcId, {
        [`hide_group_${team1.data.id}`]: false,
        [`hide_group_${team2.data.id}`]: false,
      });
    });
    
    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${ user.extension }`, async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I open the second conversation 2', async () => {
        await teamsSection.expand();
        await teamsSection.conversationEntryById(team1.data.id).enter();
    });

    await h(t).withLog('Then the conversation 2 still remain in the second', async () => {
        await teamsSection.nthConversationEntry(1).nameShouldBe(teamName1);
    });

    await h(t).withLog('When I refresh page', async () => {
        await h(t).refresh();
        await app.homePage.ensureLoaded();
    });

    await h(t).withLog('Then the conversation 2 display in the top', async () => {
        await teamsSection.nthConversationEntry(0).nameShouldBe(teamName1);
    });
  },
);

