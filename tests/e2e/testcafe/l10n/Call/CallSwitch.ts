import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire, SITE_ENV } from '../../config';
import { WebphoneSession } from 'webphone-client';


fixture('Call/ActiveCallRecordFailed')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Call Switch for an active call', ['P2', 'Call', 'CallSwitch', 'V1.7', 'Hank.Huang']), async (t) => {
  let loginUser = h(t).rcData.mainCompany.users[0];
  let caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('And I receive an inbound call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });
  await h(t).withLog('And the inbound call is answer at webphone', async () => {
    await loginUserWebPhone.answer();
  });
  await h(t).log('Then I take screenshot', { screenshotPath:"Jupiter_Call_SwitchCallToast" });

});

