/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import * as _ from 'lodash';
import { formalName } from '../libs/filter';
import { h } from '../v2/helpers';
import { setupCase, teardownCase } from '../init';
import { AppRoot } from '../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../config';

fixture('Left Navigator')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Enter every entries in left navigator', ['P0', 'LeftNav']), async (t) => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
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
    await h(t).withLog(`When I click "${entry.name}" entry`, async () => {
      await entry.enter();
    });
    await h(t).log(`Then I should enter ${entry.name} panel`, { screenshotPath: entry.name });
    await h(t).withLog(`And the url should be "/${entry.name}"`, async () => {
      await t.expect(h(t).href).contains(entry.name);
    });
  }
});
