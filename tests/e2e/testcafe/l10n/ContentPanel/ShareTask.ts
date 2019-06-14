import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { IGroup } from "../../v2/models";
import { h } from "../../v2/helpers";
import { v4 as uuid } from "uuid"

fixture('ContentPanel/ShareTask')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and shared task', ['P2', 'Messages', 'ContentPanel', 'ShareTask', 'V1.4', 'hanny.han']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[4];
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

  const conversationPage = app.homePage.messageTab.conversationPage;
  let taskId;
  await h(t).withLog('When I create one Task via api', async () => {
    const resp = await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, uuid());
    taskId = resp.data._id;
  });

  await h(t).withLog('And I complete task via api', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_boolean: true,
    });
  });

  await h(t).withLog('And I incomplete task via api', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      complete_boolean: false,
    });
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ShareTask' });

  await h(t).withLog('When I reassigned task to another user via api', async () => {
    await h(t).glip(loginUser).updateTask(taskId, {
      assigned_to_ids: [otherUser.rcId],
    });
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ReassignedTask' });

  const filePath = './sources/1.png';
  const fileNames = '1.png';
  await h(t).withLog('When the team has a task with attachment', async () => {
    const fileId = await h(t).scenarioHelper.uploadFile({ filePath, name: fileNames, operator: loginUser }).then(res => res.data[0].id);
    await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, uuid(), {
      attachment_ids: [+fileId],
    });
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ShareTaskWithAttach' });

});
