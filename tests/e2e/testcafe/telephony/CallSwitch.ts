/*
 * @Author: Naya Fang (naya.fang@ringcentral.com)
 * @Date: 2019-07-30 17:26:40
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta} from '../v2/models';

fixture('Telephony/CallSwitch')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
    caseIds: ['JPT-2527'],
    priority: ['P0'],
    maintainers: ['Naya.Fang'],
    keywords: ['CallSwitch']
    })('Call is switched successfully', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
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
    await h(t).withLog('And the inbound call is answered at the webphone', async () => {
      await loginUserWebPhone.answer();
    });
    await h(t).withLog('When I click the "Switch call to this device" in the green top hat', async () => {
      await telephonyDialog.clickSwitchToptap();
    });
    const callSwitchDialog = app.homePage.telephonyDialog.callSwitchDialog;
    await h(t).withLog('And I click the [Swicth] button at the confirmation dialog ', async () => {
      await telephonyDialog.clickSwitchOKButton();
    });
    await h(t).withLog('Then the confirmation dialog is disappear at the Jupiter', async () => {
      await t.expect(callSwitchDialog.exists).notOk();
    });
    await h(t).withLog('Then the call window is closed at the webphone', async () => {
      await loginUserWebPhone.waitForStatus('terminated');
    });
    await h(t).withLog('Then show the call window at the Jupiter ', async () => {
      await t.expect(telephonyDialog.header.exists).ok();
    });

});

test.meta(<ITestMeta>{
    caseIds: ['JPT-2528'],
    priority: ['P1'],
    maintainers: ['Naya.Fang'],
    keywords: ['CallSwitch']
  })('Cancel call switch successfully', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);
    const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
    let callerWebPhone = await h(t).newWebphoneSession(caller);

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });
    const telephonyDialog = app.homePage.telephonyDialog;
    await h(t).withLog('And I receive an inbound call', async () => {
        await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });
    await h(t).withLog('And the inbound call is answered at the webphone', async () => {
        await loginUserWebPhone.answer();
    });
    await h(t).withLog('When I click the "Switch call to this device" in the green top hat', async () => {
        await telephonyDialog.clickSwitchToptap();
    });
    const callSwitchDialog = app.homePage.telephonyDialog.callSwitchDialog;
    await h(t).withLog('And I click the [Cancel] button at the confirmation dialog ', async () => {
        await telephonyDialog.clickCancelSwitchButton();
    });
    await h(t).withLog('Then the confirmation dialog is disappear at the webphone', async () => {
        await t.expect(callSwitchDialog.exists).notOk();
    });
    await h(t).withLog('Then show the top hat', async () => {
        await t.expect(telephonyDialog.SwitchToptap.exists).ok();
    });
    await h(t).withLog('Then the call window should not be displayed at the Jupiter', async () => {
        await t.expect(telephonyDialog.visible).notOk();
        await t.expect(telephonyDialog.header.exists).ok();
    });
  });
test.meta(<ITestMeta>{
    caseIds: ['JPT-2533'],
    priority: ['P2'],
    maintainers: ['Naya.Fang'],
    keywords: ['CallSwitch']
  })('Top hat is disappear when call on the another RC endppint is ended', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);
    const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
    let callerWebPhone = await h(t).newWebphoneSession(caller);

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });
    const telephonyDialog = app.homePage.telephonyDialog;
    await h(t).withLog('And I receive an inbound call', async () => {
      await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });
    await h(t).withLog('And the inbound call is answered at the webphone', async () => {
      await loginUserWebPhone.answer();
    });
    await h(t).withLog('Then the call is ended at the webphone', async () => {
      await t.wait(1000);
      await loginUserWebPhone.hangup();
    });
    await h(t).withLog('Then the top hat is disappear at Jupiter', async () => {
      await t.expect(telephonyDialog.SwitchToptap.exists).notOk();
    });
  });


test.meta(<ITestMeta>{
    caseIds: ['JPT-2534'],
    priority: ['P2'],
    maintainers: ['Naya.Fang'],
    keywords: ['CallSwitch']
  })('Conformation dialog is disappear when the call on the another RC endpoint is ended', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    await h(t).glip(caller).init();
    const CallerUserName = await h(t).glip(caller).getPersonPartialData('display_name');

    await console.log(CallerUserName);
    const app = new AppRoot(t);
    const loginUserWebPhone = await h(t).newWebphoneSession(loginUser);
    let callerWebPhone = await h(t).newWebphoneSession(caller);


    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });
    const telephonyDialog = app.homePage.telephonyDialog;

    await h(t).withLog('And I receive an inbound call', async () => {
        await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });
    await h(t).withLog('And the inbound call is answered at the webphone', async () => {
        await loginUserWebPhone.answer();
    });
    await h(t).withLog('When I click the "Switch call to this device" in the green top hat', async () => {
        await telephonyDialog.clickSwitchToptap();
    });
    await h(t).withLog('And end the call on the webphone', async () => {
        await loginUserWebPhone.hangup();
        await t.wait(1000);
    });
    await h(t).withLog('Then the confirmation dialog is disappear at the Jupiter', async () => {
       await t.expect(telephonyDialog.callSwitchDialog.exists).notOk();
     });

    const alertText = `Your call with ${CallerUserName} is ended.`;
    await h(t).withLog(`Then a flash toast (short = 2s) displayed "${alertText}"`, async () => {
       await app.homePage.alertDialog.shouldBeShowMessage(alertText);
    });
  });
