import * as _ from 'lodash';
import { h } from '../../../v2/helpers';
import { setupCase, teardownCase } from '../../../init';
import { AppRoot } from '../../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire, SITE_ENV } from '../../../config';
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
  const app = new AppRoot(t);

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  const sectionLabel = 'Desktop Notifications';
  const browserDescription = 'Turn on/off desktop notifications on your web browser. Browser permission is needed for desktop notifications.';
  const newMessgesDescription = 'Choose your preference for desktop notifications for new messages';
  const incomingcallDescription = 'Choose your preference for desktop notifications for incoming calls';
  const missedCallsAndNewVoicemailsDescription = 'Choose your preference for desktop notifications for missed calls and new voicemails';
  let newMessageItems = ['All new messages','Direct messages and mentions','Off'];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });
  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });
  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });
  await h(t).withLog(`Then I can see '${sectionLabel}'in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existSectionLabel(sectionLabel);
  });
  await h(t).withLog(`And I can see Desktop notifications for browser label/description in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existbrowserItemLabel("Desktop notifications for browser");
    await notificationAndSoundsSettingPage.existBrowserItemDescription(browserDescription);
    await notificationAndSoundsSettingPage.existBrowserToggle();
  });
  await h(t).withLog(`And I can see Incoming Calls label/description/toggle in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existIncomingCallsLabel("Incoming Calls");
    await notificationAndSoundsSettingPage.existIncomingCallsDescription(incomingcallDescription);
  });
  await h(t).withLog(`And I can see Missed Calls and New Voicemails label/description/toggle in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existCallsAndVoicemailsLabel("Missed Calls and New Voicemails");
    await notificationAndSoundsSettingPage.existCallsAndVoicemailsDescription(missedCallsAndNewVoicemailsDescription);
  });
  await h(t).withLog(`And I can see New message label/description/DropDown select box in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existNewMessageItemLabel("New Messages");
    await notificationAndSoundsSettingPage.existNewMessageDescription(newMessgesDescription);
    await notificationAndSoundsSettingPage.existNewMessageDropDown();
  });
  const newMessagesValue = `Direct messages and mentions`;
  await h(t).withLog('And the dropdown default value is Direct messages and mentions', async () => {
   await t.expect(notificationAndSoundsSettingPage.newMessageSelector.innerText).eql(newMessagesValue);
  });
  await h(t).withLog(`And I click NewMessage DropDown`, async () => {
    await notificationAndSoundsSettingPage.clickNewMessageDropDownItem();

  });

  // skip because of ci config error
  // await h(t).withLog(`Then I can see the newMessageItems in the list`, async () => {
  //   await notificationAndSoundsSettingPage.checkNewMessageItemCount(newMessageItems.length);
  //   await notificationAndSoundsSettingPage.newMessageDropDownItemContains(newMessageItems);
  // });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2124'],
  maintainers: ['Cerrie.shen'],
  keywords: ['DesktopNotification']
})(`Check Disable new messages/incoming call/missed call and new voicemail sections`, async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  const sectionLabel = 'Desktop Notifications';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });
  await h(t).withLog(`Then I can see '${sectionLabel}'in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existSectionLabel(sectionLabel);
  });
  await h(t).withLog(`When I change destop notifications for browser toggle to off`, async () => {
    await notificationAndSoundsSettingPage.getBrowserToggleIsOFF();
  });

  await h(t).withLog(`And I can see New message/Incoming Calls/Missed calls and new voicemails sections are disabled`, async () => {
    await t.expect(notificationAndSoundsSettingPage.newMessageSection.getAttribute('data-disabled')).eql('true');
    await t.expect(notificationAndSoundsSettingPage.incomingCallsSection.getAttribute('data-disabled')).eql('true');
    await t.expect(notificationAndSoundsSettingPage.callsAndVoicemailsSection.getAttribute('data-disabled')).eql('true');

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
  const app = new AppRoot(t);
  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const notificationAndSoundsSettingPage = settingTab.notificationAndSoundPage;
  const sectionLabel = 'Desktop Notifications';

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And I click notificationAndSounds tab`, async () => {
    await settingTab.notificationAndSoundsEntry.enter();
  });

  await h(t).withLog(`Then I can see '${sectionLabel}'in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existSectionLabel(sectionLabel);
  });
  await h(t).withLog(`Then I can see only Browser and New message sections in the 'DesktopAndSounds' section`, async () => {
    await notificationAndSoundsSettingPage.existsBrowserSection();
    await notificationAndSoundsSettingPage.existsNewMessageSection();
    await notificationAndSoundsSettingPage.existsNoIncomingCallSection();
    await notificationAndSoundsSettingPage.existsNoMissedCallAndVoicemailSection();
  });



});

