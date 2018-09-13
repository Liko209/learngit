/*
 * @Author: Henry Xu(henry.xu@ringcentral.com)
 * @Date: 2018-08-08 13:15:48
 * Copyright © RingCentral. All rights reserved.
 */

import { formalName } from '../libs/filter';
import { setUp, tearDown, TestHelper } from '../libs/helpers';
import { directLogin } from '../utils';

declare var test: TestFn;
fixture('Demo')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Sign In Success', ['P0', 'SignIn', 'demo']), async (t) => {
  await directLogin(t);
});
