/*
 * @Author: Yilia Hong (yilia.hong@ringcentral.com)
 * @Date: 2019-07-02 17:26:40
 * Copyright © RingCentral. All rights reserved.
 */
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';
import { ITestMeta} from '../v2/models';

fixture('Telephony/RecentCallLogs')
  .beforeEach(setupCase(BrandTire.CALL_LOG_USER0_WITH_OTHERS))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
    caseIds: ['JPT-2296'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['RecentCallLogs']
    })('Display the tooltip when hovering on the [Recent calls] button', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
    const tooltipText = 'Recent calls'

    await h(t).withLog('Given I have the call permission', async () => {
    });

    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
        await h(t).directLoginWithUser(SITE_URL, loginUser);
        await app.homePage.ensureLoaded();
    });

    await h(t).withLog('When I click the diapad button', async () => {
        await t.expect(app.homePage.dialpadButton.exists).ok();
        await app.homePage.openDialer();
    });

    await h(t).withLog('Then display the dialer', async () => {
        await telephonyDialog.ensureLoaded();
        await t.expect(telephonyDialog.self.exists).ok();
    });

    await h(t).withLog('When I hover on the [Recent calls] button', async () => {
        await telephonyDialog.hoverRecentCallButton();
    });

    await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
        await app.homePage.showTooltip(tooltipText);
    });
});

test.meta(<ITestMeta>{
    caseIds: ['JPT-2313'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['RecentCallLogs']
  })('Display the tooltip when hovering on the [Back to dialer] button', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
    const tooltipText = 'Back to dialer'
  
    await h(t).withLog('Given I have the call permission', async () => {
    });
  
    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  
    await h(t).withLog('When I click the diapad button', async () => {
      await t.expect(app.homePage.dialpadButton.exists).ok();
      await app.homePage.openDialer();
    });
  
    await h(t).withLog('Then display the dialer', async () => {
      await telephonyDialog.ensureLoaded();
      await t.expect(telephonyDialog.self.exists).ok();
    });
  
    await h(t).withLog('When I go to call log page and hover on the [Back to dialer] button', async () => {
      await telephonyDialog.clickRecentCallButton();
      await t.expect(telephonyDialog.callLogList.exists).ok();
      await telephonyDialog.hoverBackToDialpadButton();
    });
  
    await h(t).withLog(`Then display a tooltip: '${tooltipText}`, async () => {
      await app.homePage.showTooltip(tooltipText);
    });
});


test.meta(<ITestMeta>{
    caseIds: ['JPT-2318'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['RecentCallLogs']
  })('Should NOT mark the UMI of miss call when open call history in dialer.', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
  
    await h(t).withLog('Given I have the call permission', async () => {
    });
  
    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  
    await h(t).withLog('When I click the diapad button', async () => {
      await t.expect(app.homePage.dialpadButton.exists).ok();
      await app.homePage.openDialer();
    });
  
    await h(t).withLog('Then display the dialer', async () => {
      await telephonyDialog.ensureLoaded();
      await t.expect(telephonyDialog.self.exists).ok();
    });
  
    await h(t).withLog('When I open recent call log', async () => {
      await telephonyDialog.clickRecentCallButton();
      await t.expect(telephonyDialog.callLogList.exists).ok();
    });
  
    await h(t).withLog('The UMI of missed call should not dismiss', async () => {
      await t.expect(app.homePage.leftPanel.phoneEntry.findSelector('.umi').exists).ok();
    });
});

test.meta(<ITestMeta>{
    caseIds: ['JPT-2319'],
    priority: ['P2'],
    maintainers: ['Yilia.Hong'],
    keywords: ['RecentCallLogs']
  })('Can receive inbound call when view call history in dialer.', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const caller = h(t).rcData.mainCompany.users[1];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
    const callerWebPhone = await h(t).newWebphoneSession(caller);
  
    await h(t).withLog('Given I have the call permission', async () => {
    });
  
    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  
    await h(t).withLog('When I click the diapad button', async () => {
      await t.expect(app.homePage.dialpadButton.exists).ok();
      await app.homePage.openDialer();
    });
  
    await h(t).withLog('Then display the dialer', async () => {
      await telephonyDialog.ensureLoaded();
      await t.expect(telephonyDialog.self.exists).ok();
    });
  
    await h(t).withLog('When I view recent call log', async () => {
      await telephonyDialog.clickRecentCallButton();
      await t.expect(telephonyDialog.callLogList.exists).ok();

    });

    await h(t).withLog('When I receive incoming call', async () => {
      await callerWebPhone.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
    });
  
    await h(t).withLog('Then show incoming call screen', async () => {
      await t.expect(telephonyDialog.answerButton.exists).ok();
    });

    await h(t).withLog('When callerUser hangup the call', async () => {
      await callerWebPhone.hangup();
    });
  
    await h(t).withLog('And callerUser webphone session status is "terminated"', async () => {
      await callerWebPhone.waitForStatus('terminated');
    });
});

test.meta(<ITestMeta>{
    caseIds: ['JPT-2325'],
    priority: ['P1'],
    maintainers: ['Yilia.Hong'],
    keywords: ['RecentCallLogs']
  })('Make call to the corresponding user when click record in call history list.', async (t) => {
    const loginUser = h(t).rcData.mainCompany.users[0];
    const app = new AppRoot(t);
    const telephonyDialog = app.homePage.telephonyDialog;
  
    await h(t).withLog('Given I have the call permission', async () => {
    });
  
    await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    });
  
    await h(t).withLog('When I click the diapad button', async () => {
      await t.expect(app.homePage.dialpadButton.exists).ok();
      await app.homePage.openDialer();
    });
  
    await h(t).withLog('Then display the dialer', async () => {
      await telephonyDialog.ensureLoaded();
      await t.expect(telephonyDialog.self.exists).ok();
    });
  
    await h(t).withLog('When open recent call log', async () => {
      await telephonyDialog.clickRecentCallButton();
      await t.expect(telephonyDialog.callLogList.exists).ok();
    });

    await h(t).withLog('when I click one item', async () => {
      await telephonyDialog.clickCallLogItem(1);
    });
  
    await h(t).withLog('Then make call to the corresponding user', async () => {
      await t.expect(telephonyDialog.hangupButton.exists).ok();
    });
});

test.meta(<ITestMeta>{
  caseIds: ['JPT-2326'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['RecentCallLogs']
})('Reset position of call history list after the call is initiated.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('Given I have the call permission', async () => {
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the diapad button', async () => {
    await t.expect(app.homePage.dialpadButton.exists).ok();
    await app.homePage.openDialer();
  });

  await h(t).withLog('Then display the dialer', async () => {
    await telephonyDialog.ensureLoaded();
    await t.expect(telephonyDialog.self.exists).ok();
  });

  await h(t).withLog('When I open recent call log and scroll list', async () => {
    await telephonyDialog.clickRecentCallButton();
    await t.expect(telephonyDialog.callLogList.exists).ok();
  });

  await h(t).withLog('when I scroll list and click one item', async () => {
    await telephonyDialog.scrollToBottom();
    await telephonyDialog.clickCallLogItem(4);
  });

  await h(t).withLog('Then make call to the corresponding user', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  });    
  
  await h(t).withLog('when end the call', async () => {
    await telephonyDialog.clickHangupButton();
  });

  await h(t).withLog('Then reset the scroll position', async () => {
    await telephonyDialog.expectStreamScrollToY(0);
  });
});

//Exist bug FIJI-7204
test.skip.meta(<ITestMeta>{
  caseIds: ['JPT-2328'],
  priority: ['P2'],
  maintainers: ['Yilia.Hong'],
  keywords: ['RecentCallLogs']
})(' Make call to the corresponding user when select record by keyboard.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const telephonyDialog = app.homePage.telephonyDialog;

  await h(t).withLog('Given I have the call permission', async () => {
  });

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click the diapad button', async () => {
    await t.expect(app.homePage.dialpadButton.exists).ok();
    await app.homePage.openDialer();
  });

  await h(t).withLog('Then display the dialer', async () => {
    await telephonyDialog.ensureLoaded();
    await t.expect(telephonyDialog.self.exists).ok();
  });

  await h(t).withLog('When I open recent call log', async () => {
    await telephonyDialog.clickRecentCallButton();
    await t.expect(telephonyDialog.callLogList.exists).ok();
  });

  await h(t).withLog('When I select item via keyboard', async () => {
    await telephonyDialog.selectItemByKeyboard();
    await telephonyDialog.hitEnterToMakeCall();
  });

  await h(t).withLog('Then make call to the corresponding user', async () => {
    await t.expect(telephonyDialog.hangupButton.exists).ok();
  }); 
});