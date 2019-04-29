/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { HoldViewModel } from '../Hold.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let holdViewModel: HoldViewModel;

beforeAll(() => {
  holdViewModel = new HoldViewModel();
});
describe('HoldViewModel', () => {
  it('Should be disabled', async () => {
    expect(holdViewModel.disabled).toBe(true);
  });
});
