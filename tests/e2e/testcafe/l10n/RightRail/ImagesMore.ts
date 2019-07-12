import { setupCase, teardownCase } from "../../init";
import { BrandTire, SITE_URL } from "../../config";
import { formalName } from "../../libs/filter";
import { AppRoot } from "../../v2/page-models/AppRoot";
import { h } from "../../v2/helpers";
import { v4 as uuid } from 'uuid';
import { IGroup } from "../../v2/models";

fixture('RightRail/ImagesMore')
.beforeEach(setupCase(BrandTire.RCOFFICE))
.afterEach(teardownCase());
test(formalName('Image files display more button on the right rail', ['P2', 'Messages', 'RightRail', 'ImagesMore', 'V1.5', 'Hanny.Han']), async(t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];

  const team = <IGroup> {
    name: uuid(),
    type: "Team",
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have a team named: ${team.name}`, async() => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number} # ${loginUser.extension}`, async() => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamPage = app.homePage.messageTab.teamsSection;
  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('When I open a team and send messages with a image', async() => {
    await teamPage.conversationEntryById(team.glipId).enter();
    const file = '../../sources/files1/1.jpg';
    await conversationPage.uploadFilesToMessageAttachment(file);
    await t.pressKey('enter');
  });

  const rightRail = app.homePage.messageTab.rightRail;
  const imagesTab = rightRail.imagesTab;
  const viewerDialog = app.homePage.viewerDialog;

  await h(t).withLog('And I click images tab on the right rail', async() => {
    if(await rightRail.foldStatusButtonByClass.exists) {
      await rightRail.clickFoldStatusButton();
    }
    await rightRail.imagesEntry.enter();
    await t.expect(imagesTab.items.exists).ok();
  });
  const imageTab = app.homePage.messageTab.rightRail.imagesTab;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const imagePreviewer = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('And I open image item and click more button', async() => {

    await t.click(imageTab.nthItem(0).imageThumbnail)
    await t.click(imagePreviewer.moreButton);
  });
  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_ImagesMoreList'});

  await h(t).withLog('When I click rename file button and show rename file dialog', async() => {
    await moreActionOnFile.clickRenameFileMenu();
  });
  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_RenameFile'});

  const renameFileDialog = moreActionOnFile.renameFileDialog;
  await h(t).withLog('When I cancel rename file', async() => {
    await renameFileDialog.clickCancelButton();
  });

  await h(t).withLog('And click more button and click delete file button', async() => {
    await t.click(imagePreviewer.moreButton);
    await moreActionOnFile.clickDeleteFile();
  });

  await h(t).log('Then I capture a screenshot',{screenshotPath:'Jupiter_RightRail_DeleteFile'});
});
