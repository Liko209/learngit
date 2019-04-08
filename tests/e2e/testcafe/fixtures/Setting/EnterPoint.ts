/*
 * @Author: Potar.He 
 * @Date: 2019-04-08 14:34:14 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-08 19:13:30
 */

import * as _ from 'lodash';
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('Setting/EnterPoint')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P1'],
  caseIds: ['JPT-1585'],
  maintainers: ['Potar.He'],
  keywords: ['EnterPoint']
})('Display 6 settings sections in the list view by clicking the settings button.', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;
  const subSettingEntries = [
    settingTab.generalEntry,
    settingTab.notificationAndSoundsEntry,
    settingTab.messagingEntry,
    settingTab.phoneEntry,
    settingTab.meetingsEntry,
    settingTab.calendarEntry
  ];

  const entryNames = [
    'General', 'Notification and Sounds', 'Messaging', 'Phone', 'Meetings', 'Calendar'
  ];

  const urlPaths = [
    'settings/general',
    'settings/notification_and_sounds',
    'settings/messaging',
    'settings/phone',
    'settings/meetings',
    'settings/calendar'
  ];

  await h(t).withLog(`And I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  for (const i in subSettingEntries) {
    await h(t).withLog(`When I click sub-setting ${entryNames[i]} entry`, async () => {
      await subSettingEntries[i].enter();
    });

    await h(t).withLog(`Then the sub-setting entry should be opened`, async () => {
      await subSettingEntries[i].shouldBeOpened();
      await subSettingEntries[i].shouldBeNamed(entryNames[i]);
    });

    await h(t).withLog(`And the url should be "/${urlPaths[i]}"`, async () => {
      await t.expect(h(t).href).contains(urlPaths[i]);
    });
  }
});


test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1586'],
  maintainers: ['Potar.He'],
  keywords: ['EnterPoint']
})('Remember the last page the user left off in their last view of settings', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;

  const subSettingEntries = [
    settingTab.generalEntry,
    settingTab.notificationAndSoundsEntry,
    settingTab.messagingEntry,
    settingTab.phoneEntry,
    settingTab.meetingsEntry,
    settingTab.calendarEntry
  ];

  const leftPanel = app.homePage.leftPanel;

  const leftPanelEntries = [
    leftPanel.dashboardEntry,
    leftPanel.messagesEntry,
    leftPanel.phoneEntry,
    leftPanel.meetingsEntry,
    leftPanel.contactsEntry,
    leftPanel.calendarEntry,
    leftPanel.tasksEntry,
    leftPanel.notesEntry,
    leftPanel.filesEntry,
  ];

  for (const i in subSettingEntries) {
    await h(t).withLog(`When I click Setting entry and click No.${i} sub setting entry`, async () => {
      await settingsEntry.enter();
      await subSettingEntries[i].enter();
    });

    await h(t).withLog(`Then the sub setting entry should be opened`, async () => {
      await subSettingEntries[i].shouldBeOpened();
    }, true);

    let randomInt = Math.floor(Math.random() * leftPanelEntries.length)
    await h(t).withLog(`When I click another  random entry (named ${leftPanelEntries[randomInt].name}) of Navigation panel `, async () => {
      await leftPanelEntries[randomInt].enter();
    });

    await h(t).withLog(`And click Setting entry again`, async () => {
      await settingsEntry.enter();
    });

    await h(t).withLog(`Then the Previous sub-setting entry should be opened`, async () => {
      await subSettingEntries[i].shouldBeOpened();
    }, true);
  }
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1587'],
  maintainers: ['Potar.He'],
  keywords: ['EnterPoint']
})('Use Back/Forward button to view the settings sections they were previously on', async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const settingsEntry = app.homePage.leftPanel.settingsEntry;
  const settingTab = app.homePage.settingTab;

  const subSettingEntries = [
    settingTab.generalEntry,
    settingTab.notificationAndSoundsEntry,
    settingTab.messagingEntry,
    settingTab.phoneEntry,
    settingTab.meetingsEntry,
    settingTab.calendarEntry
  ];

  const entryNames = [
    'General', 'Notification and Sounds', 'Messaging', 'Phone', 'Meetings', 'Calendar'
  ];

  const urlPaths = [
    'settings/general',
    'settings/notification_and_sounds',
    'settings/messaging',
    'settings/phone',
    'settings/meetings',
    'settings/calendar'
  ];

  await h(t).withLog(`When I click Setting entry`, async () => {
    await settingsEntry.enter();
  });

  await h(t).withLog(`And click sub-Setting entry in order`, async () => {
    for (const entry of subSettingEntries) {
      await entry.enter();
    }
  });

  const backButton = app.homePage.header.backButton;
  const forwardButton = app.homePage.header.forwardButton;
  await h(t).withLog(`Then back button on header should be enabled, forward button on header should be disabled`, async () => {
    await backButton.shouldBeEnabled();
    await forwardButton.shouldBeDisabled();
  }, true);

  await h(t).withLog(`When I click the back button`, async () => {
    await backButton.clickSelf();
  }, true);

  let currentIndex = entryNames.length - 2;
  await h(t).withLog(`Then the opened sub-setting should be ${entryNames[currentIndex]}`, async () => {
    await subSettingEntries[currentIndex].shouldBeOpened();
    await t.expect(app.pagePath).eql(`/${urlPaths[currentIndex]}`);
  });

  await h(t).withLog(`And back and forward button on header should be enabled,`, async () => {
    await backButton.shouldBeEnabled();
    await forwardButton.shouldBeEnabled();
  });

  await h(t).withLog(`When I click the forward button`, async () => {
    await forwardButton.clickSelf();
  }, true);

  currentIndex = currentIndex + 1;
  await h(t).withLog(`Then the opened sub-setting should be ${entryNames[currentIndex]}`, async () => {
    await subSettingEntries[currentIndex].shouldBeOpened();
    await t.expect(app.pagePath).eql(`/${urlPaths[currentIndex]}`);
  });

  await h(t).withLog(`And back button on header should be enabled, but forward button should be disabled`, async () => {
    await backButton.shouldBeEnabled();
    await forwardButton.shouldBeDisabled();
  });
});