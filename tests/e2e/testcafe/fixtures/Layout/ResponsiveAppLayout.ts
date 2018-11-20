import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('Layout')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Resize windows', ['P0', 'JPT-24', 'LeftRail']),
  async (t: TestController) => {
    if (await H.isElectron() || await H.isEdge()) {
      await h(t).log('This case is not working on Electron or Edge!');
      return;
    }
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[2];

    await h(t).withLog(`Given I login Jupiter with ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );

    await h(t).withLog('When I go to the dashboard', async () => {
      await app.homePage.leftPanel.dashboardEntry.enter();
    });

    await h(t).withLog('When I go to the calendar', async () => {
      await app.homePage.leftPanel.calendarEntry.enter();
    });

    await h(t).withLog('When I go to the meeting', async () => {
      await app.homePage.leftPanel.meetingsEntry.enter();
    });

    await h(t).withLog('When I go to the messages', async () => {
      await app.homePage.leftPanel.messagesEntry.enter();
    });

    await h(t).withLog(`Then I enter a conversation in team section`, async () => {
      await app.homePage.messagePanel.teamsSection.nthConversationEntry(0).enter();
      await app.homePage.messagePanel.getCurrentGroupIdFromURL();
    });

    await h(t).withLog('resize window', async () => {
      // TODO: messagePanel's locator is deprecated?
      await t.expect(app.homePage.leftRail.visible).ok();
      await t.expect(app.homePage.rightRail.visible).ok();
      await t.resizeWindow(750, 700);
      await t.expect(app.homePage.leftRail.visible).notOk();
      await t.expect(app.homePage.rightRail.visible).notOk();
    }, true);

    await h(t).withLog('resize to max window', async () => {
      await t.resizeWindow(1280, 720);
      await t.expect(app.homePage.leftRail.visible).ok();
      await t.expect(app.homePage.rightRail.visible).ok();
      // TODO: messagePanel's locator is deprecated?
    }, true);

    await h(t).withLog('When I go to the Tasks', async () => {
      await app.homePage.leftPanel.tasksEntry.enter();
    });

    await h(t).withLog('When I go to the messages', async () => {
      await app.homePage.leftPanel.messagesEntry.enter();
    });

    await h(t).withLog('resize window', async () => {
      await t.expect(app.homePage.leftRail.visible).ok();
      await t.expect(app.homePage.rightRail.visible).ok();
      await t.resizeWindow(779, 700);
      await t.expect(app.homePage.leftRail.visible).notOk();
      await t.expect(app.homePage.rightRail.visible).notOk();
      // TODO: messagePanel's locator is deprecated?
    }, true);

    await h(t).withLog('resize window', async () => {
      await t.resizeWindow(1440, 700);
      await t.expect(app.homePage.leftRail.visible).ok();
      await t.expect(app.homePage.rightRail.visible).ok();
      // TODO: messagePanel's locator is deprecated?
    }, true);
  },
);
