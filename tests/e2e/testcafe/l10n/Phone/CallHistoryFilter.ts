import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Phone/CallHistoryFilter')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

  test(formalName('Check no matchers in call history', ['P2', 'Phone', 'CallHistoryFilter', 'V1.6', 'Sean.Zhuang']), async (t) => {
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[0];

    const app = new AppRoot(t);

    await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
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

    const filterKey = 'Non nulla eu Lorem laborum ea proident cillum aliquip pariatur deserunt laborum exercitation et. Nostrud dolor do exercitation eiusmod consectetur duis ullamco consectetur voluptate fugiat tempor dolore. Commodo do mollit sit proident quis. Velit Lorem fugiat laboris id adipisicing cillum eu velit aliquip proident ullamco excepteur incididunt. Exercitation nisi in commodo elit do amet laborum culpa nulla ullamco ipsum Lorem enim.';
    await h(t).withLog('And I type a long text in the input', async () => {
      await t.typeText(callHistoryPage.filterInput, filterKey, {replace: true});
    });

    await h(t).withLog('Then I can see the empty page', async () => {
      await t.expect(callHistoryPage.emptyPage.exists).ok();
    });

    await h(t).log('And I take screenshot', { screenshotPath: 'Jupiter_Phone_NoMatchersFound' });

  });
