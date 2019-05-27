/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import 'testcafe';
import { h, H } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { setupCase, teardownCase } from '../../init';
import { ITestMeta } from '../../v2/models';
import { clickOnMainMenuItem, setElectronDialogHandler } from 'testcafe-browser-provider-electron';
import { ClientFunction, RequestMock } from 'testcafe';
import axios from 'axios';
import { WebphoneSession } from '../../v2/webphone/session';

fixture('Electron/Upgrade')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-1898"],
  keywords: ["electron", "upgrade"],
  maintainers: ['potar.he']
})('No Upgrade Needed" dialog will be shown when user click the electron menu', async (t) => {
  if (!await H.isElectron()) {
    console.log('This case only can run in electron!!!')
    return
  }

  const title = "No Upgrade Needed";
  const message = "Your desktop app is up-to-date.";
  const okButtonText = "OK"

  await h(t).withLog(`Given I open the ${SITE_URL}`, async () => {
    await t.navigateTo(SITE_URL);
  });

  const site = new URL(SITE_URL);
  await h(t).withLog(`And I mock "${site.origin}/eversion.json" to set the user's current version of the app = market version`, async () => {
    const currentVersion: string = await ClientFunction(() => {
      return window["jupiterElectron"].getElectronVersionInfo().electronAppVersionNumber;
    })();
    const data = await axios.get(`${site.origin}/eversion.json`, { proxy: false }).then(res => res.data);
    let platform = await ClientFunction(() => navigator.platform)();
    const isMac = /^Mac/i.test(platform);
    if (isMac) {
      data.os.mac = currentVersion;
    } else {
      data.os.win = currentVersion;
    }
    data.version = currentVersion;
    const swNotificationMock = RequestMock()
      .onRequestTo(/\/eversion.json/)
      .respond(JSON.stringify(data), 200, { "content-type": "application/javascript" });
    await t.addRequestHooks(swNotificationMock);
  });

  await h(t).withLog(`When I click "RingCentral" menu, and then[Check For Updates] item`, async () => {
    await clickOnMainMenuItem(['RingCentral', 'Check For Updates']);
  });

  const app = new AppRoot(t);
  const upgradeDialog = app.upgradeDialog;
  await h(t).withLog(`Then A dialog will be shown`, async () => {
    await upgradeDialog.ensureLoaded();
  });

  await h(t).withLog(`And title should be "${title}"`, async () => {
    await upgradeDialog.titleShouldBe(title);
  });

  await h(t).withLog(`And message should be "${message}"`, async () => {
    await upgradeDialog.messageShouldBe(message);
  });

  await h(t).withLog(`And should has "${okButtonText}" button`, async () => {
    await t.expect(upgradeDialog.okButton.withExactText(okButtonText)).ok();
  });

  await h(t).withLog(`When I click the "${okButtonText}" button`, async () => {
    await upgradeDialog.clickOkButton();
  });

  await h(t).withLog(`And The dialog is dismissed`, async () => {
    await upgradeDialog.ensureDismiss();
  });

});



test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-1900"],
  keywords: ["electron", "upgrade"],
  maintainers: ['potar.he']
})('Download the app when user click the Upgrade button', async (t) => {
  if (!await H.isElectron()) {
    console.log('This case only can run in electron!!!')
    return
  }

  await h(t).withLog(`Given I open the ${SITE_URL}`, async () => {
    await t.navigateTo(SITE_URL);
  });

  const site = new URL(SITE_URL);
  let targetDownloadSite: string;
  await h(t).withLog(`And I mock "${site.origin}/eversion.json" to set the user's current version of the app < market version`, async () => {
    const currentVersion: string = await ClientFunction(() => {
      return window["jupiterElectron"].getElectronVersionInfo().electronAppVersionNumber;
    })();

    const data = await axios.get(`${site.origin}/eversion.json`, { proxy: false }).then(res => res.data);
    const firstPos = currentVersion.split('.')[0];
    let platform = await ClientFunction(() => navigator.platform)();
    const isMac = /^Mac/i.test(platform);
    const mockVersion = currentVersion.replace(/(^\d+)/, (+firstPos + 1).toString());
    if (isMac) {
      targetDownloadSite = data.source.mac;
      data.os.mac = mockVersion;
    } else {
      targetDownloadSite = data.source.win;
      data.os.win = mockVersion;
    }
    data.version = mockVersion;

    const swNotificationMock = RequestMock()
      .onRequestTo(/\/eversion.json/)
      .respond(JSON.stringify(data), 200, { "content-type": "application/javascript" });
    await t.addRequestHooks(swNotificationMock);
  });

  await h(t).withLog(`When I click "RingCentral" menu, and then[Check For Updates] item`, async () => {
    await clickOnMainMenuItem(['RingCentral', 'Check For Updates']);
  });

  const app = new AppRoot(t);
  const upgradeDialog = app.upgradeDialog;
  await h(t).withLog(`Then A dialog will be shown`, async () => {
    await upgradeDialog.ensureLoaded();
  });

  // recently can not handler open-dialog to download. So check href and class of "Upgrade"
  await h(t).withLog(`And the href of "Upgrade" button should be ${targetDownloadSite}`, async () => {
    await t.expect(upgradeDialog.upgradeUrl).eql(targetDownloadSite);
    await t.expect(upgradeDialog.upgradeButton.hasAttribute('download')).ok();
  });

  await h(t).withLog(`When I click "Upgrade" button`, async () => {
    await upgradeDialog.clickUpgradeButton();
  });

  await h(t).withLog(`And The dialog is dismissed`, async () => {
    await upgradeDialog.ensureDismiss();
  });
});

test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-1904"],
  keywords: ["electron", "upgrade"],
  maintainers: ['potar.he']
})(`Soft/Force upgrade alert won't pops up when the current version is latest`, async (t) => {
  if (!await H.isElectron()) {
    console.log('This case only can run in electron!!!')
    return
  }

  await h(t).withLog(`Given I open the ${SITE_URL}`, async () => {
    await t.navigateTo(SITE_URL);
  });

  const site = new URL(SITE_URL);
  await h(t).withLog(`And I mock "${site.origin}/eversion.json" to set the user's current version of the app = market version`, async () => {
    const currentVersion: string = await ClientFunction(() => {
      return window["jupiterElectron"].getElectronVersionInfo().electronAppVersionNumber;
    })();
    const data = await axios.get(`${site.origin}/eversion.json`, { proxy: false }).then(res => res.data);
    let platform = await ClientFunction(() => navigator.platform)();
    const isMac = /^Mac/i.test(platform);
    if (isMac) {
      data.os.mac = currentVersion;
    } else {
      data.os.win = currentVersion;
    }
    data.version = currentVersion

    const swNotificationMock = RequestMock()
      .onRequestTo(/\/eversion.json/)
      .respond(JSON.stringify(data), 200, { "content-type": "application/javascript" });
    await t.addRequestHooks(swNotificationMock);
  });

  const loginUser = h(t).rcData.mainCompany.users[1];

  const app = new AppRoot(t);

  await h(t).withLog(`When I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const upgradeDialog = app.upgradeDialog;

  await h(t).withLog(`And Can not see the upgrade dialog`, async () => {
    await upgradeDialog.ensureDismiss();
  });

  await h(t).withLog(`When I reload the page`, async () => {
    await app.reload();
  });

  await h(t).withLog(`And Can not see the upgrade dialog`, async () => {
    await upgradeDialog.ensureDismiss();
  });
});


test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-1910"],
  keywords: ["electron", "upgrade"],
  maintainers: ['potar.he']
})(`Soft/Force upgrade alert won't pops up when the user reloads the app on login page`, async (t) => {
  if (!await H.isElectron()) {
    console.log('This case only can run in electron!!!')
    return
  }

  await h(t).withLog(`Given I open the ${SITE_URL}`, async () => {
    await t.navigateTo(SITE_URL);
  });

  const site = new URL(SITE_URL);
  await h(t).withLog(`And I mock "${site.origin}/eversion.json" to set the user's current version of the app <= market version`, async () => {
    const currentVersion: string = await ClientFunction(() => {
      return window["jupiterElectron"].getElectronVersionInfo().electronAppVersionNumber;
    })();
    const data = await axios.get(`${site.origin}/eversion.json`, { proxy: false }).then(res => res.data);
    let platform = await ClientFunction(() => navigator.platform)();
    const isMac = /^Mac/i.test(platform);
    if (isMac) {
      data.os.mac = currentVersion;
    } else {
      data.os.win = currentVersion;
    }
    data.version = currentVersion

    const swNotificationMock = RequestMock()
      .onRequestTo(/\/eversion.json/)
      .respond(JSON.stringify(data), 200, { "content-type": "application/javascript" });
    await t.addRequestHooks(swNotificationMock);
  });


  const app = new AppRoot(t);
  const upgradeDialog = app.upgradeDialog;

  await h(t).withLog(`And Can not see the upgrade dialog`, async () => {
    await upgradeDialog.ensureDismiss();
  });

  await h(t).withLog(`When I reload the page`, async () => {
    await app.reload();
  });

  await h(t).withLog(`And Can not see the upgrade dialog`, async () => {
    await upgradeDialog.ensureDismiss();
  });
});


test.meta(<ITestMeta>{
  priority: ["P2"],
  caseIds: ["JPT-1903"],
  keywords: ["electron", "upgrade", "telephony"],
  maintainers: ['potar.he']
})(`Soft/Force upgrade alert won't pops up when the current version is latest`, async (t) => {
  if (!await H.isElectron()) {
    console.log('This case only can run in electron!!!')
    return
  }

  await h(t).withLog(`Given I open the ${SITE_URL}`, async () => {
    await t.navigateTo(SITE_URL);
  });

  const site = new URL(SITE_URL);
  await h(t).withLog(`And I mock "${site.origin}/eversion.json" to set the user's current version of the app < market version`, async () => {
    const currentVersion: string = await ClientFunction(() => {
      return window["jupiterElectron"].getElectronVersionInfo().electronAppVersionNumber;
    })();
    const data = await axios.get(`${site.origin}/eversion.json`, { proxy: false }).then(res => res.data);
    let platform = await ClientFunction(() => navigator.platform)();
    const isMac = /^Mac/i.test(platform);
    const firstPos = currentVersion.split('.')[0];
    const mockVersion = currentVersion.replace(/(^\d+)/, (+firstPos + 1).toString());
    if (isMac) {
      data.os.mac = mockVersion;
    } else {
      data.os.win = mockVersion;
    }
    data.version = mockVersion;

    const swNotificationMock = RequestMock()
      .onRequestTo(/\/eversion.json/)
      .respond(JSON.stringify(data), 200, { "content-type": "application/javascript" });
    await t.addRequestHooks(swNotificationMock);
  });

  const users = h(t).rcData.mainCompany.users
  const loginUser = users[1];
  const anotherUser = users[2]
  const app = new AppRoot(t);

  let webphoneSession: WebphoneSession;
  await h(t).withLog(`And anotherUser ${anotherUser} login webphone session`, async () => {
    webphoneSession = await h(t).newWebphoneSession(anotherUser);
  });

  await h(t).withLog(`And I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });


  await h(t).withLog(`When I click "RingCentral" menu, and then[Check For Updates] item`, async () => {
    await clickOnMainMenuItem(['RingCentral', 'Check For Updates']);
  });

  const upgradeDialog = app.upgradeDialog;
  await h(t).withLog(`Then A dialog will be shown`, async () => {
    await upgradeDialog.ensureLoaded();
  });

  await h(t).withLog(`When anotherUser webphone call loginUser`, async () => {
    await webphoneSession.makeCall(`${loginUser.company.number}#${loginUser.extension}`);
  });

  const telephonyDialog = app.homePage.telephonyDialog;
  await h(t).withLog(`Then loginUser can receive the incoming call`, async () => {
    await telephonyDialog.ensureLoaded(20e3);
  });

  await h(t).withLog(`When I ignore the incoming call`, async () => {
    await telephonyDialog.clickIgnoreButton();
  });

  await h(t).withLog(`Then the upgrade dialog should still pops up`, async () => {
    await upgradeDialog.ensureLoaded();
  });
});