/*
 * @Author: Mia.Cai
 * @Date: 2019-08-29 15:41:25
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('ContentPanel/ShareFile')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2786'],
  maintainers: ['Mia.cai'],
  keywords: ['ContentPanel/ShareFile']
})(`Can share a file to one conversation`, async (t) => {
  const shareFileMenu = 'Share file';
  const flashToast = 'File shared successfully.';
  const imageName = '1.png';
  const imagePath = './sources/1.png';
  const fileName = '2Pages.doc';
  const filePath = './sources/preview_files/2Pages.doc'
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team1 = <IGroup>{
    type: "Team",
    name: 'team1-' + uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  let team2 = <IGroup>{
    type: "Team",
    name: 'team2-' + uuid(),
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog(`Given I have 2 teams`, async () => {
    await h(t).scenarioHelper.createTeams([team1, team2]);
  });

  await h(t).withLog('And I send one image post and one file post in team1', async () => {
    await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: imagePath,
      group: team1,
      operator: loginUser,
    });
    await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
      filePaths: filePath,
      group: team1,
      operator: loginUser,
    });
  });

  await h(t).withLog('And I send one post in team2', async () => {
    await h(t).scenarioHelper.sendTextPost(
      'text',
       team2,
       loginUser,
    );
 });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const recentConversationDialog = app.homePage.recentConversationDialog;


  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open team1', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team1.glipId).enter();
  });

  const shareFileToTeam2 = async (useSearchText: boolean = false) => {
    await h(t).withLog(`And I click the ${shareFileMenu} menu of the file`, async () => {
      await moreActionOnFile.clickShareFileMenu();
    });

    await h(t).withLog(`Then will show the recent conversation dialog`, async () => {
      await recentConversationDialog.ensureLoaded();
    });

    await h(t).withLog(`When I select team2 (using search text: {useSearchText})`, async (step) => {
      step.setMetadata("useSearchText", useSearchText.toString());
      if (useSearchText) {
        await recentConversationDialog.enterNameInSearchBox(team2.name);
      }
      recentConversationDialog.clickConversationWithName(team2.name);
    });

    await h(t).withLog(`Then the dialog dismiss`, async () => {
      await recentConversationDialog.ensureDismiss();
    });

    await h(t).withLog(`And show a flash toast: {flashToast}`, async (step) => {
      step.initMetadata({ flashToast });
      await app.homePage.alertDialog.shouldBeShowMessage(flashToast);
    });
  }

  await h(t).withLog(`When I click the more button of the image (Entry1: conversation history)`, async () => {
    await t.hover(conversationPage.nthPostItem(0).imageCard);
    await conversationPage.nthPostItem(0).clickFileActionMoreButton();
  });

  await shareFileToTeam2();

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`When I click Files Tab on the right self(Entry2:right self)`, async () => {
    await rightRail.filesEntry.enter();
    await rightRail.filesEntry.shouldBeOpened();
  });

  await h(t).withLog(`And I hover the file item And click the more button of the file`, async () => {
    const filesTabItem = rightRail.filesTab.nthItem(0);
    await filesTabItem.hoverSelf();
    await filesTabItem.clickMore();
  });

  await shareFileToTeam2();

  const viewerDialog = app.homePage.fileAndImagePreviewer;
  await h(t).withLog('When I open the image view(Entry3:image viewer)', async () => {
    await t.click(conversationPage.nthPostItem(0).images)
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog(`And I click the more button of the viewer `, async () => {
    await viewerDialog.clickMoreButton();
  });

  await shareFileToTeam2();

  await h(t).withLog(`And I click the more button of the viewer `, async () => {
    await viewerDialog.clickCloseButton();
  });

  await h(t).withLog('When I click the file(Entry4:file viewer)', async () => {
    await t.click(conversationPage.nthPostItem(1).fileThumbnail);
    await viewerDialog.ensureLoaded();
  });

  await h(t).withLog(`And I click the more button of the viewer `, async () => {
    await viewerDialog.clickMoreButton();
  });

  await shareFileToTeam2(true);

  await h(t).withLog(`And I quit the viewer by Esc`, async () => {
    await t.pressKey('esc');
  });

  await h(t).withLog(`When I go to the team2`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team2.glipId).enter();
    await conversationPage.waitUntilPostsBeLoaded();
    await t.expect(conversationPage.posts.count).eql(5);
  }, true);

  await h(t).withLog(`Then the No.2 post should be the image`, async () => {
    await t.hover(conversationPage.nthPostItem(1).imageCard);
    await t.expect(conversationPage.nthPostItem(1).fileNames.withText(imageName)).ok();
  });

  await h(t).withLog(`And the No.3 post should be the file`, async () => {
    await t.expect(conversationPage.nthPostItem(2).fileNames.withText(fileName)).ok();
  });

  await h(t).withLog(`And the No.4 post should be the image`, async () => {
    await t.hover(conversationPage.nthPostItem(3).imageCard);
    await t.expect(conversationPage.nthPostItem(3).fileNames.withText(imageName)).ok();
  });

  await h(t).withLog(`And the No.5 post should be the file`, async () => {
    await t.expect(conversationPage.nthPostItem(4).fileNames.withText(fileName)).ok();
  });
});


