/*
*
* @Author: Alexander Zaverukha (alexander.zaverukha@ab-soft.com)
* @Date: 5/31/2019 12:34:14
* Copyright © RingCentral. All rights reserved.
*/

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('LeftNav/NavigationPanel')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-16'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['NavigationPanel']
})('The top list of left navigation should include the most important unified application sections', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const unifiedAppSections = [];
  await h(t).withLog(`When I check the top list of left navigation`, async () => {
    let entries = await app.homePage.leftPanel.unifiedAppEntries();
    for( let i = 0; i < entries.length; i++){
      const name = await entries[i].text.innerText;
      unifiedAppSections.push(name);
    }
  });

  console.log(unifiedAppSections);
  await h(t).withLog(`Then there is '1. Dashboard' app section`, async () => {
    await t.expect(unifiedAppSections[0]).eql('Dashboard');
    await t.expect(app.homePage.leftPanel.dashboardEntry.exists).ok()
  });

  await h(t).withLog(`Then there is '2.Messages' app section`, async () => {
    await t.expect(unifiedAppSections[1]).eql('Messages');
    await t.expect(app.homePage.leftPanel.messagesEntry.exists).ok()
  });

  await h(t).withLog(`Then there is '3.Phone' app section`, async () => {
    await t.expect(unifiedAppSections[2]).eql('Phone');
    await t.expect(app.homePage.leftPanel.phoneEntry.exists).ok()
  });

  await h(t).withLog(`Then there is '4.Meetings' app section`, async () => {
    await t.expect(unifiedAppSections[3]).eql('Meetings');
    await t.expect(app.homePage.leftPanel.meetingsEntry.exists).ok()
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-17'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['NavigationPanel']
})('The bottom list of left navigation should include other application sections', async (t: TestController) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension} `, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const unifiedAppSections = [];
  await h(t).withLog(`When I check the bottom list of left navigation`, async () => {
    let entries = await app.homePage.leftPanel.otherAppEntries();
    for( let i = 0; i < entries.length; i++){
      const name = await entries[i].text.innerText;
      unifiedAppSections.push(name);
    }
    unifiedAppSections.reverse();
  });

  await h(t).withLog(`Then there is '1. Settings' app section`, async () => {
    await t.expect(app.homePage.leftPanel.settingsEntry.exists).ok()
    await t.expect(unifiedAppSections[0]).eql('Settings');
  });

  await h(t).withLog(`Then there is '2. Files' app section`, async () => {
    await t.expect(app.homePage.leftPanel.filesEntry.exists).ok()
    await t.expect(unifiedAppSections[1]).eql('Files');
  });

  await h(t).withLog(`Then there is '3. Notes' app section`, async () => {
    await t.expect(app.homePage.leftPanel.notesEntry.exists).ok()
    await t.expect(unifiedAppSections[2]).eql('Notes');
  });

  await h(t).withLog(`Then there is '4. Tasks' app section`, async () => {
    await t.expect(app.homePage.leftPanel.tasksEntry.exists).ok()
    await t.expect(unifiedAppSections[3]).eql('Tasks');
  });

  await h(t).withLog(`Then there is '5. Calendar' app section`, async () => {
    await t.expect(app.homePage.leftPanel.calendarEntry.exists).ok()
    await t.expect(unifiedAppSections[4]).eql('Calendar');
  });

  await h(t).withLog(`Then there is '6. Contacts' app section`, async () => {
    await t.expect(app.homePage.leftPanel.contactsEntry.exists).ok()
    await t.expect(unifiedAppSections[5]).eql('Contacts');
  });
});
