/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-04 09:49:43
 * Copyright © RingCentral. All rights reserved.
 */
import * as _ from 'lodash';
import { setupCase, teardownCase } from '../../../init';
import { BrandTire, SITE_URL } from '../../../config';
import { ITestMeta } from '../../../v2/models';
import { h } from '../../../v2/helpers';
import { AppRoot } from '../../../v2/page-models/AppRoot';

fixture('PhoneTab/CallHistory/Filter')
  .beforeEach(setupCase(BrandTire.CALL_LOG_READ_ONLY))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2452'],
  maintainers: ['chris.zhan'],
  keywords: ['callHistory']
})('Check the ghost of Call history filter', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];

  const phoneFilterPlaceholder = 'Filter call history';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: user.company.number,
      extension: user.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click Phone entry of leftPanel,', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
  });
  const callHistoryEntry = app.homePage.phoneTab.callHistoryEntry;
  await h(t).withLog('Then I will see call history entry', async () => {
    await callHistoryEntry.ensureLoaded();
  });

  await h(t).withLog('When I click call history entry', async () => {
    await callHistoryEntry.enter();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('Then callHistory page should be open', async () => {
    await callHistoryEntry.shouldBeOpened();
    await callHistoryPage.ensureLoaded();
  });

  await h(t).withLog('And filter ghost should has placeholder text "{placeholder}"', async (step) => {
    step.setMetadata('placeholder', phoneFilterPlaceholder);
    await t.expect(callHistoryPage.filterInput.getAttribute('placeholder')).eql(phoneFilterPlaceholder);
  });

  await h(t).withLog('When I switch to Missed Calls', async () => {
    await t.click(callHistoryPage.missedCallTab);
  });

  await h(t).withLog('And filter ghost should has placeholder text "{placeholder}"', async (step) => {
    step.setMetadata('placeholder', phoneFilterPlaceholder);
    await t.expect(callHistoryPage.filterInput.getAttribute('placeholder')).eql(phoneFilterPlaceholder);
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2445', 'JPT-2450'],
  maintainers: ['chris.zhan'],
  keywords: ['callHistory']
})('Check the character limit of Call history filter & Check the display should show an empty view with message of No matched records', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];

  const filterKey = 'Non nulla eu Lorem laborum ea proident cillum aliquip pariatur deserunt laborum exercitation et. Nostrud dolor do exercitation eiusmod consectetur duis ullamco consectetur voluptate fugiat tempor dolore. Commodo do mollit sit proident quis. Velit Lorem fugiat laboris id adipisicing cillum eu velit aliquip proident ullamco excepteur incididunt. Exercitation nisi in commodo elit do amet laborum culpa nulla ullamco ipsum Lorem enim.';

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: user.company.number,
      extension: user.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click Phone entry of leftPanel,', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    const telephoneDialog = app.homePage.telephonyDialog;
    if (await telephoneDialog.exists) {
      await app.homePage.closeE911Prompt()
      await telephoneDialog.clickMinimizeButton();
    }
  });
  const callHistoryEntry = app.homePage.phoneTab.callHistoryEntry;
  await h(t).withLog('Then I will see call history entry', async () => {
    await callHistoryEntry.ensureLoaded();
  });

  await h(t).withLog('When I click call history entry', async () => {
    await callHistoryEntry.enter();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('Then callHistory page should be open', async () => {
    await callHistoryEntry.shouldBeOpened();
    await callHistoryPage.ensureLoaded();
  });

  await h(t).withLog('When I type random long text in the input', async () => {
    await t.click(callHistoryPage.filterInput)
      .wait(1e3)
      .typeText(callHistoryPage.filterInput, filterKey, { replace: true });
  });

  await h(t).withLog('Then the value should only be 60 characters', async (step) => {
    await t.expect(callHistoryPage.filterInput.value).eql(filterKey.substr(0, 60));
  });

  await h(t).withLog('And we can see the empty page', async () => {
    await t.expect(callHistoryPage.emptyPage.exists).ok();
  });

  await h(t).withLog('And with text "No matches found"', async () => {
    await t.expect(callHistoryPage.emptyPage.textContent).contains('No matches found');
  });
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2449', 'JPT-2447', 'JPT-2448', 'JPT-2454'],
  maintainers: ['chris.zhan'],
  keywords: ['callHistory']
})('Check the display should show an empty view with message of No matched records & Click Clear button can remove the complete Search content and restored to its previous state & The filter should be cleared when user leave the call history page then back & The filter should not be cleared when user switch between All calls and Missed calls page', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const user = users[0];
  const user2 = users[1];
  const user3 = users[2];
  const user4 = users[3];

  await h(t).glip(user).init();
  const user2Name = await h(t).glip(user).getPersonPartialData('display_name', user2.rcId);
  const user3Name = await h(t).glip(user).getPersonPartialData('display_name', user3.rcId);
  const user4Name = await h(t).glip(user).getPersonPartialData('display_name', user4.rcId);

  const app = new AppRoot(t);
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: user.company.number,
      extension: user.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, user);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I click Phone entry of leftPanel,', async () => {
    await app.homePage.leftPanel.phoneEntry.enter();
    const telephoneDialog = app.homePage.telephonyDialog;
    if (await telephoneDialog.exists) {
      await app.homePage.closeE911Prompt()
      await telephoneDialog.clickMinimizeButton();
    }
  });
  const callHistoryEntry = app.homePage.phoneTab.callHistoryEntry;
  await h(t).withLog('Then I will see call history entry', async () => {
    await callHistoryEntry.ensureLoaded();
  });

  await h(t).withLog('When I click call history entry', async () => {
    await callHistoryEntry.enter();
  });

  const callHistoryPage = app.homePage.phoneTab.callHistoryPage;
  await h(t).withLog('Then callHistory page should be open', async () => {
    await callHistoryEntry.shouldBeOpened();
    await callHistoryPage.ensureLoaded();
  });

  await h(t).withLog('And there should be call log items called from user2, user3 and user4', async () => {
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user2Name).exists).ok();
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user3Name).exists).ok();
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user4Name).exists).ok();
  });

  await h(t).withLog('When I type user2\'s last name ', async () => {
    const user2LastName = await h(t).glip(user).getPersonPartialData('last_name', user2.rcId);
    await callHistoryPage.typeFilter(user2LastName);
  });

  await h(t).withLog('Then the call logs from user2 is filtered', async () => {
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user2Name).exists).ok();
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user3Name).exists).notOk();
    await t.expect(callHistoryPage.items.find('.list-item-primary').withText(user4Name).exists).notOk();
  });

  const user2FirstName = await h(t).glip(user).getPersonPartialData('first_name', user2.rcId);
  const user2LastName = await h(t).glip(user).getPersonPartialData('last_name', user2.rcId);
  const user2PhoneNumbers = await h(t).glip(user).getPersonPartialData('rc_phone_numbers', user2.rcId);
  const user2PhoneDirectNumber = user2PhoneNumbers.find(({ usageType }) => usageType === 'DirectNumber')['phoneNumber'];
  const user2PhoneDirectNumberLastPart = user2PhoneDirectNumber.substr(-4);
  await h(t).withLog('When I type first letters with space ', async () => {
    await t.typeText(callHistoryPage.filterInput, `${user2FirstName[0]} ${user2LastName[0]}`, { replace: true });
  });

  await h(t).withLog('Then all call logs with the two letters can be searched out', async () => {
    const count = await callHistoryPage.items.count;
    for (var i = 0; i < count; i++) {
      await t.expect(callHistoryPage.items.nth(i).find('.list-item-primary').textContent).contains(user2FirstName[0]);
      await t.expect(callHistoryPage.items.nth(i).find('.list-item-primary').textContent).contains(user2LastName[0]);
    }
  });

  await h(t).withLog('When I type part of user2 phone number {user2PhoneDirectNumberLastPart}', async (step) => {
    step.setMetadata('user2PhoneDirectNumberLastPart', user2PhoneDirectNumberLastPart);
    await callHistoryPage.typeFilter(user2PhoneDirectNumberLastPart);
  });

  let formatUser2PhoneNumber = '';
  await h(t).withLog('Then the call logs from user2 is filtered', async () => {
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    formatUser2PhoneNumber = await callHistoryPage.callHistoryItemByNth(0).callerNumber.textContent;
    await callHistoryPage.expectItemsWithNameNotExist(user3Name);
    await callHistoryPage.expectItemsWithNameNotExist(user4Name);
  });

  await h(t).withLog('Then I clear input', async () => {
    await t.click(callHistoryPage.filterInputClear);
  });

  await h(t).withLog('And I should see all call logs', async () => {
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    await callHistoryPage.expectItemsWithNameExist(user3Name);
    await callHistoryPage.expectItemsWithNameExist(user4Name);

  });

  await h(t).withLog('When I type user2 phone number {formatUser2PhoneNumber}', async (step) => {
    step.setMetadata('formatUser2PhoneNumber', formatUser2PhoneNumber);
    await callHistoryPage.typeFilter(formatUser2PhoneNumber);
  });

  await h(t).withLog('Then the call logs from user2 is filtered', async () => {
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    await callHistoryPage.expectItemsWithNameNotExist(user3Name);
    await callHistoryPage.expectItemsWithNameNotExist(user4Name);
  });

  await h(t).withLog('When I switch to Missed Calls tab', async () => {
    await t.click(callHistoryPage.missedCallTab);
  });

  await h(t).withLog('Then the input text remains', async () => {
    await t.expect(callHistoryPage.filterInput.value).eql(formatUser2PhoneNumber);
  });

  await h(t).withLog('And only missed calls from user2 shown', async () => {
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    await callHistoryPage.expectItemsWithNameNotExist(user3Name);
    await callHistoryPage.expectItemsWithNameNotExist(user4Name);

    await t.expect(callHistoryPage.missedCallsItems.find('.missedcall').exists).ok();
    await t.expect(callHistoryPage.missedCallsItems.find('.outcall').exists).notOk();
    await t.expect(callHistoryPage.missedCallsItems.find('.incall').exists).notOk();
  });

  await h(t).withLog('Then I switch back to All Calls tab', async () => {
    await t.click(callHistoryPage.allCallTab);
  });

  await h(t).withLog('And all calls from user2 shown', async () => {
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    formatUser2PhoneNumber = await callHistoryPage.callHistoryItemByNth(0).callerNumber.textContent;
    await callHistoryPage.expectItemsWithNameNotExist(user3Name);
    await callHistoryPage.expectItemsWithNameNotExist(user4Name);

    await t.expect(callHistoryPage.allCallsItems.find('.missedcall').exists).ok();
    await t.expect(callHistoryPage.allCallsItems.find('.outcall').exists).ok();
  });

  const voicemailEntry = app.homePage.phoneTab.voicemailEntry;
  await h(t).withLog('When I leave the call log page', async () => {
    await voicemailEntry.enter();
  });

  await h(t).withLog('Then I go back to call log page', async () => {
    await callHistoryEntry.enter();
  });

  await h(t).withLog('Then the input is cleared and all logs are shown', async () => {
    await t.expect(callHistoryPage.filterInput.value).eql('');
    await callHistoryPage.expectItemsWithNameExist(user2Name);
    await callHistoryPage.expectItemsWithNameExist(user3Name);
    await callHistoryPage.expectItemsWithNameExist(user4Name);

    await t.expect(callHistoryPage.allCallsItems.find('.missedcall').exists).ok();
    await t.expect(callHistoryPage.allCallsItems.find('.outcall').exists).ok();
    await t.expect(callHistoryPage.allCallsItems.find('.incall').exists).ok();
  });
});


