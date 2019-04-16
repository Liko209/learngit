/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import 'testcafe';
import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { setupCase, teardownCase } from '../../init';

fixture('BackNForward/BackNForward')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());


test(formalName('test navigation on electron backwards and forwards functions', ['P2', 'JPT-44', 'JPT-49', 'BackNForward']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }
  );

  const backButton = app.homePage.header.backButton;
  const forwardButton = app.homePage.header.forwardButton;

  await h(t).withLog('Then the forward button should be disabled', async () => {
    await forwardButton.shouldBeDisabled();
  });

  await h(t).withLog('When I enter Contacts and Calendar in order', async () => {
    await app.homePage.leftPanel.contactsEntry.enter();
    await app.homePage.leftPanel.calendarEntry.enter();
  });

  await h(t).withLog('Then the back button should be enabled', async () => {
    await backButton.shouldBeEnabled();
  });

  await h(t).withLog('When I click the back button', async () => {
    await backButton.clickSelf();
    await t.expect(app.pagePath).contains('/contacts');
  });

  await h(t).withLog('Then the forward button should be enabled', async () => {
    await forwardButton.shouldBeEnabled();
    await forwardButton.clickSelf();
    await t.expect(app.pagePath).contains('/calendar');
  });
});

test(formalName('Check the back and forward buttons are disabled after user login', ['P2', 'JPT-50', 'BackNForward']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }
  );

  await h(t).withLog('Then the forward and back button should be disabled', async () => {
    await app.homePage.header.forwardButton.shouldBeDisabled();
    await app.homePage.header.backButton.shouldBeDisabled();
  });
});

test(formalName('reLoad should disable backward and forward button', ['P2', 'JPT-172', 'BackNForward']), async (t) => {
  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[0];

  await h(t).withLog(`When I login Jupiter with this extension: ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
      await app.homePage.ensureLoaded();
    }
  );

  const backButton = app.homePage.header.backButton
  const forwardButton = app.homePage.header.forwardButton

  await h(t).withLog('And I navigate every entry in left panel', async () => {
    await app.homePage.leftPanel.dashboardEntry.enter();
    await app.homePage.leftPanel.messagesEntry.enter();
    await app.homePage.leftPanel.phoneEntry.enter();
    await app.homePage.leftPanel.meetingsEntry.enter();
    await app.homePage.leftPanel.contactsEntry.enter();
    await app.homePage.leftPanel.calendarEntry.enter();
    await app.homePage.leftPanel.tasksEntry.enter();
    await app.homePage.leftPanel.notesEntry.enter();
    await app.homePage.leftPanel.filesEntry.enter();
    await app.homePage.leftPanel.settingsEntry.enter();
  });

  await h(t).withLog('Then the back button should be enabled', async () => {
    await backButton.shouldBeEnabled();
  });

  await h(t).withLog('When I click the back button', async () => {
    await backButton.clickSelf();
  });

  await h(t).withLog('Then the forward and back button should be enabled', async () => {
    await forwardButton.shouldBeEnabled();
    await backButton.shouldBeEnabled()
  });

  await h(t).withLog('When I reload App', async () => {
    await app.reload();
  });

  await h(t).withLog('Then the forward and back button should be disabled', async () => {
    await forwardButton.shouldBeDisabled();
    await backButton.shouldBeDisabled();
  });
  
});
