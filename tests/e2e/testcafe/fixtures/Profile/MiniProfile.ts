/*
* @Author: Potar He (potar.he@ringcentral.com)
* @Date: 2018-12-20 16:30:30
* Copyright © RingCentral. All rights reserved.
*/

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';
import { v4 as uuid } from 'uuid';


fixture('Profile/MiniProfile')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

  // TODO: guest mention not yet.
test(formalName('Open mini profile via post avatar then open conversation', ['JPT-449', 'P1', 'Potar.He']), async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];
  loginUser.sdk = await h(t).getSdk(loginUser);
  const otherUserPlatform = await h(t).getPlatform(users[5]);
  const app = new AppRoot(t);
  console.log(loginUser.rcId);


  let teamId, meMentionPost, contactMentionPost;
  await h(t).withLog('Given I have one team with some mention posts ', async () => {
    teamId = await loginUser.sdk.platform.createGroup({
      isPublic: true,
      name: uuid(),
      type: 'Team',
      members: [loginUser.rcId, users[5].rcId],
    }).then(res => {
      return res.data.id;
    })
    const meMentionPostId = await otherUserPlatform.sendTextPost(`Hi AtMention, ![:Person](${loginUser.rcId})`, teamId).then(res => {
      return res.data.id;
    });
    meMentionPost = app.homePage.messageTab.conversationPage.postItemById(meMentionPostId);

    const contactMentionPostId = await loginUser.sdk.platform.sendTextPost(`Hi AtMention, ![:Person](${users[5].rcId})`, teamId).then(res =>{
      return res.data.id;
    });
    contactMentionPost = app.homePage.messageTab.conversationPage.postItemById(contactMentionPostId); 
  });

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter the create team and click the me mention', async () => {
    await app.homePage.messageTab.teamsSection.conversationEntryById(teamId).enter();
    await t.click(meMentionPost.mentions);
  });

  await h(t).withLog('Then the mini profile dialog should be showed', async () => {

  }, true);

  await h(t).withLog('And the left-top of the avatar on profile dialog should be the same position as the avatar of the listed people', async () => {

  }, true);

});
