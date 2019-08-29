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
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

  test.meta(<ITestMeta>{
    priority: ['P1'],
    caseIds: ['JPT-2786'],
    maintainers: ['Mia.cai'],
    keywords: ['ContentPanel/ShareFile']
  })(`Can share a file to one conversation`, async (t) => {
    const shareFileMenu = 'Share file';
    const flashToast = 'File shared successfully.';
    let filenames = ['2Pages.doc', '1.png'];
    const fp = ['./sources/preview_files/2Pages.doc','./sources/1.png'];
    const loginUser = h(t).rcData.mainCompany.users[4];

    let team1 = <IGroup>{
      type: "Team",
      name: 'team1'+uuid(),
      owner: loginUser,
      members: [loginUser]
    }
    let team2 = <IGroup>{
      type: "Team",
      name: 'team2'+uuid(),
      owner: loginUser,
      members: [loginUser]
    }
    let team3 = <IGroup>{
      type: "Team",
      name: 'team3'+uuid(),
      owner: loginUser,
      members: [loginUser]
    }
    let team4 = <IGroup>{
      type: "Team",
      name: 'team4'+uuid(),
      owner: loginUser,
      members: [loginUser]
    }
    let teams =[team1,team2,team3,team4]

    await h(t).withLog(`Given I have 4 teams`, async () => {
      await h(t).scenarioHelper.createTeams(teams);
    });

    let postId: string;
    await h(t).withLog('And I send a file in one team', async () => {
      postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
        filePaths:fp[0],
        group: teams[0],
        operator: loginUser,
        text: uuid()
      });
    });

    const app = new AppRoot(t);
    const conversationPage = app.homePage.messageTab.conversationPage;
    const moreActionOnFile = app.homePage.moreActionOnFile;
    const moreActionOnViewer = app.homePage.moreActionOnViewer;
    const recentConversationDialog = app.homePage.recentConversationDialog;
    const rightRail = app.homePage.messageTab.rightRail;
    await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    await h(t).withLog('And I open the team', async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(teams[0].glipId).enter();
    });

    const posts = app.homePage.messageTab.conversationPage.posts;
    const filesTabItem = rightRail.filesTab.nthItem(0);
    const viewerDialog = app.homePage.fileAndImagePreviewer;
    const postItem = app.homePage.messageTab.conversationPage.nthPostItem(0);
    const Entries =[postItem,filesTabItem,viewerDialog];

    let j=0
    for(let i = 0 ; i < Entries.length; i++ ){

      if( i == 0 ){
        await h(t).withLog(`When I click the more button of the file(Entry1: conversation history)`, async() => {
          await moreActionOnFile.clickMore();
        });
      }else if( i == 1 ){
        await h(t).withLog(`When I click Files Tab on the right self(Entry2:right self)`, async () => {
          await rightRail.filesEntry.enter();
          await rightRail.filesEntry.shouldBeOpened();
        });

        await h(t).withLog(`And I hover the file item`, async () => {
          await filesTabItem.nameShouldBe(filenames[0]);
          await t.hover(filesTabItem.self)
        });

        await h(t).withLog(`And I click the more button of the file`, async() => {
          await filesTabItem.clickMore();
        });

      }else{
        await h(t).withLog('When I click the file(Entry3:file viewer)', async () => {
          await conversationPage.waitUntilPostsBeLoaded();
          await t.click(postItem.fileThumbnail);
          await viewerDialog.ensureLoaded();
        });
        await h(t).withLog(`And I click the more button of the file`, async() => {
          await moreActionOnFile.clickMore();
        });

      }

      await h(t).withLog(`And I click the ${shareFileMenu} menu of the file`, async() => {
        await moreActionOnFile.clickShareFileMenu();
      });

      const recentConversationDialog = app.homePage.recentConversationDialog;
      await h(t).withLog(`Then will show the recent conversation dialog`, async() => {
        await recentConversationDialog.ensureLoaded();
      });

      j=j+1;
      await h(t).withLog(`When I select one conversation ${teams[j].name}`, async () => {
        recentConversationDialog.clickConversationWithName(teams[j].name);
      });

      await h(t).withLog(`Then close the dialog`, async () => {
          await recentConversationDialog.ensureDismiss();
      });

      await h(t).withLog(`And show a flash toast: ${flashToast}`, async () => {
        await app.homePage.alertDialog.shouldBeShowMessage(flashToast);
      });

      await h(t).withLog(`When I go to the conversation`, async () => {
        if(i ==2){
            await t.pressKey('esc');
            await viewerDialog.ensureDismiss();
        }
        await app.homePage.messageTab.teamsSection.conversationEntryByName(teams[j].name).enter();
      });

      await h(t).withLog(`Then the file shared to the conversation ${teams[j].name} successfully`, async () => {
        await conversationPage.lastPostItem.waitForPostToSend();
        await t.expect(conversationPage.lastPostItem.fileNames.count).eql(1);
      }, true);
    }

    // Search one conversation to share file(image)
    await app.homePage.messageTab.teamsSection.conversationEntryById(teams[3].glipId).enter();
    await h(t).withLog('When I send a file to one team', async () => {
      postId = await h(t).scenarioHelper.createPostWithTextAndFilesThenGetPostId({
        filePaths:fp[1],
        group: teams[3],
        operator: loginUser,
        text: uuid()
      });
    });
    await h(t).withLog('And I click the image thumbnail', async () => {
      await t.click(posts.nth(-1).find('[data-test-automation-class="image"]'));
    });

    await h(t).withLog('Then the image previewer should be showed', async () => {
      await viewerDialog.ensureLoaded();
      await viewerDialog.shouldBeFullScreen();
    });

    await h(t).withLog(`When I click the more button of the image`, async() => {
        await moreActionOnViewer.clickMore();
        await moreActionOnViewer.ensureLoaded();
    });

    await h(t).withLog(`And I click the ${shareFileMenu} menu of the image`, async() => {
        await moreActionOnViewer.clickShareFileMenu();
        await recentConversationDialog.ensureLoaded();
    });

    await h(t).withLog(`And I search the conversation name ${teams[2].name}`, async () => {
        await recentConversationDialog.enterNameInSearchBox(teams[2].name);
    });

    await h(t).withLog(`And I select the conversation ${teams[2].name}`, async () => {
        recentConversationDialog.clickConversationWithName(teams[2].name);
      });

    await h(t).withLog(`Then close the dialog`, async () => {
        await recentConversationDialog.ensureDismiss();
    });

    await h(t).withLog(`And show a flash toast: ${flashToast}`, async () => {
        await app.homePage.alertDialog.shouldBeShowMessage(flashToast);
    });

    await h(t).withLog(`When closed the viewer and I go to the conversation ${teams[2].name}`, async () => {
        await t.pressKey('esc');
        await app.homePage.messageTab.teamsSection.conversationEntryByName(teams[2].name).enter();
    });

    await h(t).withLog(`Then the image shared to the conversation ${teams[2].name} successfully`, async () => {
        await conversationPage.lastPostItem.waitForPostToSend();
        await t.expect(conversationPage.lastPostItem.fileNames.count).eql(1);
      }, true);

});


