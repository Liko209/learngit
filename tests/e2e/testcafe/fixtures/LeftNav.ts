/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/BlankPage';
import { UnifiedLoginPage } from '../page-models/UnifiedLoginPage';
import { RingcentralSignInNavigationPage } from '../page-models/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/RingcentralSignInPage';
import LeftNavPage from '../page-models/LeftNavPage';
import { SITE_URL } from '../config';
import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';
import { Selector } from 'testcafe';

fixture('LeftNav')
  .beforeEach(setUp('rcBetaUserAccount'))
  .afterEach(tearDown());

test(formalName('Left nav redirect', ['P0', 'LeftNav']), async t => {
  const helper = TestHelper.from(t);

  await new BlankPage(t)
    .open(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn()
    .shouldNavigateTo(LeftNavPage)
    .redirect('Dashboard')
    .redirect('Messages')
    .redirect('Phone')
    .redirect('Meetings')
    .redirect('Calendar')
    .redirect('Tasks')
    .redirect('Notes')
    .redirect('Files');

  const expandBtn = Selector('[data-anchor="expandButton"]');
  const leftPanel = Selector('[data-anchor="left-panel"]').clientWidth;
  await t.click(expandBtn);
  await t.expect(leftPanel).eql(72);

  await t.eval(() => location.reload(true));
  await t.expect(leftPanel).eql(72);
  await t.click(expandBtn);
  await t.eval(() => location.reload(true));
  await t.expect(leftPanel).eql(200);
});
