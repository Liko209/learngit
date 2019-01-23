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

fixture('ConversationStream/AudioConference')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('The audio conference message displayed in the conversation.', ['JPT-961', 'P1', 'AudioConference', 'Potar.He']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const otherUser = users[4];
    const hostUser = users[5];
    await h(t).platform(hostUser).init();
    await h(t).glip(hostUser).init();

    const hostUserName = await h(t).glip(hostUser).getPersonPartialData('display_name');

    let teamId;
    await h(t).withLog('Given I have an extension with 1 team chat, and start a audio conference to the team', async () => {
      teamId = await h(t).platform(hostUser).createAndGetGroupId({
        name: uuid(),
        type: 'Team',
        members: [hostUser.rcId, otherUser.rcId],
      });
      await h(t).glip(hostUser).createSimpleAudioConference(teamId);
    });

    await h(t).withLog(`And I login Jupiter with this extension: ${hostUser.company.number}#${hostUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, hostUser);
      await app.homePage.ensureLoaded();
    },
    );

    await h(t).withLog(`When I enter the team`, async () => {
      await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    });

    const postCard = app.homePage.messageTab.conversationPage.nthPostItem(-1);
    await h(t).withLog(`Then I can find the last post is a audio conference`, async () => {
      await t.expect(postCard.AudioConferenceHeaderNotification.exists).ok();
    });

    await h(t).withLog(`And the audio conference sender should be ${hostUserName}`, async () => {
      await t.expect(postCard.name.textContent).eql(hostUserName);
    }, true);

    const audioConference = postCard.audioConference;
    await h(t).withLog(`And the audio conference should has "Dial-in Number" "Host Access" "Participant Access" `, async () => {
      await t.expect(audioConference.icon.exists).ok();
      await t.expect(audioConference.title.exists).ok();
      await t.expect(audioConference.dialInNumber.exists).ok();
      await t.expect(audioConference.phoneNumber.exists).ok();
      await t.expect(audioConference.globalNumber.exists).ok();
      await t.expect(audioConference.hostAccess.exists).ok();
      await t.expect(audioConference.hostCode.exists).ok();
      await t.expect(audioConference.participantAccess.exists).ok();
      await t.expect(audioConference.participantCode.exists).ok();
    }, true);
  },
);
