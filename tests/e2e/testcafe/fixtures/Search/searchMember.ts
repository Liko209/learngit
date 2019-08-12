/*
* @Author: Alexander Zaverukha (alexander.zaverukha@ab-soft.com)
* @Date: 5/31/2019 12:34:14
* Copyright © RingCentral. All rights reserved.
*/

import { h } from '../../v2/helpers';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from '../../v2/page-models/AppRoot';
import { SITE_URL, BrandTire } from '../../config';
import { IGroup, ITestMeta } from '../../v2/models';
import { v4 as uuid } from 'uuid';
import * as faker from "faker/locale/en";

fixture('Profile/SearchMembers')
  .beforeEach(setupCase(BrandTire.RC_USERS_20))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1253'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['Profile', 'SearchMembers']
})('Check the area of search box in the team/group profile', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).glip(loginUser).init();
  const teamAndGroup: IGroup[] = [{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: users
  }, {
    type: "Group",
    owner: loginUser,
    members: users.slice(0, 15)
  }];

  await h(t).withLog(`Given I have an team with members > 10`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats(teamAndGroup);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;
  async function entry(group: IGroup) {
    let section = app.homePage.messageTab.teamsSection;
    if (group.type !== 'Team') {
      section = app.homePage.messageTab.directMessagesSection;
    }

    await h(t).withLog(`When I open type: {type} profile that members > 10`, async (step) => {
      step.setMetadata('type', group.type);
      await section.conversationEntryById(group.glipId).enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    await h(t).withLog(`And I check the search box display area`, async () => {
      await t.expect(await profileDialog.memberSearch.visible).ok();
    });

    await h(t).withLog(`Then Search box is below the member count`, async () => {
      await t.expect(await profileDialog.memberSearch.prevSibling('*').withText(new RegExp(`\(${group.members.length}\)`)).exists).ok();
    });

    await h(t).withLog(`When I scroll the member list`, async () => {
      await profileDialog.scrollToMiddle();
    });

    await h(t).withLog(`Then Search box still stay in the area`, async () => {
      await t.expect(await profileDialog.memberSearch.visible).ok();
    });

    await h(t).withLog(`And close the dialog `, async () => {
      await profileDialog.clickCloseButton();
    });
  }

  await executeEntries(teamAndGroup);

  async function executeEntries(groups: IGroup[]) {
    for (const group of groups) {
      await entry(group)
    }
  }
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1265'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['Profile', 'SearchMembers']
})('Check the display of empty search result in the profile dialog', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).glip(loginUser).init();
  const teamAndGroup: IGroup[] = [{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: users
  }, {
    type: "Group",
    owner: loginUser,
    members: users.slice(0, 15)
  }];

  await h(t).withLog(`Given I have an team with members > 10`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats(teamAndGroup);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const conversationPage = app.homePage.messageTab.conversationPage;
  const profileDialog = app.homePage.profileDialog;
  async function entry(group: IGroup) {
    let section = app.homePage.messageTab.teamsSection;
    if (group.type !== 'Team') {
      section = app.homePage.messageTab.directMessagesSection;
    }

    await h(t).withLog(`When I open type: {type} profile that members > 10`, async (step) => {
      step.setMetadata('type', group.type);
      await section.conversationEntryById(group.glipId).enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    const text = 'Unknown name';
    await h(t).withLog(`And I enter '{text}' text that does not match the search result`, async (step) => {
      step.setMetadata('text', text);
      const memberSearchInput = await profileDialog.memberSearch.find('input');
      await t.typeText(memberSearchInput, text);
    });

    await h(t).withLog(`Then empty image displayed in search result`, async () => {
      await t.expect(profileDialog.self.find('img').withAttribute('src', /.*noresult.*.svg/gm).visible).ok();
    });

    await h(t).withLog(`And text: "No matches found"`, async () => {
      await t.expect(profileDialog.self.find('div').withText('No matches found').visible).ok();
    });

    await h(t).withLog(`And close the dialog `, async () => {
      await profileDialog.clickCloseButton();
    });
  }

  await executeEntries(teamAndGroup);

  async function executeEntries(groups: IGroup[]) {
    for (const group of groups) {
      await entry(group)
    }
  }
});

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-1257'],
  maintainers: ['alexander.zaverukha'],
  keywords: ['Profile', 'SearchMembers']
})('Check the search box maximum character length', async (t: TestController) => {
  const app = new AppRoot(t);
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[0];
  await h(t).glip(loginUser).init();
  const teamAndGroup: IGroup[] = [{
    type: "Team",
    name: uuid(),
    owner: loginUser,
    members: users
  }, {
    type: "Group",
    owner: loginUser,
    members: users.slice(0, 15)
  }];

  await h(t).withLog(`Given I have an team with members > 10`, async () => {
    await h(t).scenarioHelper.createTeamsOrChats(teamAndGroup);
  });

  await h(t).withLog(`And I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    })
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const profileDialog = app.homePage.profileDialog;
  const conversationPage = app.homePage.messageTab.conversationPage;

  async function entry(group: IGroup) {
    let section = app.homePage.messageTab.teamsSection;
    if (group.type !== 'Team') {
      section = app.homePage.messageTab.directMessagesSection;
    }

    await h(t).withLog(`When I open type: {type} profile that members > 10`, async (step) => {
      step.setMetadata('type', group.type);
      await section.conversationEntryById(group.glipId).enter();
      await conversationPage.openMoreButtonOnHeader();
      await conversationPage.headerMoreMenu.openProfile();
    });

    const text = faker.random.alphaNumeric(29);
    await h(t).withLog(`And I input '{text}' text with length <30 in search input`, async (step) => {
      step.setMetadata('text', text);
      const memberSearchInput = await profileDialog.memberSearch.find('input');
      await t.typeText(memberSearchInput, text, { paste: false });
    });

    await h(t).withLog(`Then text can be entered`, async () => {
      const textInSearch = await profileDialog.memberSearch.find('input').value;
      await t.expect(textInSearch.length).eql(29);
    });

    await h(t).withLog(`When I continue input text to the search box until the text's length =30`, async () => {
      const memberSearchInput = await profileDialog.memberSearch.find('input');
      await t.typeText(memberSearchInput, 'R', { replace: false, paste: false });
    });

    await h(t).withLog(`Then the text can be entered`, async () => {
      const textInSearch = await profileDialog.memberSearch.find('input').value;
      await t.expect(textInSearch.length).eql(30);
    });

    await h(t).withLog(`When I continue input text to the search box`, async () => {
      const memberSearchInput = await app.homePage.profileDialog.memberSearch.find('input');
      await t.typeText(memberSearchInput, 'ingCenral', { replace: false, paste: false });
    });

    await h(t).withLog(`Then the text can't be entered`, async () => {
      const textInSearch = await profileDialog.memberSearch.find('input').value;
      await t.expect(textInSearch.length).eql(30);
    });

    await h(t).withLog(`And close the dialog `, async () => {
      await profileDialog.clickCloseButton();
    });
  }

  await executeEntries(teamAndGroup);

  async function executeEntries(groups: IGroup[]) {
    for (const group of groups) {
      await entry(group)
    }
  }
});
