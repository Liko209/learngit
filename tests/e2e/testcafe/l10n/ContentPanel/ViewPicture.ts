import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from "uuid"
import { IGroup } from '../../v2/models';

fixture('ContentPanel/ViewPicture')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and shared a picture then view it', ['P2', 'Messages', 'ContentPanel', 'ViewPicture', 'V1.4', 'hank.huang']), async (t) => {
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

  const imagePreviewer = app.homePage.fileAndImagePreviewer;
  const conversationPage =app.homePage.messageTab.conversationPage;

  await h(t).withLog('When I send two picture  and click the image', async () => {
    const posts = conversationPage.posts;
    const file = '../../sources/1.png';
    const file2 = '../../sources/2.png'
    await conversationPage.uploadFilesToMessageAttachment(file);
    await t.pressKey('enter');
    await conversationPage.uploadFilesToMessageAttachment(file2)
    await t.pressKey('enter')
    await t.expect(posts.nth(0).find('img').exists).ok();
    await t.click(posts.nth(0).find('img'));
  });
  await h(t).withLog('And I hover the image and hover "Scale file Down"', async () => {
    await imagePreviewer.hoverZoomOutButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ScaleFiledDown' });

  await h(t).withLog('When I hover the image and hover "Scale file Up"', async () => {
    await imagePreviewer.hoverZoomInButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ScaleFiledUp' });

  await h(t).withLog('When I hover "view next file" button', async () => {
    const imagePreviewer = app.homePage.fileAndImagePreviewer;
    await imagePreviewer.hoverForwardButton();
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ViewPreviousFile' });
  await h(t).withLog('When I click "view next file" button and hover "view previous file" button', async () => {
    const imagePreviewer = app.homePage.fileAndImagePreviewer;
    await imagePreviewer.clickForwardButton();
    await imagePreviewer.hoverPreviousButton()
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_ViewNextFile' });

  const downloadButton = app.homePage.fileAndImagePreviewer.downloadIcon;

  await h(t).withLog('When I hover "download" button', async () => {
    await t.hover(downloadButton);
  });
  await h(t).withLog('Then "download" button should be displayed', async () => {
    await t.expect(downloadButton.exists).ok();
  });
  await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_ContentPanel_Download' });
});
