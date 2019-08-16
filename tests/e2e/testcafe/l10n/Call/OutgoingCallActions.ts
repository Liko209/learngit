import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import { WebphoneSession } from 'webphone-client';
;

fixture('Call/OutgoingCallActions')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Call Actions for an outgoing Call', ['P2', 'Call', 'OutgoingCall', 'OutgoingCallActions', 'V1.6', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  let chat = <IGroup>{
    type: "DirectMessage",
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  await h(t).withLog(`Given I have a chat between ${loginUser.company.number}#${loginUser.extension} & ${otherUser.company.number}#${otherUser.extension}`, async () => {
    await h(t).scenarioHelper.createOrOpenChat(chat);
  });

  await h(t).withLog('And send a message to ensure chat in list', async () => {
    await h(t).scenarioHelper.sendTextPost('for appear in section', chat, loginUser);
  });

  let session: WebphoneSession;
  await h(t).withLog(`And ${otherUser.company.number}#${otherUser.extension} login webphone`, async () => {
    session = await h(t).newWebphoneSession(otherUser);
  })

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  })

  const directMessagesSection = app.homePage.messageTab.directMessagesSection;
  await h(t).withLog('When I enter the chat', async () => {
    await directMessagesSection.expand();
    await directMessagesSection.conversationEntryById(chat.glipId).enter();
  })

  const conversationPage = app.homePage.messageTab.conversationPage;
  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('And click Call button and Call Actions', async() => {
    await conversationPage.clickTelephonyButton();
    await telephonyDialog.clickActionsButton();
  })

  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_Call_OutgoingCallActions'});

  await h(t).withLog('When I click Park button', async () => {
    await telephonyDialog.clickParkActionButton();
  })

  await h(t).log('Then I capture screenshot', {screenshotPath: 'Jupiter_Call_OutgoingCallParkFailed'});
})
