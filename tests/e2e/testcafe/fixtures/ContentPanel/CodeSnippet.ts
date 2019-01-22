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

fixture('ContentPanel/CodeSnippet')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Display the default mode of code snippet', ['JPT-950', 'P1', 'Wayne.Zhou', 'CodeSnippetItem']), async (t) => {

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
    body: getCodeString(13),
    title: uuid()
  }

  await h(t).withLog('And I sent a code snippet in the conversation', async () => {
    await h(t).glip(loginUser).createSimpleCodeSnippet(conversation, codeSnippet.body,  codeSnippet.title)
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
  await h(t).withLog('Then I should see code snippet title', async () => {
    const postItem = conversationPage.nthPostItem(-1);
    await t.expect(postItem.body.withText(codeSnippet.title).exists).ok();
    await t.expect(postItem.body.withText('15').exists).ok();
  })
})


