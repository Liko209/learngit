import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup } from '../../v2/models';
import { v4 as uuid } from 'uuid';

fixture('ContentPanel/ReceiveNewMessages')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Receive new sms messages', ['P2', 'Messages', 'ContentPanel', 'V1.4', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  let teamA = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser, otherUser]
  }

  let teamB = <IGroup>{
    name: uuid(),
    type: 'Team',
    owner: loginUser,
    members: [loginUser]
  }

  await h(t).withLog('Given I have an extension with conversationA and conversationB', async() => {
    await h(t).scenarioHelper.createTeamsOrChats([teamA, teamB]);
  });

  await h(t).withLog('And ConversationA has more than 1 message', async() => {
    const historyMsg = 'History message';
    await h(t).scenarioHelper.sentAndGetTextPostId(historyMsg, teamA, otherUser);
  });

  await h(t).withLog(`And login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const teamsSection = app.homePage.messageTab.teamsSection;
  await h(t).withLog('When I enter conversationA', async () => {
    await teamsSection.expand();
    await teamsSection.conversationEntryById(teamA.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('And enter conversationB', async () => {
    await teamsSection.conversationEntryById(teamB.glipId).enter();
    await teamsSection.ensureLoaded();
  })

  await h(t).withLog('And receive new message in conversationA', async () => {
    const newMsg = 'Receive new message';
    await h(t).scenarioHelper.sentAndGetTextPostId(newMsg, teamA, otherUser);
  })

  await h(t).withLog('And enter conversationA', async () => {
    await teamsSection.conversationEntryById(teamA.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  const ConversationPage = app.homePage.messageTab.conversationPage;
  await h(t).withLog('Then I can see New Message line', async () => {
    //Wait for adding automation id
    // await t.expect(ConversationPage.newMessageDeadLine.exists).ok();
  });

  await h(t).log('And I capture screenshot', {screenshotPath: 'Jupiter_ContentPanel_ReceiveNewMessages_01'})

  await h(t).withLog('When I enter conversationB', async () => {
    await teamsSection.conversationEntryById(teamB.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('And conversationA has more than 1 screen unread messages', async() => {
    const msgList = _.range(5).map(i => H.multilineString(10, `No. ${i}`, uuid()));
    for(const msg of msgList){
      await h(t).scenarioHelper.sentAndGetTextPostId(msg, teamA, otherUser);
    }
  });

  await h(t).withLog('And enter conversationA', async () => {
    await teamsSection.conversationEntryById(teamA.glipId).enter();
    await teamsSection.ensureLoaded();
  });

  await h(t).withLog('Then I can see unread button', async () => {
    await t.expect(ConversationPage.jumpToFirstUnreadButtonWrapper.exists).ok();
  });

  await h(t).log('And I capture screenshot', {screenshotPath: 'Jupiter_ContentPanel_ReceiveNewMessages_02'})
})
