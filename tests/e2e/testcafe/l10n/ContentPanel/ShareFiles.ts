import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from "uuid"
import { IGroup } from '../../v2/models';

fixture('ContentPanel/ShareFiles')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and shared files', ['P2', 'Messages', 'ContentPanel', 'ShareFiles', 'V1.4', 'hank.huang']), async (t) => {
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
  await h(t).withLog('When I open the created team conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.conversationEntryById(team.glipId).enter();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const duplicatePromptPage = app.homePage.messageTab.duplicatePromptPage;

  await h(t).withLog('And I upload a picture as attachment and send it', async () => {
    const file = '../../sources/files1/1.jpg';
    await conversationPage.uploadFilesToMessageAttachment(file);
    await t.pressKey('enter');
  });
  await h(t).withLog('Then text "shared a file" should be displayed', async () => {
    await t.expect(conversationPage.fileNotification.nth(0).exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_SharedAFile' });

  await h(t).withLog('When I upload more than two pictures as attachments and send them', async () => {
    const files = ['../../sources/1.png', '../../sources/2.png', '../../sources/files/1.jpg']
    await conversationPage.uploadFilesToMessageAttachment(files);
    await duplicatePromptPage.clickUpdateButton();
    await t.pressKey('enter');
    await t.pressKey('enter');
  });
  await h(t).withLog('Then text "shared 3 files" should be displayed', async () => {
    await t.expect(conversationPage.fileNotification.nth(1).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_SharedThreeFiles' });
});
