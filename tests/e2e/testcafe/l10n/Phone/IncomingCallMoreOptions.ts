import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { WebphoneSession } from '../../v2/webphone/session';

fixture('Phone/IncomingCallMoreOptions')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check More options in an incoming call', ['P2', 'Phone', 'IncomingCallMoreOptions', 'V1.4', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  let session: WebphoneSession;
  await h(t).withLog(`And ${otherUser.company.number}#${otherUser.extension} login webphone and make a call to ${loginUser.company.number}#${loginUser.extension}`, async () => {
    session = await h(t).newWebphoneSession(otherUser);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  })

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive incoming call and hover More option button', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.hoverMoreOptionsButton();
  })
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_MoreOptions'})

  await h(t).withLog('When I click More options', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.hoverReplyActionButton();
  })

  await h(t).withLog('Then I can see Reply option', async () => {
    await t.expect(telephonyDialog.replyActionMenuItem.visible).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Phone_MoreOptionsReply'})

  await h(t).withLog('When I click Reply item', async () => {
    await telephonyDialog.clickReplyActionButton();
  })

  await h(t).withLog('Then I can see reply option list', async () => {
    await t.expect(telephonyDialog.replyWithInMeeting.exists).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Phone_ReplyOptions'})

  await h(t).withLog('When I click Will call you back in', async () => {
    await telephonyDialog.clickReplyWithWillCallBackEntryButton();
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Phone_ReplyWithWillCallBack'})

  await h(t).withLog('When I click "in a meeting" option', async () => {
    await telephonyDialog.clickReplyInMeetingButton();
    await telephonyDialog.clickReplyInMeetingButton();
  })

  await h(t).withLog('Then I can see prompt message', async () => {
    await t.expect(app.homePage.alertDialog.shouldBePopUp).ok();
  })

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Phone_ReplyWithInMeeting'})
});
