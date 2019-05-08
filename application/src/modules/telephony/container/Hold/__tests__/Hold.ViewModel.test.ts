/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, Jupiter } from 'framework';
import { HoldViewModel } from '../Hold.ViewModel';
import * as telephony from '@/modules/telephony/module.config';

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let holdViewModel: HoldViewModel;

beforeAll(() => {
  holdViewModel = new HoldViewModel();
});
describe('HoldViewModel', () => {
  it('Should be disabled', async () => {
    expect(holdViewModel.disabled).toBe(true);
  });
});
