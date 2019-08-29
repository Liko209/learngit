/*
 * @Author: Spike.Yang
 * @Date: 2019-08-27 14:40:16
 * Copyright © RingCentral. All rights reserved.
 */


import { v4 as uuid } from 'uuid';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ConversationStream/JoinAudioConference')
  .beforeEach(setupCase(BrandTire.RC_WITH_PHONE_DL))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2751'],
  maintainers: ['JoinAudioConference'],
  keywords: ['Spike.Yang']
})('Participant can join conference success when click the [Join] button or link.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const hostUser = users[3];
  const participateUser =  users[0];
  const title = 'Conference call';

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [hostUser, participateUser],
    owner: participateUser
  }

  await h(t).withLog('Given I have an extension with 1 team chat, and start a audio conference to the team', async () => {
    await h(t).platform(participateUser).init();
    await h(t).glip(participateUser).init();
    await h(t).glip(participateUser).getPersonPartialData('display_name');
    await h(t).scenarioHelper.createTeam(team)
    await h(t).glip(participateUser).createSimpleAudioConference(team.glipId);
  });


  await h(t).withLog(`And I login Jupiter with host {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: hostUser.company.number,
      extension: hostUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, hostUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const postCard = app.homePage.messageTab.conversationPage.nthPostItem(-1);
  const audioConference = postCard.audioConference;
  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('And Single click the dia-in number', async () => {
    await audioConference.clickAudioConferenceLink();
  });

  await h(t).withLog(`And loginUser can receive the conference call`, async () => {
    await telephonyDialog.ensureLoaded(20e3);
  });

  await h(t).withLog('Then Participant join conference success', async () => {
    await t.expect(telephonyDialog.conferenceCall.textContent).eql(title);
  })

  await h(t).withLog('When hang up conference call', async () => {
    await telephonyDialog.clickHangupButton();
  })

  await h(t).withLog('And Single click the join button', async () => {
    await audioConference.clickJoinAudioConferenceBtn();
  });

  await h(t).withLog(`And loginUser can receive the conference call`, async () => {
    await telephonyDialog.ensureLoaded(20e3);
  });

  await h(t).withLog('Then Participant join conference success', async () => {
    await t.expect(telephonyDialog.conferenceCall.textContent).eql(title);
  });
},
);



test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2752'],
  maintainers: ['JoinAudioConference'],
  keywords: ['Spike.Yang']
})('Host can join conference success when click the link.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const hostUser = users[3];
  const title = 'Conference call';

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [hostUser],
    owner: hostUser
  }

  await h(t).withLog('Given I have an extension with 1 team chat, and start a audio conference to the team', async () => {
    await h(t).platform(hostUser).init();
    await h(t).glip(hostUser).init();
    await h(t).glip(hostUser).getPersonPartialData('display_name');
    await h(t).scenarioHelper.createTeam(team)
    await h(t).glip(hostUser).createSimpleAudioConference(team.glipId);
  });


  await h(t).withLog(`And I login Jupiter with host {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: hostUser.company.number,
      extension: hostUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, hostUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I enter the team`, async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(team.glipId).enter();
  });

  const postCard = app.homePage.messageTab.conversationPage.nthPostItem(-1);
  const audioConference = postCard.audioConference;
  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('And Single click the dia-in number', async () => {
    await audioConference.clickAudioConferenceLink();
  });

  await h(t).withLog(`And loginUser can receive the conference call`, async () => {
    await telephonyDialog.ensureLoaded(20e3);
  });

  await h(t).withLog('Then Host join conference success', async () => {
    await t.expect(telephonyDialog.conferenceCall.textContent).eql(title);
  })

  await h(t).withLog('When hang up conference call', async () => {
    await telephonyDialog.clickHangupButton();
  })

  await h(t).withLog('And Single click the join button', async () => {
    await audioConference.clickJoinAudioConferenceBtn();
  });

  await h(t).withLog(`And loginUser can receive the conference call`, async () => {
    await telephonyDialog.ensureLoaded(20e3);
  });

  await h(t).withLog('Then Host join conference success', async () => {
    await t.expect(telephonyDialog.conferenceCall.textContent).eql(title);
  });
},
);
