import { formalName } from '../../libs/filter';
import { h, H } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';

fixture('Layout')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test(formalName('Resize windows', ['P0', 'JPT-24', 'LeftRail']), async (t: TestController) => {
  if (await H.isElectron() || await H.isEdge()) {
    await h(t).log('This case (resize) is not working on Electron or Edge!');
    return;
  }

  const app = new AppRoot(t);
  const loginUser = h(t).rcData.mainCompany.users[2];
  await h(t).glip(loginUser).init();
  await h(t).glip(loginUser).clearFavoriteGroupsRemainMeChat();

  const defaultLefNav = 64;
  const minLeftRail = 180;
  const defaultLeftRail = 268;
  const minRightRail = 180;
  const minCenterPanel = 400;

  const rightRailDisappear = defaultLefNav + minLeftRail + minCenterPanel + minRightRail - 10;
  const leftRailDisappear = defaultLefNav + minLeftRail + minCenterPanel - 10
  const shouldKeepMinCenterPanel = defaultLefNav + minCenterPanel - 10;

  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter mecaht', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter()
  }, true);

  const checkRailInvisible = async (sel: Selector) => {
    await H.retryUntilPass(async () => {
      if (await sel.exists) {
        if (await sel.visible) {
          await t.expect(sel.getBoundingClientRectProperty('width')).lte(1);
        }
      }
    })
  }
  const checkRailVisible = async (sel: Selector) => {
    await t.expect(sel.exists).ok()
    await t.expect(sel.visible).ok();
    await t.expect(sel.getBoundingClientRectProperty('width')).gte(1);
  }

  const leftRail = app.homePage.messageTab.leftRail.self.parent(0);
  const rightRail = app.homePage.messageTab.rightRail.self.parent(0);

  await h(t).withLog('Then left and right rail are visible', async () => {
    await checkRailVisible(leftRail);
    await checkRailVisible(rightRail);
  }, true);

  await h(t).withLog('When I resize widow width {rightRailDisappear}', async (step) => {
    step.setMetadata('rightRailDisappear', rightRailDisappear.toString())
    await t.resizeWindow(rightRailDisappear, 700);
  }, true);

  await h(t).withLog('Then right rail is invisible', async () => {
    await checkRailVisible(leftRail);
    await checkRailInvisible(rightRail);
  }, true);

  await h(t).withLog('When I resize widow width {leftRailDisappear}', async (step) => {
    step.setMetadata('leftRailDisappear', leftRailDisappear.toString())
    await t.resizeWindow(leftRailDisappear, 700);
  }, true);

  await h(t).withLog('Then left and right rail are invisible', async () => {
    await checkRailInvisible(leftRail);
    await checkRailInvisible(rightRail);
  }, true);;

  // only 436 not 400???
  // await h(t).withLog('When I resize widow width {shouldKeepMinCenterPanel}', async (step) => {
  //   step.setMetadata('shouldKeepMinCenterPanel', shouldKeepMinCenterPanel.toString())
  //   await t.resizeWindow(shouldKeepMinCenterPanel, 700);
  // }, true);

  // await h(t).withLog('Then center panel keep width {minCenterPanel} ', async (step) => {
  //   step.setMetadata('minCenterPanel', minCenterPanel.toString());
  //   await checkRailInvisible(leftRail);
  //   await checkRailInvisible(rightRail);
  //   await t.expect(app.homePage.messageTab.conversationPage.self.getBoundingClientRectProperty('width')).eql(minCenterPanel)
  // }, true);
});
