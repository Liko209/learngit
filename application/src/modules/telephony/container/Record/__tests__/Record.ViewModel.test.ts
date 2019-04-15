/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { RecordViewModel } from '../Record.ViewModel';
import { TelephonyService } from '../../../service';

[TelephonyService, TelephonyStore].forEach(kls => decorate(injectable(), kls));
[TelephonyService, TelephonyStore].forEach(kls => container.bind(kls).to(kls));

let recordViewModel: RecordViewModel;

beforeAll(() => {
  recordViewModel = new RecordViewModel();
});
describe('RecordViewModel', () => {
  it('Should be disabled', async () => {
    expect(recordViewModel.disabled).toBe(true);
  });
});
