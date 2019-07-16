import * as _ from 'lodash';
import { h, H } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../../config';
import { ITestMeta } from "../../../v2/models";


fixture('Setting/NotificationAndSounds/DesktopNotifications')
  .beforeEach(setupCase(BrandTire.RC_WITH_DID))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-2035'],
  maintainers: ['Cerrie.shen'],
  keywords: ['DesktopNotification']
})(`Check the page content of the "Desktop Notification" section`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];

  const sectionLabel = 'Desktop notifications';
  const browserSwitchLabel = "Desktop notifications for browser"
  const browserDescription = 'Turn on/off desktop notifications on your web browser. Browser permission is needed for desktop notifications.';

  const newMessageLabel = 'New messages';
  const newMessagesDescription = 'Choose your preference for desktop notifications for new messages';
  const defaultNewMessageSelectBoxValue = `Direct messages and mentions`;
  let newMessageItems = ['All new messages', 'Direct messages and mentions', 'Off'];

  const incomingCallsLabel = 'Incoming calls';
  const incomingCallDescription = 'Receive notifications for incoming calls';

  const missedCallAndNewVoicemailsLabel = 'Missed calls and new voicemails';
  const missedCallsAndNewVoicemailsDescription = 'Receive notifications for missed calls and new voicemails';

  await h(t).withLog(`Given I set glip profile want_desktop_notifications: true`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).updateProfile({ want_desktop_notifications: true });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  await h(t).withLog(`Then I can see label "{sectionLabel}" of the "Desktop Notification" section`, async (step) => {
    step.setMetadata('sectionLabel', sectionLabel);
    await t.expect(notificationAndSoundsSettingPage.desktopNotificationSectionTitle.textContent).eql(sectionLabel);
  });

  /** browser */
  if (await H.isElectron()) {
    await h(t).withLog(`And there is not browser switch item in Electron`, async () => {
      await t.expect(notificationAndSoundsSettingPage.desktopNotificationsSection.exists).notOk();
    });
  } else {
    await h(t).withLog(`And I can see label "{browserSwitchLabel}" of the 'Desktop notifications for browser' section item`, async (step) => {
      step.setMetadata('browserSwitchLabel', browserSwitchLabel);
      await t.expect(notificationAndSoundsSettingPage.browserSwitchItemLabel.textContent).eql(browserSwitchLabel);
    });

    await h(t).withLog(`And description "{browserDescription}"`, async (step) => {
      step.setMetadata('browserDescription', browserDescription);
      await t.expect(notificationAndSoundsSettingPage.browserSwitchItemDescription.textContent).eql(browserDescription);
    });

    await h(t).withLog(`And there is a toggle`, async () => {
      await t.expect(notificationAndSoundsSettingPage.browserSwitchItemToggle.exists).ok();
    });
  }

  /** new messages */
  await h(t).withLog(`And  I can see item label "{newMessageLabel}" of the "New messages" section item`, async (step) => {
    step.setMetadata('newMessageLabel', newMessageLabel);
    await t.expect(notificationAndSoundsSettingPage.newMessagesLabel.textContent).eql(newMessageLabel);
  });

  await h(t).withLog(`And description "{newMessagesDescription}"`, async (step) => {
    step.setMetadata('newMessagesDescription', newMessagesDescription);
    await t.expect(notificationAndSoundsSettingPage.newMessageDescription.textContent).eql(newMessagesDescription);
  });

  await h(t).withLog(`And there is a select box`, async () => {
    await t.expect(notificationAndSoundsSettingPage.newMessageItemSelectBox.exists).ok();
  });

  /** incoming calls */
  await h(t).withLog(`And  I can see item label "{incomingCallsLabel}" of the "Incoming calls" section item`, async (step) => {
    step.setMetadata('incomingCallsLabel', incomingCallsLabel);
    await t.expect(notificationAndSoundsSettingPage.incomingCallsLabel.textContent).eql(incomingCallsLabel);
  });

  await h(t).withLog(`And description "{incomingCallDescription}"`, async (step) => {
    step.setMetadata('incomingCallDescription', incomingCallDescription);
    await t.expect(notificationAndSoundsSettingPage.incomingCallsDescription.textContent).eql(incomingCallDescription);
  });

  await h(t).withLog('And there is toggle', async () => {
    await t.expect(notificationAndSoundsSettingPage.incomingCallsToggle.exists).ok();
  });

  /** missed call and new voicemails */
  await h(t).withLog(`And  I can see item label "{missedCallAndNewVoicemailsLabel}" of the "Missed calls and new voicemails" section item`, async (step) => {
    step.setMetadata('missedCallAndNewVoicemailsLabel', missedCallAndNewVoicemailsLabel);
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsLabel.textContent).eql(missedCallAndNewVoicemailsLabel);
  });

  await h(t).withLog(`And description "{missedCallsAndNewVoicemailsDescription}"`, async (step) => {
    step.setMetadata('missedCallsAndNewVoicemailsDescription', missedCallsAndNewVoicemailsDescription);
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsDescription.textContent).eql(missedCallsAndNewVoicemailsDescription);
  });

  await h(t).withLog('And there is toggle', async () => {
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsToggle.exists).ok();
  });

  await h(t).withLog('And the dropdown default value is: {defaultNewMessageSelectBoxValue}', async (step) => {
    step.setMetadata('defaultNewMessageSelectBoxValue', defaultNewMessageSelectBoxValue)
    await t.expect(notificationAndSoundsSettingPage.newMessageItemSelectBox.textContent).eql(defaultNewMessageSelectBoxValue);
  });

  await h(t).withLog(`When I click NewMessage item select box`, async () => {
    await notificationAndSoundsSettingPage.toggleOnBrowserNotification();
    await notificationAndSoundsSettingPage.clickNewMessageItemSelectBox();
  });

  await h(t).withLog(`Then I can see the newMessageItems in the list`, async () => {
    await notificationAndSoundsSettingPage.checkNewMessageDropDownItemCount(newMessageItems.length);
    await notificationAndSoundsSettingPage.newMessageDropDownItemsContains(newMessageItems);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2124'],
  maintainers: ['Cerrie.shen'],
  keywords: ['DesktopNotification']
})(`Check Disable new messages/incoming call/missed call and new voicemail sections`, async (t) => {

  const loginUser = h(t).rcData.mainCompany.users[0];
  await h(t).withLog(`Given I set glip profile want_desktop_notifications: false`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).updateProfile({ want_desktop_notifications: false });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  await h(t).withLog(`And I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  await h(t).withLog(`When I change desktop notifications for browser toggle to off`, async () => {
    await notificationAndSoundsSettingPage.toggleOffBrowserNotification();
  });
  await h(t).withLog(`And I can see New message/Incoming calls/Missed calls and new voicemails sections are disabled`, async () => {
    await t.expect(notificationAndSoundsSettingPage.newMessageItem.getAttribute('data-disabled')).eql('true');
    await t.expect(notificationAndSoundsSettingPage.incomingCallsItem.getAttribute('data-disabled')).eql('true');
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsItem.getAttribute('data-disabled')).eql('true');
  });
});


fixture('Setting/NotificationAndSounds/DesktopNotifications')
  .beforeEach(setupCase(BrandTire.RC_VOIP_DISABLE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2043'],
  maintainers: ['Cerrie.shen'],
  keywords: ['DesktopNotification']
})(`Check No incoming calls , Missed call and new voicemail section when account without call permission or not default phone app`, async (t) => {

  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`Given I set glip profile want_desktop_notifications: false`, async () => {
    await h(t).glip(loginUser).init();
    await h(t).glip(loginUser).updateProfile({ want_desktop_notifications: false });
  });

  const app = new AppRoot(t);
  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  await h(t).withLog(`Then I can see only Browser and New message item in the 'Desktop notifications' section`, async () => {
    if (await H.isElectron()) {
      await t.expect(notificationAndSoundsSettingPage.browserSwitchItem.exists).notOk();
    } else {
      await t.expect(notificationAndSoundsSettingPage.browserSwitchItem.exists).ok();
    }
    await t.expect(notificationAndSoundsSettingPage.newMessageItem.exists).ok();

    await t.expect(notificationAndSoundsSettingPage.incomingCallsItem.exists).notOk();
    await t.expect(notificationAndSoundsSettingPage.missedCallsAndVoicemailsItem.exists).notOk();
  });

});

