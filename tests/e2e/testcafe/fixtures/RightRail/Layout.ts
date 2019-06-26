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
  caseIds: ['JPT-726', 'JPT-748', 'JPT-744'],
  keywords: ['RightRail', 'Layout'],
  maintainers: ['henry.xu'],
})('The UI of right shelf / open/hidden right panel / check tooltip', async t => {
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

  await h(t).withLog('Then I should find the title of right shelf to be "Conversation Details"', async () => {
    await t.expect(rightRail.title.textContent).eql('Conversation details');
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
        await t.expect(rightRail.displayedTabButtons.nth(Number(i)).find('.label').textContent).eql(displayedTabs[i]);
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

  await h(t).withLog('When I hover on expand button', async () => {
    await t.hover(rightRail.expandStatusButton);
  });

  const expandButtonTooltip = 'Show details';
  await h(t).withLog(`Then I should find a tooltip with content: "${expandButtonTooltip}"`, async () => {
    await t.expect(app.tooltip.textContent).eql(expandButtonTooltip);
  }, true);

  await h(t).withLog('When I click expand button', async () => {
    await rightRail.expand();
  });

  await h(t).withLog('Then right shelf should be expanded', async () => {
    await t.expect(rightRail.self.clientWidth).gt(0);
  }, true);

  await h(t).withLog('When I hover on fold button', async () => {
    await t.hover(rightRail.expandStatusButton);
  });

  const foldButtonTooltip = 'Hide details';
  await h(t).withLog(`Then I should find a tooltip with content: "${foldButtonTooltip}"`, async () => {
    await t.expect(app.tooltip.textContent).eql(foldButtonTooltip);
  }, true);

});
