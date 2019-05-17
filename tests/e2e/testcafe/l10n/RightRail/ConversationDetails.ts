import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from "uuid"

fixture('RightRail/ConversationDetails')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase())
test(formalName('Conversation Details on the right rail', ['P2', 'RightRail', 'ConversationDetails', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  const teamName = `H-Team ${uuid()}`;
  let teamID: string;

  await h(t).withLog(`Given I have a team conversation: "${teamName}"`, async () => {
    teamID = await h(t).platform(loginUser).createAndGetGroupId({
      type: 'Team',
      name: teamName,
      members: [loginUser.rcId, otherUser.rcId],
    });
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog('When I open the created team conversation and hover "More" icon on right rail', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(teamID).enter();
    await t.hover(rightRail.moreButton);
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_MoreIcon' });

  await h(t).withLog('When I click "More" icon on right rail', async () => {
    await t.click(rightRail.moreButton);
  });
  await h(t).withLog('And "More" list should be displayed',async () => {
    await t.expect(rightRail.eventsEntry.exists).ok();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_MoreList' });

  await h(t).withLog('When I hover "Hide detail" icon on right rail', async () => {
    await t.hover(rightRail.expandStatusButton);
  });
  await h(t).withLog('And text "Hide details" should be displayed', async () => {
    await t.expect(rightRail.foldStatusButton.exists).notOk();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_HideDetails' });

  await h(t).withLog('When I click "Hide details" button and hover "Show details" button on right rail', async () => {
    await rightRail.fold();
    await t.hover(rightRail.foldStatusButton);
  });
  await h(t).withLog('And text "Show details" should be displayed', async () => {
    await t.expect(rightRail.expandStatusButton.exists).notOk();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_ShowDetails' });
});
