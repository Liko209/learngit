/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { HoldViewModel } from '../Hold.ViewModel';
import { TelephonyService } from '../../../service';

[TelephonyService, TelephonyStore].forEach(kls => decorate(injectable(), kls));
[TelephonyService, TelephonyStore].forEach(kls => container.bind(kls).to(kls));

let holdViewModel: HoldViewModel;

beforeAll(() => {
  holdViewModel = new HoldViewModel();
});
describe('HoldViewModel', () => {
  it('Should be disabled', async () => {
    expect(holdViewModel.disabled).toBe(true);
  });
});
