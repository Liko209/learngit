/*
* @Author: Potar He (Potar.He@ringcentral.com)
* @Date: 2019-01-22 10:30:00
* Copyright © RingCentral. All rights reserved.
*/

import { v4 as uuid } from 'uuid';
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { h } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';

fixture('ConversationStream/AudioConference')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-961'],
  maintainers: ['AudioConference'],
  keywords: ['Potar.He']
})('The audio conference message displayed in the conversation.', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const hostUser = users[5];


  const dialInNumberTitle = 'Dial-in Number';
  const hostAccessTitle = 'Host Access';
  const participantAccessTitle = 'Participant Access';

  const team = <IGroup>{
    name: uuid(),
    type: 'Team',
    members: [hostUser],
    owner: hostUser
  }

  let hostUserName: string;
  await h(t).withLog('Given I have an extension with 1 team chat, and start a audio conference to the team', async () => {
    await h(t).platform(hostUser).init();
    await h(t).glip(hostUser).init();
    hostUserName = await h(t).glip(hostUser).getPersonPartialData('display_name');
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
  await h(t).withLog(`Then I can find the last post is a audio conference`, async () => {
    await t.expect(postCard.headerNotification.withText('started an audio conference').exists).ok();
    await t.expect(audioConference.icon.exists).ok();
    await t.expect(audioConference.title.exists).ok();
  }, true);

  await h(t).withLog(`And the audio conference sender should be {hostUserName}`, async (step) => {
    step.setMetadata('hostUserName', hostUserName);
    await t.expect(postCard.name.textContent).eql(hostUserName);
  });

  await h(t).withLog(`And the audio conference should has "Dial-in Number" `, async () => {
    await t.expect(audioConference.self.withText(dialInNumberTitle).exists).ok();
    await t.expect(audioConference.audioConferenceLink.exists).ok();
    await t.expect(audioConference.globalNumber.exists).ok();

  });

  await h(t).withLog(`And the audio conference should has "Host Access"`, async () => {
    await t.expect(audioConference.self.withText(hostAccessTitle).exists).ok();
    await t.expect(audioConference.hostCode.exists).ok();
  });

  await h(t).withLog(`And the audio conference should has "Participant Access" `, async () => {
    await t.expect(audioConference.self.withText(participantAccessTitle).exists).ok();
    await t.expect(audioConference.participantCode.exists).ok();
  });
},
);
