import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";

fixture('RightRail')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Tasks display on the right rail', ['P2', 'Messages', 'RightRail', 'V1.4', 'Lorna.Li']),async(t)=>{
  const loginUser = h(t).rcData.mainCompany.users[4];
  const taskTitle = uuid();
  await h(t).glip(loginUser).init();

  let team = <IGroup>{
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: ${team.name}`, async()=>{
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number} # ${loginUser.extension}`, async async=>{
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  const teamPage = app.homePage.messageTab.teamsSection;

  await h(t).withLog('When I open a team and click Images Tab', async()=>{
    await teamPage.conversationEntryById(team.glipId).enter();
    await rightRail.tasksEntry.enter();
    await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_TasksEmpty'});
  });

    await h(t).withLog('When I create a task via api', async()=>{
      await h(t).glip(loginUser).createSimpleTask(team.glipId, loginUser.rcId, taskTitle);
      await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_TasksList'});
    })
});
