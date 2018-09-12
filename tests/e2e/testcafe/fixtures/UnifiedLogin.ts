/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:30:30
 * Copyright © RingCentral. All rights reserved.
 */
import { formalName } from '../libs/filter';
import { setUp, tearDown } from '../libs/helpers';
import { interactiveLogin } from '../utils';

fixture('UnifiedLogin')
  .beforeEach(setUp('GlipBetaUser(1210,4488)'))
  .afterEach(tearDown());

test(formalName('Unified Login', ['P0', 'JPT-67', 'Login']), async (t) => {
  await interactiveLogin(t);
});
