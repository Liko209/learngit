/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import { Selector } from 'testcafe';

import { LeftNavigationPage } from '../page-models/pages/LeftNavigationPage';
import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';
import { directLogin } from '../utils';

fixture('LeftNav')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Left nav redirect', ['P0', 'LeftNav']), async (t) => {
  const helper = TestHelper.from(t);

  await directLogin(t)
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
