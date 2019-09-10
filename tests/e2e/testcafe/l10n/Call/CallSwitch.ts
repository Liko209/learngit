import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Call/CallSwitch')
  .beforeEach(setupCase(BrandTire.RC_WITH_GUESS_DID))
  .afterEach(teardownCase());

test(formalName('Check call switch for an active call', ['P2', 'Call', 'CallSwitch', 'V1.7', 'Hank.Huang']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.guestCompany.users[0];
  const app = new AppRoot(t);
  const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
  const callerWebPhone = await h(t).newWebphoneSession(caller);
  await h(t).glip(caller).init();

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I receive an inbound call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  await h(t).withLog('And the inbound call is answered at the webphone', async () => {
    await loginUserWebPhone.answer();
  });

  await h(t).withLog('Then "Switch Call" toast should be displayed', async () => {
    await t.expect(telephonyDialog.SwitchToptap.exists).ok();
  });

  await h(t).log('And I take screenshot', { screenshotPath:"Jupiter_Call_SwitchCallToast" });

  await h(t).withLog('When I click the "Switch call to this device" in the top toast', async () => {
    await telephonyDialog.clickSwitchToptap();
  });

  await h(t).log('Then I take screenshot', { screenshotPath:"Jupiter_Call_SwitchCallAlert" });

  await h(t).withLog('When I end the call on the webphone', async () => {
    await loginUserWebPhone.hangup();
    await t.wait(1000);
  });

  await h(t).log('Then I take screenshot', { screenshotPath:"Jupiter_Call_CallEndToast" });
});



