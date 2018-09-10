/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import { BlankPage } from '../page-models/pages/BlankPage';
import { UnifiedLoginPage } from '../page-models/pages/UnifiedLoginPage';
import { RingcentralSignInNavigationPage } from '../page-models/pages/RingcentralSignInNavigationPage';
import { RingcentralSignInPage } from '../page-models/pages/RingcentralSignInPage';
import { LeftNavigationPage } from '../page-models/pages/LeftNavigationPage';
import { SITE_URL } from '../config';
import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';
import { Selector } from 'testcafe';

fixture('LeftNav')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Left nav redirect', ['P0', 'LeftNav']), async (t) => {
  const helper = TestHelper.from(t);

  await new BlankPage(t)
    .navigateTo(SITE_URL)
    .shouldNavigateTo(UnifiedLoginPage)
    .clickLogin()
    .shouldNavigateTo(RingcentralSignInNavigationPage)
    .setCredential(helper.companyNumber)
    .toNextPage()
    .shouldNavigateTo(RingcentralSignInPage)
    .setExtension(helper.users.user701.extension)
    .setPassword(helper.users.user701.password)
    .signIn()
    .shouldNavigateTo(LeftNavigationPage)
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
