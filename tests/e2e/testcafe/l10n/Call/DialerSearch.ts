import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Call/DialerSearch')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Check Dialer Search', ['P2', 'Call', 'DialerSearch', 'V1.6', 'Jenny.Cai']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[4];
  const otherUser = h(t).rcData.mainCompany.users[5];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
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

  await h(t).withLog('And I click Dialer button and start to search', async() => {
    await app.homePage.openDialer();
    await telephonyDialog.typeTextInDialer("705");
  });

  await h(t).withLog('Then search list should be displayed', async() => {
    await t.expect(telephonyDialog.contactSearchList.hasDirectDialIcon).ok();
  });

  await h(t).log('And I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerSearchResult'})

  await h(t).withLog('When I input unmatched text', async () => {
    await telephonyDialog.typeTextInDialer("abc");
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerSearchNoResult'})

  await h(t).withLog('When I clear text and input invalid number', async () => {
    for(let i:number = 0; i < 6; i++){
      await telephonyDialog.clickDeleteButton();
    }
    await telephonyDialog.tapKeypad("2");
    await telephonyDialog.typeTextInDialer("s");
    await telephonyDialog.clickDialButton();
  })

  await h(t).log('Then I capture screenshot', { screenshotPath: 'Jupiter_Call_DialerInvalidNumber'})
});
