import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Layout')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.skip(formalName('Resize windows', ['P0', 'JPT-24', 'LeftRail']), async (t: TestController) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[2];

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`,
    async () => {
      await h(t).directLoginWithUser(SITE_URL, loginUser);
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
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
    await app.homePage.messageTab.getCurrentGroupIdFromURL();
  });

  await h(t).withLog('resize window', async () => {
    await t.expect(app.homePage.messageTab.leftRail.visible).ok();
    await t.expect(app.homePage.messageTab.rightRail.visible).ok();
    await t.resizeWindow(750, 700);
    await t.expect(app.homePage.messageTab.leftRail.visible).notOk();
    await t.expect(app.homePage.messageTab.rightRail.visible).notOk();
  }, true);

  await h(t).withLog('resize to max window', async () => {
    await t.resizeWindow(1280, 720);
    await t.expect(app.homePage.messageTab.leftRail.visible).ok();
    await t.expect(app.homePage.messageTab.rightRail.visible).ok();
  }, true);

  await h(t).withLog('When I go to the Tasks', async () => {
    await app.homePage.leftPanel.tasksEntry.enter();
  });

  await h(t).withLog('When I go to the messages', async () => {
    await app.homePage.leftPanel.messagesEntry.enter();
  });

  await h(t).withLog('resize window', async () => {
    await t.expect(app.homePage.messageTab.leftRail.visible).ok();
    await t.expect(app.homePage.messageTab.rightRail.visible).ok();
    await t.resizeWindow(779, 700);
    await t.expect(app.homePage.messageTab.leftRail.visible).notOk();
    await t.expect(app.homePage.messageTab.rightRail.visible).notOk();
  }, true);

  await h(t).withLog('resize window', async () => {
    await t.resizeWindow(1440, 700);
    await t.expect(app.homePage.messageTab.leftRail.visible).ok();
    await t.expect(app.homePage.messageTab.rightRail.visible).ok();
  }, true);
},
);
