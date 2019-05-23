import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from "uuid"
import { IGroup } from '../../v2/models';

fixture('ContentPanel/UpdateFiles')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and shared files then update it', ['P2', 'Messages', 'ContentPanel', 'UpdateFiles', 'V1.4', 'hank.huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[6];
  const team = <IGroup>{
    name: `H-${uuid()}`,
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

  const conversationPage = app.homePage.messageTab.conversationPage;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;

  await h(t).withLog('When I open the created team conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
  });
  await h(t).withLog('And I upload a picture as attachment and send it', async () => {
    const file = '../../sources/files/1.jpg';
    await conversationPage.uploadFilesToMessageAttachment(file);
    await t.pressKey('enter');
  });
  await h(t).withLog('And I upload a duplicate picture as attachment and send it', async () => {
    const posts = conversationPage.posts;
    const file2 = '../../sources/files1/1.jpg';
    await t.expect(posts.nth(0).find('img').exists).ok();
    await conversationPage.uploadFilesToMessageAttachment(file2);
  });
  await h(t).withLog('Then "update files" page should be displayed', async () => {
    await t.expect(duplicatePromptPage.duplicateCancelButton.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_UpdateFiles' });

  await h(t).withLog('When I click "update" button on "update files" page', async () => {
    await duplicatePromptPage.clickUpdateButton();
    await t.expect(duplicatePromptPage.duplicateUpdateButton.exists).notOk();
    await t.pressKey('enter');
  });
  await h(t).withLog('Then text "uploaded version" should be displayed', async () => {
    await t.expect(conversationPage.fileNotification.nth(1).exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_UpdateVersion' });
});
