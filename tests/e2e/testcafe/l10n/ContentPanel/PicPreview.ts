import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from "uuid"
import { IGroup } from '../../v2/models';

fixture('ContentPanel/PicPreview')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Open team conversation and send file/link', ['P2', 'Messages', 'PicPreview', 'V1.4', 'hank.huang']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[6];
  const otherUser = h(t).rcData.mainCompany.users[7];
  const team = <IGroup> {
    name: `H-${uuid()}`,
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).glip(loginUser).init();

  await h(t).withLog(`Given I have a team conversation: "${team.glipId}"`, async () => {
    await h(t).platform(loginUser).createTeam(team)

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

  await h(t).withLog('And I upload a picture as attachments and send it', async () => {
    const files = ['../../sources/1.png'];
    await conversationPage.uploadFilesToMessageAttachment(files);
    await t.pressKey('enter');
  });
  await h(t).withLog(`Then text "shared a file" should be displayed`, async () => {
    await t.expect(conversationPage.fileNotification.nth(0).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_SendAPicture' });

  await h(t).withLog('When I upload a duplicate picture as attachments and send it', async () => {
    const files = ['../../sources/1.png']
    await conversationPage.uploadFilesToMessageAttachment(files);
  });
  await h(t).withLog(`Then "update files" page should be displayed`, async () => {
    await t.expect(duplicatePromptPage.duplicateCancelButton.exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_UpdateFiles' });

  await h(t).withLog('When I click "update" button on "update files" page', async () => {
    await duplicatePromptPage.clickUpdateButton();
    await t.pressKey('enter');
  });
  await h(t).withLog(`Then text "uploaded version" should be displayed`, async () => {
    await t.expect(conversationPage.fileNotification.nth(1).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_UpdateVersion' });

  const imagePreviewer = app.homePage.fileAndImagePreviewer;

  await h(t).withLog('When I can find the image in post and click the image', async () => {
    const posts = app.homePage.messageTab.conversationPage.posts;
    await t.expect(posts.nth(-1).find('img').exists).ok();
    await t.click(posts.nth(-1).find('img'));
  });
  await h(t).withLog('And I hover the image and hover "Scale file Down"', async () => {
    await imagePreviewer.hoverZoomOutButton();
  });
  await h(t).log(`Then I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_ScaleFiledDown' });

  await h(t).withLog('When I hover the image and hover "Scale file Up"', async () => {
    await imagePreviewer.hoverZoomInButton();
  });
  await h(t).log(`Then I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_ScaleFiledUp' });

  await h(t).withLog('When I hover "view previous file" button', async () => {
    const imagePreviewer = app.homePage.fileAndImagePreviewer;
    await imagePreviewer.hoverPerviousButton();
  });
  await h(t).log(`Then I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_ViewPreviousFile' });
  await h(t).withLog('When I click "view previous file" button and hover "view next file" button' , async () => {
    const imagePreviewer = app.homePage.fileAndImagePreviewer;
    await imagePreviewer.clickPerviousButton();
    await imagePreviewer.hoverForwardButton();
  });
  await h(t).log(`Then I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_ViewNextFile' });

  const downloadButton = app.homePage.fileAndImagePreviewer.downloadIcon;

  await h(t).withLog('When I hover "download" button', async () => {
    await t.hover(downloadButton);
  });
  await h(t).withLog(`Then "download" button should be displayed`, async () => {
    await t.expect(downloadButton.exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_Download' });

  await h(t).withLog('When I upload more than two pictures as attachments and send them', async () => {
    const files = ['../../sources/1.png', '../../sources/2.png', '../../sources/files/1.jpg']
    await imagePreviewer.clickCloseButton();
    await conversationPage.uploadFilesToMessageAttachment(files);
    await duplicatePromptPage.clickUpdateButton();
    await t.pressKey('enter');
  });
  await h(t).withLog(`Then text "shared 3 files" should be displayed`, async () => {
    await t.expect(conversationPage.fileNotification.nth(2).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_SendThreePictures' });

  await h(t).withLog('When I send a link in the created team conversation ', async () => {
    await conversationPage.sendMessage("www.google.com");
  });
  await h(t).withLog(`Then text "shared a link" should be displayed`, async () => {
    await t.expect(conversationPage.fileNotification.nth(3).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_SendALink' });

  await h(t).withLog('When I send more than 2 links in the created team conversation ', async () => {
    await conversationPage.sendMessage("www.google.com www.google.com");
  });
  await h(t).withLog(`Then text "shared 2 links" should be displayed`, async () => {
    await t.expect(conversationPage.fileNotification.nth(4).exists).ok();
  });
  await h(t).log(`And I take screenshot`, { screenshotPath: 'Jupiter_ContentPanel_SendTwoLinks' });
});
