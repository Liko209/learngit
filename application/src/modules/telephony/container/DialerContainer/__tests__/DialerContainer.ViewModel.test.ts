/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { DialerContainerViewModel } from '../DialerContainer.ViewModel';
import { TelephonyService } from '../../../service';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let dialerContainerViewModel: DialerContainerViewModel;

beforeAll(() => {
  dialerContainerViewModel = new DialerContainerViewModel();
});

describe('DialerContainerViewModel', () => {
  it('Should initialize with keypad not entered', async () => {
    expect(dialerContainerViewModel.keypadEntered).toBe(false);
  });
});
