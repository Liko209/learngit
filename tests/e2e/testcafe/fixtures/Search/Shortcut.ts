/*
 * @Author: Potar.He 
 * @Date: 2019-04-10 12:58:57 
 * @Last Modified by: Potar.He
 * @Last Modified time: 2019-04-26 19:25:54
 */
import { h, H } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { ITestMeta } from "../../v2/models";
import { SITE_URL, BrandTire } from '../../config';
import * as uuid from 'uuid';
import * as assert from 'assert';
import { ClientFunction } from 'testcafe';

fixture('Contact Search')
  .beforeEach(setupCase(BrandTire.RCOFFICE))
  .afterEach(teardownCase());

test.meta(<ITestMeta>{
  priority: ['P2'],
  caseIds: ['JPT-2869'],
  maintainers: ['potar.he'],
  keywords: ['search', 'shortcut'],
})('Check shortcut Ctrl+F/Command+F will focus on the global search', async (t) => {
  const users = h(t).rcData.mainCompany.users;
  const loginUser = users[4];

  const app = new AppRoot(t)
  await h(t).withLog(`Given I login Jupiter with {number}#{extension}`, async (step) => {
    step.initMetadata({
      number: loginUser.company.number,
      extension: loginUser.extension,
    });
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  const searchBar = app.homePage.header.searchBar;
  const searchDialog = app.homePage.searchDialog;
  await h(t).withLog(`And I search keyword`, async () => {
    await searchBar.clickSelf();
    await searchDialog.clearInputAreaTextByKey();
    await searchDialog.typeSearchKeyword(uuid());
  }, true);

  await h(t).withLog(`When I lost focus but can't close instant search dialog`, async () => {
    await t.click(searchDialog.instantPage.contentSearchHeader);
  });

  await h(t).withLog(`And I hitting "ctrl+f"`, async () => {
    await t.pressKey('ctrl+f');
  });
  
  const inputArea = searchDialog.inputArea
  await h(t).withLog(`Then Can't close instant search dialog and focus the end of search text`, async () => {
    await searchDialog.instantPage.ensureLoaded();
    await t.expect(searchDialog.inputArea.focused).ok();
    await H.retryUntilPass(async () => {
      const result: boolean = await ClientFunction((input) => {
        return input().value.length == input().selectionStart;
      })(inputArea)
      assert.ok(result, 'the caret position is not at the end')
    })
  });

  await h(t).withLog(`When I clear search text and Can't focus on the global search box`, async () => {
    await searchDialog.clickClearButton();
    await searchDialog.quitByPressEsc();
  });

  await h(t).withLog(`And I hitting "ctrl+f"`, async () => {
    await t.pressKey('ctrl+f');
  });

  await h(t).withLog(`Then Focus on the global search box`, async () => {
    await searchDialog.ensureLoaded();
    await t.expect(inputArea).ok();
  });
})
