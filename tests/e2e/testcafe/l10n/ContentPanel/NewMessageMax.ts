import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/NewMessageMax')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Send a message with more than 10000 characters', ['P2', 'Messages', 'ContentPanel', 'V1.4', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  let postContent: string = 'Long Message ';
  for(let i = 0; i < 1000; i++){
    postContent += '1234567890';
  }

  let team = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given have an extension with a team`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats([team]);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog(`When I enter a conversation`, async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`And send a message with more than 10000 characters`, async () => {
    await conversationPage.sendMessage(postContent, { paste: true });
  });

  await h(t).withLog(`Then I can see alert message`, async () => {
    //TBD
    //This step is to check whether the alert appears, need dev to add data-test-automation-id for the alert
  })

  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_ContentPanel_SendMessageMax'})
})
