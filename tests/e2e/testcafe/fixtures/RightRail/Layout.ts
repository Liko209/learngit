/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-18 16:28:11
 * Copyright © RingCentral. All rights reserved.
 */

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { ITestMeta } from '../../v2/models';

fixture('RightRail/Layout')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-726', 'JPT-748', 'JPT-744', 'JPT-745', 'JPT-700'],
  keywords: ['RightRail', 'Layout'],
  maintainers: ['henry.xu'],
})('UI of right shelf layout / open and hidden  / tooltip / resize window / keep status', async t => {
  const loginUser = h(t).rcData.mainCompany.users[0];
  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with an extension`, async (step) => {
    step.initMetadata({ name: loginUser.company.number, extension: loginUser.extension });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const rightRail = app.homePage.messageTab.rightRail;
  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.favoritesSection.nthConversationEntry(0).enter();
  });

  const title = 'Conversation details';
  await h(t).withLog(`Then I should find the title of right shelf to be "${title}"`, async () => {
    await t.expect(rightRail.title.textContent).eql(title);
  });

  await h(t).withLog('And hide shelf button should be visible', async () => {
    await t.expect(rightRail.expandStatusButton.visible).ok();
  });

  const tabs = ['Pinned', 'Files', 'Images', 'Tasks', 'Links', 'Notes', 'Events', 'Integrations'];
  await h(t).withLog(`And the tab names should be displayed with order: ${tabs.join('/')}`, async (step) => {
    const displayedButtonsCount: number = await rightRail.displayedTabButtons.count;
    const displayedTabs = tabs.slice(0, displayedButtonsCount - 1);
    for (const i in displayedTabs) {
      await step.withSubStep(`nth=${i} displayed tab should be ${displayedTabs[i]}`, async () => {
        await t.expect(rightRail.displayedTabButtons.nth(Number(i)).textContent).eql(displayedTabs[i]);
      })
    }
    await rightRail.openMore();
    const hidedTabs = tabs.slice(displayedButtonsCount - 1, tabs.length);
    for (const i in hidedTabs) {
      await step.withSubStep(`nth=${i} hided tab should be ${hidedTabs[i]}`, async () => {
        await t.expect(rightRail.moreTabsMenuEntries.nth(Number(i)).textContent).eql(hidedTabs[i]);
      })
    }
  }, true);

  await h(t).withLog('When I click hide button', async () => {
    await rightRail.fold();
  });

  await h(t).withLog('Then right shelf should be folded', async () => {
    await t.expect(rightRail.self.clientWidth).eql(0);
  }, true);

  const resolutions = [[500, 300], [600, 400], [700, 500], [800, 600], [1280, 720]];
  for (const resolution of resolutions) {
    await h(t).withLog(`When I resize window to ${resolution.join('x')}`, async () => {
      await t.resizeWindow(resolution[0], resolution[1]);
    });
    await h(t).withLog('Then right shelf should still be folded', async () => {
      await rightRail.shouldBeFolded();
    });
  }

  await h(t).withLog('When I switch to another conversation', async () => {
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  await h(t).withLog('Then right shelf should still be folded', async () => {
    await rightRail.shouldBeFolded();
  });

  await h(t).withLog('When I switch to another tab and back again', async () => {
    await app.homePage.leftPanel.dashboardEntry.enter();
    await app.homePage.leftPanel.messagesEntry.enter();
  });

  await h(t).withLog('Then right shelf should still be folded', async () => {
    await rightRail.shouldBeFolded();
  });

  await h(t).withLog('When I refresh the web page', async () => {
    await app.reload();
  });

  await h(t).withLog('Then right shelf should still be folded', async () => {
    await rightRail.shouldBeFolded();
  });

  await h(t).withLog('When I hover on expand button', async () => {
    await t.hover(rightRail.expandStatusButton, {speed: 0.1});
  });

  const expandButtonTooltip = 'Show details';
  await h(t).withLog(`Then I should find a tooltip with content: "${expandButtonTooltip}"`, async () => {
    await t.expect(app.tooltip.textContent).eql(expandButtonTooltip);
  }, true);

  await h(t).withLog('When I click expand button', async () => {
    await rightRail.expand();
  });

  await h(t).withLog('Then right shelf should be expanded', async () => {
    await rightRail.shouldBeExpanded();
  }, true);

  await h(t).withLog('When I switch to another conversation', async () => {
    await app.homePage.messageTab.teamsSection.nthConversationEntry(0).enter();
  });

  await h(t).withLog('Then right shelf should still be expanded', async () => {
    await rightRail.shouldBeExpanded();
  });

  await h(t).withLog('When I switch to another tab and back again', async () => {
    await app.homePage.leftPanel.dashboardEntry.enter();
    await app.homePage.leftPanel.messagesEntry.enter();
  });

  await h(t).withLog('Then right shelf should still be expanded', async () => {
    await rightRail.shouldBeExpanded();
  });

  await h(t).withLog('When I refresh the web page', async () => {
    await app.reload();
  });

  await h(t).withLog('Then right shelf should still be expanded', async () => {
    await rightRail.shouldBeExpanded();
  });

  await h(t).withLog('When I hover on fold button', async () => {
    await t.hover(rightRail.expandStatusButton, {speed: 0.1});
  });
  const foldButtonTooltip = 'Hide details';
  await h(t).withLog(`Then I should find a tooltip with content: "${foldButtonTooltip}"`, async () => {
    await t.expect(app.tooltip.textContent).eql(foldButtonTooltip);
  }, true);

});
