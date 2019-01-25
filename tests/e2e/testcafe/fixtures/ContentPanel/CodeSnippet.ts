/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-22 16:05:46
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../../libs/filter';
import * as _ from 'lodash';
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL, BrandTire } from '../../config';
import { v4 as uuid } from 'uuid';

function getCodeString(lineNumber: number) {
  let code = '';
  for (let i = 0; i !== lineNumber-1; i++){
    code += `code${i}\n`;
  }
  return code;
}

async function snippetHeightCorrect(snippet, lineNumber){
  const padding = 4;
  const wrapperHeight = await snippet.body.find('*[data-test-automation-id="codeSnippetBody"]').offsetHeight
  const lineHeight = await snippet.body.find('.CodeMirror-line').offsetHeight
  return wrapperHeight === lineHeight * lineNumber + 2 * padding;
}

fixture('ContentPanel/CodeSnippet')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('Display the default mode of code snippet', ['JPT-950', 'P1', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const lineNumber1 = 15;
  const codeSnippet1 = {
    body: getCodeString(lineNumber1),
    title: uuid()
  }

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I sent one code snippet with ${lineNumber1} lines in the conversation`, async () => {
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet1.body, codeSnippet1.title)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const snippet1 = conversationPage.nthPostItem(-1);
  await h(t).withLog(`Then I should see the first code snippet with ${lineNumber1} lines`, async () => {
    await t.expect(snippet1.body.find('span').withText(codeSnippet1.title).exists).ok();
    await t.expect(await snippetHeightCorrect(snippet1, lineNumber1)).ok();
  });

  await h(t).withLog('When I hover on code snippet', async () => {
    await t.hover(snippet1.body);
  })

  await h(t).withLog('Then I should see download and copy button on snippet header', async () => {
    await t.expect(snippet1.body.find('.icon.copy').exists).ok();
    await t.expect(snippet1.body.find('.icon.download').exists).ok();
  })
})

test(formalName('The preview of code snippet if the code is longer than 15 lines (<200 lines)', ['JPT-954', 'P1', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const snippetLineNumber = 150;
  const codeSnippet = {
    body: getCodeString(snippetLineNumber),
    title: uuid()
  }

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I sent a code snippet with ${snippetLineNumber} lines in the conversation`, async () => {
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet.body, codeSnippet.title)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const snippet = conversationPage.nthPostItem(-1);

  await h(t).withLog(`Then I should see expand button with total line of ${snippetLineNumber}`, async () => {
    await t.expect(snippet.body.find('span').withText(`Expand (${snippetLineNumber} lines)`)).ok();
  })

  await h(t).withLog('When I click expand button', async () => {
    await t.wait(2e3)
    await t.hover(snippet.body);
    await t.click(snippet.body.find('span').withText('Expand'))
  })

  await h(t).withLog('Then the code snippet should expand ', async () => {
    await t.wait(2e3)
    await t.expect(await snippetHeightCorrect(snippet, snippetLineNumber)).ok();
  })

  await h(t).withLog('When I click collapse button', async () => {
    await t.hover(snippet.body);
    await t.click(snippet.body.find('span').withText('Collapse'))
  })

  await h(t).withLog('Then the code snippet should collapse to show 10 lines', async () => {
    await t.wait(1e3)
    await t.expect(await snippetHeightCorrect(snippet, 10)).ok();
  })
})

test(formalName('The preview of code snippet if the code is longer than 200 lines ', ['JPT-955', 'P1', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const lineNumber = 210;
  const codeSnippet = {
    body: getCodeString(lineNumber),
    title: uuid()
  }

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I sent a code snippet with ${lineNumber} lines in the conversation`, async () => {
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet.body, codeSnippet.title)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const snippet = conversationPage.nthPostItem(-1);
  await h(t).withLog('When I click expand button', async () => {
    await t.wait(3e3)
    await t.hover(snippet.body);
    await t.click(snippet.body.find('span').withText('Expand'))
  })

  await t.wait(2e3)
  await h(t).withLog('Then I should see a collapse button', async () => {
    await t.expect(snippet.body.find('span').withText('Collapse').exists).ok()
  })

  await h(t).withLog(`And I should see a "download to see the rest ${lineNumber} lines" button`, async () => {
    await t.expect(snippet.body.find('span').withText(`Download to see the rest ${lineNumber-200} lines`).exists).ok()
  })

  await h(t).withLog('When I click collapse button', async () => {
    await t.hover(snippet.body);
    await t.click(snippet.body.find('span').withText('Collapse'))
  })

  await h(t).withLog('Then the code snippet should collapse ', async () => {
    await t.wait(1e3)
    await t.expect(await snippetHeightCorrect(snippet,10)).ok()
  })
})

test.skip(formalName('This change of code snippet should be synced to backend and all clients', ['JPT-958', 'P1', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  const codeSnippet = {
    body: getCodeString(10),
    title: uuid()
  }

  let sentSnippetId;
  await h(t).withLog('And I sent a code snippet with 10 lines in the conversation', async () => {
    const sentSnippet = await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet.body, codeSnippet.title)
    sentSnippetId = sentSnippet.data._id;
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const snippet = conversationPage.nthPostItem(-1);

  await h(t).withLog('Then I should see the code snippet with original title', async () => {
    await t.expect(snippet.body.find('span').withText(codeSnippet.title).exists).ok()
  })

  const newTitle = `newTitle${uuid()}`;
  await h(t).withLog('When I change the code snippet title in server ', async () => {
    const response =  await h(t).glip(loginUser).updateCodeSnippet(sentSnippetId, { title:newTitle })
  })

  await h(t).withLog('Then I should see the code snippet title changed', async () => {
    await t.expect(snippet.body.find('span').withText(newTitle).exists).ok({ timeout:120e3 });
  })
})

test(formalName('The limitation of code lines display for code snippet', ['JPT-953', 'P2', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[6];
  const lineNumber1 = 14;
  const codeSnippet1 = {
    body: getCodeString(lineNumber1),
    title: uuid()
  }
  const lineNumber2 = 15;
  const codeSnippet2 = {
    body: getCodeString(lineNumber2),
    title: uuid()
  }
  const lineNumber3 = 16;
  const codeSnippet3 = {
    body: getCodeString(lineNumber3),
    title: uuid()
  }

  await h(t).platform(loginUser).init();
  await h(t).glip(loginUser).init();

  let conversation;
  await h(t).withLog('Given I have an extension with one conversation', async () => {
    conversation = await h(t).platform(loginUser).createAndGetGroupId({
      isPublic: true,
      name: `Team ${uuid()}`,
      type: 'Team',
      members: [loginUser.rcId],
    });
  });

  await h(t).withLog(`And I sent two code snippet with ${lineNumber1},${lineNumber2},${lineNumber3} lines in the conversation`, async () => {
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet1.body, codeSnippet1.title)
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet2.body, codeSnippet2.title)
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet3.body, codeSnippet3.title)
  });

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog('And I enter the conversation', async () => {
    const teamsSection = app.homePage.messageTab.teamsSection;
    await teamsSection.expand();
    await teamsSection.conversationEntryById(conversation).enter();
    await teamsSection.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog(`Then I should see the first code snippet shown with ${lineNumber1} lines`, async () => {
    const snippet1 = conversationPage.nthPostItem(-3);
    await t.expect(snippet1.body.find('span').withText(codeSnippet1.title).exists).ok();
    await t.expect(await snippetHeightCorrect(snippet1, lineNumber1)).ok();
  });

  await h(t).withLog(`and I should see the second code snippet show ${lineNumber2} lines`, async () => {
    const snippet2 = conversationPage.nthPostItem(-2);
    await t.expect(snippet2.body.find('span').withText(codeSnippet2.title).exists).ok();
    await t.expect(await snippetHeightCorrect(snippet2, lineNumber2)).ok();
  });

  await h(t).withLog(`and I should see the third code snippet show 10 lines`, async () => {
    const snippet3 = conversationPage.nthPostItem(-1);
    await t.expect(snippet3.body.find('span').withText(codeSnippet3.title).exists).ok();
    await t.expect(await snippetHeightCorrect(snippet3, 10)).ok();
  });

})
