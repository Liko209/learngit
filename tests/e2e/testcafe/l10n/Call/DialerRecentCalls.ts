import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Call/DialerRecentCalls')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Dialer Search', ['P2', 'Call', 'DialerRecentCalls', 'V1.6', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I delete all call logs`, async () => {
    await h(t).platform(loginUser).init();
    await h(t).platform(loginUser).deleteUserAllCallLog();
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog('When I open dialer and select caller id',async() => {
    await app.homePage.openDialer();
    await telephonyDialog.clickCallerIdSelector();
    await telephonyDialog.callerIdList.selectBlocked();
    await telephonyDialog.clickMinimizeButton();
  });

  await h(t).withLog('And I click Dialer button and hover Recent Call icon', async() => {
    await app.homePage.openDialer();
    await telephonyDialog.hoverRecentCallButton();
  });

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerRecentCalls'})

  await h(t).withLog('When I click Recent Call icon and hover it', async () => {
    await telephonyDialog.clickRecentCallButton();
    await telephonyDialog.hoverBackToDialpadButton();
  });

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerBackToDialer'})

  await h(t).withLog('When I make a call and end the call', async () => {
    await telephonyDialog.typeTextInDialer('705');
    await telephonyDialog.contactSearchList.clickDirectDialIcon();
    await telephonyDialog.clickHangupButton();
  });

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerCallLogItem'});
});
