import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ensuredOneCallLog } from '../../fixtures/PhoneTab/CallHistory/utils';

fixture('Phone/CallHistory')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check empty call history', ['P2', 'Phone', 'CallHistory', 'V1.6', 'Sean.Zhuang']), async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[0];

    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });

    const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
    const telephoneDialog = app.homePage.telephonyDialog;

    await h(t).withLog('When I click Phone entry of leftPanel and click call history entry', async () => {
      await app.homePage.leftPanel.phoneEntry.enter();
      await app.homePage.phoneTab.callHistoryEntry.enter();
      await callHistoryPage.ensureLoaded();
    });

    await h(t).withLog('And minimize phone dialog',async()=>{
      if (await telephoneDialog.exists) {
        await telephoneDialog.clickMinimizeButton()
      }
    })

    await h(t).log('Then I take screenshot', { screenshotPath: 'Jupiter_Phone_EmptyCallHistory' });

  });
