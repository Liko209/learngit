/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-11 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */

import { directLogin } from '../../utils';
import { formalName } from '../../libs/filter';
import { LeftNavState } from '../../page-models/pages/LeftNavState';
import { setUp, tearDown } from '../../libs/helpers';

fixture('LeftNavState')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(
  formalName('reload page keep left nav state', ['P2', 'JPT-50', 'left nav state']), async (t) => {
    const page = directLogin(t);
    await page.chain(t => t.wait(10000))
      .log('1. Navigate to LeftNavigationPage')
      .shouldNavigateTo(LeftNavState)
      .toggle()
      .size(72)
      .reload()
      .size(72)
      .toggle()
      .size(200)
      .reload()
      .size(200);
  });
