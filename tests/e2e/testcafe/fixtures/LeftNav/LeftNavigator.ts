/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-08-22 17:13:54
 * Copyright © RingCentral. All rights reserved.
 */

import { LeftNavigationPage } from '../../page-models/pages/LeftNavigationPage';
import { formalName } from '../../libs/filter';
import { setUp, tearDown, TestHelper } from '../../libs/helpers';
import { directLogin } from '../../utils/index';

fixture('LeftNav')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Left nav redirect', ['P0', 'LeftNav']), async (t) => {
  const helper = TestHelper.from(t);

  await directLogin(t)
    .shouldNavigateTo(LeftNavigationPage)
    .redirect('dashboard')
    .redirect('messages')
    .redirect('phone')
    .redirect('meetings')
    .redirect('contacts')
    .redirect('calendar')
    .redirect('tasks')
    .redirect('notes')
    .redirect('files')
    .redirect('settings');
});
