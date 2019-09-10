import { setupCase, teardownCase } from '../../init';
import { BrandTire, SITE_URL } from '../../config';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('RightRail/ConversationDetails')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

  //Update Hank.Huang' V1.4 to Hanny.han V1.7
test(
  formalName('Conversation details on the right rail', ['P2', 'Messages', 'RightRail', 'ConversationDetails', 'V1.4', 'V1.7', 'Hanny.Han',]),async t => {

    const users=h(t).rcData.mainCompany.users;
    const loginUser = users[5];
    const guestUser =  h(t).rcData.guestCompany.users;
    const guestUser1 = guestUser[0];
    const app = new AppRoot(t);

    let team = <IGroup>{
      name: `publicTeamWithMe${uuid()}`,
      type: "Team",
      owner: loginUser,
      members: [loginUser, guestUser1]
    }

    await h(t).withLog(`Given I have a team conversation: "${team.name}"`,async () => {
        await h(t).scenarioHelper.createTeam(team);
    });
    await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });

    const rightRail = app.homePage.messageTab.rightRail;
    await h(t).withLog('When I open the created team conversation and hover "Add team members" icon on right rail',async () => {
        const teamsSection = app.homePage.messageTab.teamsSection;
        await teamsSection.conversationEntryById(team.glipId).enter();
        await t.hover(rightRail.memberListSection.addMemberButton);
    });
    await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_RightRail_AddTeamMembersIcon'});

    await h(t).withLog('When I hover "More" icon on right rail',async () => {
        await rightRail.hoverMoreButton();
    });
    await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_RightRail_MoreIcon'});

    await h(t).withLog('When I click "More" icon on right rail', async () => {
      await rightRail.clickMoreButton();
    });
    await h(t).withLog('And "More" list should be displayed', async () => {
      await t.expect(rightRail.eventsEntry.exists).ok();
    });
    await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_RightRail_MoreList'});

    await h(t).withLog('When I hover "Hide detail" icon on right rail',async () => {
        await rightRail.clickMoreButton();
        await rightRail.hoverExpandStatusButton();
    });
    // await h(t).withLog('And text "Hide details" should be displayed', async () => {
    //   await t.expect(rightRail.expandStatusButton.exists).ok();
    // });
    await h(t).log('Then I take screenshot', {screenshotPath: 'Jupiter_RightRail_HideDetails'});

    await h(t).withLog(
      'When I click "Hide details" button and hover "Show details" button on right rail',
      async () => {
        await rightRail.clickExpandStatusButton();
        await rightRail.hoverFoldStatusButton();
      },
    );
    // await h(t).withLog('And text "Show details" should be displayed', async () => {
    //   await t.expect(rightRail.foldStatusButton.exists).ok();
    // });
    await h(t).log('Then I take screenshot', {
      screenshotPath: 'Jupiter_RightRail_ShowDetails',
    });
  },
);
