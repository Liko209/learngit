import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL } from '../../config';

fixture('Layout')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(
  formalName('Resize windows', ['P0', 'JPT-24', 'LeftRail']),
  async (t: TestController) => {
    const app = new AppRoot(t);
    const user = h(t).rcData.mainCompany.users[2];

    await h(t).withLog(
      `Given I login Jupiter with ${user.company.number}#${user.extension}`,
      async () => {
        await h(t).directLoginWithUser(SITE_URL, user);
        await app.homePage.ensureLoaded();
      },
    );
    await t.debug();

    await h(t).withLog('When I go to the dashboard', async () => {
      await app.homePage.leftPanel.dashboardEntry.enter();
    });

    await h(t).withLog('When I go to the calendar', async () => {
      await app.homePage.leftPanel.calendarEntry.enter();
    });

    await h(t).withLog('When I go to the meeting', async () => {
      await app.homePage.leftPanel.meetingsEntry.enter();
    });

    await h(t).withLog('resize window', async () => {
      await t.resizeWindow(750, 700);
      await t.expect(app.homePage.messagePanel.root.exists).notOk();
    });
  },
);
