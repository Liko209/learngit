import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Phone/CallHistory')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('There\'re some call history records', ['P2', 'Phone', 'CallHistory' ,'Sean.Zhuang']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[5];
  const otherUser = h(t).rcData.mainCompany.users[6];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('When there\'s a missed call', async () => {
    const session = await h(t).newWebphoneSession(otherUser);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await session.close();
  });

  await h(t).withLog('And there\'s a inbound call', async () => {
    const session = await h(t).newWebphoneSession(otherUser);
    await session.makeCall(`${loginUser.company.number}#${loginUser.extension}`);

  });

  await h(t).withLog('And there\'s a outbound call', async () => {
  });
  await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_IgnoreTheCall' });
});
