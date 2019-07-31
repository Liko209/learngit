import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { WebphoneSession } from 'webphone-client';


fixture('Call/IncomingCallForward')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Forward for an incoming call', ['P2', 'Call', 'IncomingCallForward', 'V1.6', 'Jenny.Cai']), async (t) => {
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
  await h(t).withLog('When I receive incoming call and click Call Actions button', async () => {
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.hoverForwardButton();
  })
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Call_Forward'})

  await h(t).withLog('When I click Custom button', async () => {
    await telephonyDialog.clickCustomForwardButton();
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_ForwardCustom'})

  await h(t).withLog('When I click Forward button without entering any number', async () => {
    await telephonyDialog.clickForwardActionButton();
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_ForwardInvalidNumber'})

  await h(t).withLog('When I type number in dialer and click Forward button', async () => {
    await telephonyDialog.tapKeypad("703");
    await telephonyDialog.clickForwardActionButton();
    await t.wait(2000);
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_ForwardSuccessfully'})

  await h(t).withLog('End the call', async () => {
    await session.hangup();
  })
});
