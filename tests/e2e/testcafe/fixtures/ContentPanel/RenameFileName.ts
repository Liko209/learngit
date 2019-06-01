import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from "../../v2/models";
import { v4 as uuid } from 'uuid';
import { IGroup } from '../../v2/models';

fixture('ContentPanel/RenameFileName')
  .beforeEach(setupCase(BrandTire.RC_FIJI_GUEST))
  .afterEach(teardownCase());

// todo
test.only.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2061'],
  maintainers: ['Mia.cai'],
  keywords: ['ContentPanel/RenameFileName']
})(`Can rename file/file successfully`, async (t) => {
  const renameFileMenu = 'Edit filename';
  const filenames = ['1'];
  const suffixs = ['docx']
  // todo  should check source
  const filesPath = ['../../sources/1.docx'];
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser]
  }
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const renameFileDialog = moreActionOnFile.renameFileDialog;
  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open the team and upload a file file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  const posts = app.homePage.messageTab.conversationPage.posts;
  const filesTabItem = rightRail.filesTab.nthItem(0);
  const viewerDialog = app.homePage.viewerDialog;
  const postItem = app.homePage.messageTab.conversationPage.nthPostItem(0);
  // TODO wait for file viewer feature merged
  // const Entries =[postItem,filesTabItem,viewerDialog];
  const Entries =[postItem,filesTabItem];

  // todo debug for filesTab
  for(let i = 1 ; i < Entries.length; i++ ){

    if( i == 0 ){   
      await h(t).withLog(`And I click the more button of the file`, async() => {
        await moreActionOnFile.clickMore();
      },true);
    }else if( i == 1 ){
      await h(t).withLog(`When I click Files Tab on the right self(Entry2:right self)`, async () => {
        await rightRail.filesEntry.enter();
        await rightRail.filesEntry.shouldBeOpened();
      },true);

      await h(t).withLog(`When I hover the file item`, async () => {
        await filesTabItem.nameShouldBe(filenames[0]);
        await t.hover(filesTabItem.self)
      },true);

      await h(t).withLog(`And I click the more button of the file`, async() => {
        await filesTabItem.clickMore();
      },true);

    }else{

      await h(t).withLog('When I click the file(Entry3:file viewer)', async () => {
        await t.click(posts.nth(-1).find('img'));
        await viewerDialog.ensureLoaded();
      },true);
      await h(t).withLog(`And I click the more button of the file`, async() => {
        await moreActionOnFile.clickMore();
      },true);

    }
  
    await h(t).withLog(`Then will show ${renameFileMenu} menu at the top`, async() => {
      await moreActionOnFile.renameFileMenuAtTop(renameFileMenu);
    },true);

    await h(t).withLog(`When I click the ${renameFileMenu} menu of the file`, async() => {
      await moreActionOnFile.clickRenameFileMenu();
    },true);
  
    await h(t).withLog(`Then will show the rename file dialog`, async() => {
      await moreActionOnFile.ensureLoaded();
    },true);
  
    await h(t).withLog(`And pre-populate in the input field the existing file name with the suffix`, async() => {
      await renameFileDialog.existFileNameWithSuffix(filenames[0],suffixs[0]);
    },true);
  
    let newFileName = `file name ${i}`;
    await h(t).withLog(`When I update the file name`, async() => {
      await renameFileDialog.updateFileName(newFileName);
    },true);
  
    await h(t).withLog(`And I click the Cancel button`, async() => {
      await renameFileDialog.clickCancelButton();
    });
  
    await h(t).withLog(`Then the dialog should be closed`, async() => {
      await renameFileDialog.ensureDismiss();
    },true);

    await h(t).withLog(`And the filename should remain unchanged`, async() => {
      await Entries[i].nameShouldBe(filenames[0]);
    },true);

    if( i == 0 ){

      await h(t).withLog(`When I click the more button of the file`, async() => {
        await moreActionOnFile.clickMore();
      },true);

    }else if( i == 1 ){

      await h(t).withLog(`When I hover the file ${filenames[0]} item(Entry2:right self)`, async () => {
        await filesTabItem.nameShouldBe(filenames[0]);
        await t.hover(filesTabItem.self)
      },true);
      await h(t).withLog(`And I click the more button of the file`, async() => {
        await filesTabItem.clickMore();
      },true);

    }else{

      await h(t).withLog('When I click the file(Entry3:file viewer)', async () => {
        await t.click(posts.nth(-1).find('img'));
        await viewerDialog.ensureLoaded();
      },true);

      await h(t).withLog(`And I click the more button of the file`, async() => {
        await moreActionOnFile.clickMore();
      },true);

    }
  
    await h(t).withLog(`Then will show ${renameFileMenu} menu at the top`, async() => {
      await moreActionOnFile.renameFileMenuAtTop(renameFileMenu);
    },true);

    await h(t).withLog(`When I click the ${renameFileMenu} menu of the file`, async() => {
      await moreActionOnFile.clickRenameFileMenu();
    },true);
  
    await h(t).withLog(`Then will show the rename file dialog`, async() => {
      await moreActionOnFile.ensureLoaded();
    },true);

    await h(t).withLog(`When I update the file name`, async() => {
      await renameFileDialog.updateFileName(newFileName);
    },true);
  
    await h(t).withLog(`And I click the Save button`, async() => {
      await renameFileDialog.clickSaveButton();
    });
  
    await h(t).withLog(`Then the dialog should be closed`, async() => {
      await renameFileDialog.ensureDismiss();
    },true);

    await h(t).withLog(`And show the new file name`, async() => {
        await Entries[i].nameShouldBe(newFileName);
    },true);
    filenames[0] = newFileName;

  }
  
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2057','JPT-2074','JPT-2060'], // TODO case id ????
  maintainers: ['Mia.cai'],
  keywords: ['ContentPanel/RenameFileName']
})(`Unsupported characters should be replaced by_ when saving the file name;Show 'More' tooltip for the more icon;Rename file option is enabled to every member except guests;`, async (t) => {
  const renameFileMenu = 'Edit filename';
  const filesPath = ['../../sources/1.psd'];
    // TODO
  const nameWithUnSupportChar = 'file/1?2,3*4:5&';
  const newFileName = 'file_1_2_3_4_5_';
  const moreTooltip = 'More';
  const message = uuid();
  const loginUser = h(t).rcData.mainCompany.users[4];
  const guest = h(t).rcData.guestCompany.users[0];
  const app = new AppRoot(t);
  const conversationPage = app.homePage.messageTab.conversationPage;
  const moreActionOnFile = app.homePage.moreActionOnFile;
  const renameFileDialog = moreActionOnFile.renameFileDialog;
  const postItem = app.homePage.messageTab.conversationPage.nthPostItem(0);

  let team = <IGroup>{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: [loginUser,guest]
  }
  await h(t).withLog(`Given I have a team named: ${team.name}`, async () => {
    await h(t).scenarioHelper.createTeam(team);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open the team and upload a file file', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
    await conversationPage.uploadFilesToMessageAttachment(filesPath[0]);
    await conversationPage.sendMessage(message);
    await conversationPage.nthPostItem(-1).waitForPostToSend();
  });

  await h(t).withLog(`When I am on hover the file`, async () => {
    await t.hover(postItem.img);
  })  

  await h(t).withLog(`Then show ${moreTooltip} tooltip`, async () => {
    await postItem.showTooltip(moreTooltip);
  }); 

  await h(t).withLog(`When I click the more button of the file`, async() => {
    await moreActionOnFile.clickMore();
  });

  await h(t).withLog(`Then will show ${renameFileMenu} menu at the top`, async() => {
    await moreActionOnFile.renameFileMenuAtTop(renameFileMenu);
  });

  await h(t).withLog(`When I click the ${renameFileMenu} menu of the file`, async() => {
    await moreActionOnFile.clickRenameFileMenu();
  });

  await h(t).withLog(`Then will show the rename file dialog`, async() => {
    await moreActionOnFile.ensureLoaded();
  });

  await h(t).withLog(`When I update the file name`, async() => {
    await renameFileDialog.updateFileName(nameWithUnSupportChar);
  });

  await h(t).withLog(`And I click the Save button`, async() => {
    await renameFileDialog.clickSaveButton();
  });

  await h(t).withLog(`Then the dialog should be closed`, async() => {
    await renameFileDialog.ensureDismiss();
  });

  await h(t).withLog(`And show the new file name`, async() => {
    await postItem.nameShouldBe(newFileName);
  });

  //
  await h(t).withLog(`And I login Jupiter with guest`, async () => {
    await h(t).directLoginWithUser(SITE_URL, guest);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I open the team', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  await h(t).withLog(`And I click the more button of the file`, async() => {
    await moreActionOnFile.clickMore();
  });

  await h(t).withLog(`Then ${renameFileMenu} menu will be disabled`, async() => {
    // todo check menu disabled
  });

});

