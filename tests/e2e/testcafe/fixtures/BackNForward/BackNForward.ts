/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-13 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import 'testcafe';
import { formalName } from '../../libs/filter';
import { ClientFunction } from 'testcafe';
import { h, H } from '../../v2/helpers';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';
import { setupCase, teardownCase } from '../../init';

fixture('BackNForward/BackNForward')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

const getLocation = ClientFunction(() => document.location.pathname);

test(
  formalName('test navigation on electron backwards and forwards functions',
    ['P2', 'JPT-44', 'JPT-49', 'BackNForward']
  ),
  async (t) => {
    if (!await H.isElectron()) {
      await h(t).log('This case only works on Electron!');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    //TODO: should has "header" web component trunk
    const backButton = app.homePage.getSelectorByAutomationId("Back");
    const forwardButton = app.homePage.getSelectorByAutomationId("Forward");

    await h(t).withLog('Then the forwad button should be disabled', async () => {
      await t.expect(forwardButton.hasAttribute('disabled')).ok();
    });

    await h(t).withLog('When I enter Contacts and Calendar in order', async () => {
      await app.homePage.leftPanel.contactsEntry.enter();
      await app.homePage.leftPanel.calendarEntry.enter();
    });

    await h(t).withLog('Then the back button should be enabled', async () => {
      await t.expect(backButton.hasAttribute('disabled')).notOk();
    });

    await h(t).withLog('When I click the back button', async () => {
      await t.click(backButton);
      await t.expect(getLocation()).contains('/contacts');
    });

    await h(t).withLog('Then the forward button should be enabled', async () => {
      await t.expect(forwardButton.hasAttribute('disabled')).notOk();
      await t.click(forwardButton);
      await t.expect(getLocation()).contains('/calendar');
    });
  }
);

test(
  formalName(
    'Check the back and forward buttons are disabled after user login',
    ['P2', 'JPT-50', 'BackNForward']
  ),
  async (t) => {
    if (!await H.isElectron()) {
      await h(t).log('This case only works on Electron!');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    //TODO: should has "header" web component trunk
    const backButton = app.homePage.getSelectorByAutomationId("Back");
    const forwardButton = app.homePage.getSelectorByAutomationId("Forward");

    await h(t).withLog('Then the forwad and back button should be disabled', async () => {
      await t.expect(forwardButton.hasAttribute('disabled')).ok();
      await t.expect(backButton.hasAttribute('disabled')).ok();
    });
  }
);

test(
  formalName(
    'reLoad should disable backward and forward button',
    ['P2', 'JPT-172', 'BackNForward']
  ),
  async (t) => {
    if (!await H.isElectron()) {
      await h(t).log('This case only works on Electron!');
      return;
    }

    const app = new AppRoot(t);
    const users = h(t).rcData.mainCompany.users;
    const user = users[0];

    await h(t).withLog(`When I login Jupiter with this extension: ${user.company.number}#${user.extension}`, async () => {
      await h(t).directLoginWithUser(SITE_URL, user);
      await app.homePage.ensureLoaded();
    });

    //TODO: should has "header" web component trunk
    const backButton = app.homePage.getSelectorByAutomationId("Back");
    const forwardButton = app.homePage.getSelectorByAutomationId("Forward");

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
      await t.expect(backButton.hasAttribute('disabled')).notOk();
    });

    await h(t).withLog('When I click the back button', async () => {
      await t.click(backButton);

    });

    await h(t).withLog('Then the forward and back button should be enabled', async () => {
      await t.expect(forwardButton.hasAttribute('disabled')).notOk();
      await t.expect(backButton.hasAttribute('disabled')).notOk();
    });

    await h(t).withLog('When I reload App', async () => {
      const current_url = await t.eval(() => window.location.href);
      await t.navigateTo(current_url);
    });

    await h(t).withLog('Then the forwad and back button should be disabled', async () => {
      await t.expect(forwardButton.hasAttribute('disabled')).ok();
      await t.expect(backButton.hasAttribute('disabled')).ok();
    });
  }
);
