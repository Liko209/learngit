/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('LeftNav')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Left nav redirect', ['P0', 'LeftNav']), async (t) => {
  // every test case should start with following lines
  const user = h(t).rcData.mainCompany.users[4];
  const app = new AppRoot(t);

  // using Given-When-Then statements to write report
  await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  const leftPanel = app.homePage.leftPanel;
  const leftPanelEntries = [
    leftPanel.dashboardEntry,
    leftPanel.messagesEntry,
    leftPanel.phoneEntry,
    leftPanel.meetingsEntry,
    leftPanel.contactsEntry,
    leftPanel.calendarEntry,
    leftPanel.settingsEntry,
    leftPanel.tasksEntry,
    leftPanel.notesEntry,
    leftPanel.filesEntry,
  ];

  for (const entry of leftPanelEntries) {
    await h(t).withLog(`When I click ${entry.name}`, async () => {
      await entry.enter();
    });
    await h(t).log(`Then I enter ${entry.name}`, true);
  }
});
