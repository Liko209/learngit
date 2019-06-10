import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { v4 as uuid } from "uuid"
import { IGroup } from "../../v2/models";
import { h } from "../../v2/helpers";

fixture('ContentPanel/ShareEvent')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and shared event', ['P2', 'Messages', 'ContentPanel', 'ShareEvent', 'V1.4', 'hanny.han']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  await h(t).glip(loginUser).init();

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser]
  };

  await h(t).withLog(`Given I have a team conversation:"${team.name}"`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog('And I open the created team conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
    await app.homePage.messageTab.conversationPage.waitUntilPostsBeLoaded();
  });

  let eventId;
  await h(t).withLog('When I create one event via api', async () => {
    const resp = await h(t).glip(loginUser).createSimpleEvent({ groupIds: team.glipId, title: uuid() });
    eventId = resp.data._id;
  });

  const eventUpdateLocation = 'New Location';
  await h(t).withLog('And I update event via api', async () => {
    await h(t).glip(loginUser).updateEvent(eventId, {
      location: eventUpdateLocation,
    });
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ShareEventUpdate' });
});
