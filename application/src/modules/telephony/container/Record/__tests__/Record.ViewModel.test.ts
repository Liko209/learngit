/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { RecordViewModel } from '../Record.ViewModel';
import { TelephonyService } from '../../../service';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let recordViewModel: RecordViewModel;

beforeAll(() => {
  recordViewModel = new RecordViewModel();
});
describe('RecordViewModel', () => {
  it('Should be disabled', async () => {
    expect(recordViewModel.disabled).toBe(true);
  });
});
