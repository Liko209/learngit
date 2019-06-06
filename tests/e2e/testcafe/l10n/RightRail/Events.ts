import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { h } from '../../v2/helpers';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from "uuid"
import { IGroup } from "../../v2/models";

fixture('RightRail/Events')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Events display on the right rail', ['P2', 'Messages', 'RightRail', 'Events', 'V1.4', 'Hank.Huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const team = <IGroup> {
    name: `H-${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  };

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I have a team conversation: "${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;

  await h(t).withLog('When I open the created team conversation and open "Events" tab on right rail', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    const eventsEntry = rightRail.eventsEntry;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await rightRail.clickFoldStatusButton();
    await rightRail.openMore();
    await eventsEntry.enter();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_EventsEmpty' });

  await h(t).withLog(`When ${loginUser} create a note in the created team conversation` , async () =>{
    const eventTitle = `H-${uuid()}`;
    await h(t).glip(loginUser).createSimpleEvent({groupIds: team.glipId, title: eventTitle});
  });
  await h(t).withLog('And the text "Events" should be displayed', async () => {
    const listSubTitle = rightRail.listSubTitle;
    await t.expect(listSubTitle.exists).ok();
  });
  await h(t).log('Then I take screenshot' , { screenshotPath:'Jupiter_RightRail_EventsList' });
});
