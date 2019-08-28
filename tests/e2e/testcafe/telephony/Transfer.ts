/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2019-08-27 14:29:26
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta } from '../v2/models';

fixture('Telephony/Transfer')
  .beforeEach(setupCase(BrandTire.CALL_LOG_USER0_WITH_OTHERS))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  caseIds: ['JPT-2769'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Blind transfer is successfully', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });
   
  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('103');
  });

  await h(t).withLog('And click [Transfer] button', async () => {
    await telephonyDialog.clickTransferNowButton();
  });

  const alertText = 'Call transferred'
  await h(t).withLog('Then blind transfer success', async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2770'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Send to voicemail to transferred user is successfully', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });
   
  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('105');
  });

  await h(t).withLog('And click [To Voicemail] button', async () => {
    await telephonyDialog.clickTransferToVoicemailButton();
  });

  const alertText = 'Call transferred'
  await h(t).withLog('Then blind transfer success', async () => {
    await app.homePage.alertDialog.shouldBeShowMessage(alertText);
  });

  await h(t).withLog('Session close', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });
});

test.skip.meta(<ITestMeta>{
  caseIds: ['JPT-2774'],
  priority: ['P1'],
  maintainers: ['Yilia.Hong'],
  keywords: ['Transfer']
})('Send to voicemail to transferred user is successfully', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
    const callerWebPhone = await h(t).newWebphoneSession(caller);
  
    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  
    await h(t).withLog('And I on a call', async () => {
      await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
      await telephonyDialog.ensureLoaded();
      await telephonyDialog.clickAnswerButton();
      await t.expect(telephonyDialog.hangupButton.exists).ok();
    });
     
    await h(t).withLog('When I go to transfer page', async () => {
      await telephonyDialog.clickMoreOptionsButton();
      await telephonyDialog.clickTransferActionButton();
    });
  
    await h(t).withLog('And input transfer number', async () => {
      const title = "Transfer"
      await telephonyDialog.existForwardTitle(title);
      await telephonyDialog.tapKeypad('105');
    });
  
    await h(t).withLog('And click [To Voicemail] button', async () => {
      await telephonyDialog.clickTransferToVoicemailButton();
    });
  
    const alertText = 'Call transferred'
    await h(t).withLog('Then blind transfer success', async () => {
      await app.homePage.alertDialog.shouldBeShowMessage(alertText);
    });
  
    await h(t).withLog('Session close', async () => {
      await callerWebPhone.hangup();
      await callerWebPhone.waitForStatus('terminated');
    });
  });

test.meta(<ITestMeta>{
    caseIds: ['JPT-2767'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['Transfer']
  })('Can back to the previous page when remote side call is ended', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const caller = h(t).rcData.mainCompany.users[1];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;
  const callerWebPhone = await h(t).newWebphoneSession(caller);

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('And I on a call', async () => {
    await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    await telephonyDialog.ensureLoaded();
    await telephonyDialog.clickAnswerButton();
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });
   
  await h(t).withLog('When I go to transfer page', async () => {
    await telephonyDialog.clickMoreOptionsButton();
    await telephonyDialog.clickTransferActionButton();
  });

  await h(t).withLog('And input transfer number', async () => {
    const title = "Transfer"
    await telephonyDialog.existForwardTitle(title);
    await telephonyDialog.tapKeypad('105');
  });

  await h(t).withLog('And remote side end the call', async () => {
    await callerWebPhone.hangup();
    await callerWebPhone.waitForStatus('terminated');
  });

  await h(t).withLog('Then back to the previous page', async () => {
    await t.expect(telephonyDialog.self.exists).notOk();
  });   
});

test.skip.meta(<ITestMeta>{
    caseIds: ['JPT-2763'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['Transfer']
  })('Can back to the previous page when user at the complete transfer page', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
  
    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }); 
});

test.skip.meta(<ITestMeta>{
    caseIds: ['JPT-2771'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['Transfer']
  })('End call button shows "End call" tooltip at the complete transfer page', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
  
    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });  
  });

  test.skip.meta(<ITestMeta>{
    caseIds: ['JPT-2802'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['Transfer']
  })('Complete transfer button shows "Complete transfer" tooltip', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
  
    await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
      step.initMetadata({
        number: loginUser.company.number,
        extension: loginUser.extension,
      });
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  });
