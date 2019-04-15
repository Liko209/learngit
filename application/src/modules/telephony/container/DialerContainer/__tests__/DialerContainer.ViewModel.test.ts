/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service';
import { DialerContainerViewModel } from '../DialerContainer.ViewModel';

[TelephonyService, TelephonyStore].forEach(kls => decorate(injectable(), kls));
[TelephonyService, TelephonyStore].forEach(kls => container.bind(kls).to(kls));

let dialerContainerViewModel: DialerContainerViewModel;

beforeAll(() => {
  dialerContainerViewModel = new DialerContainerViewModel();
});

describe('DialerContainerViewModel', () => {
  it('Should initialize with keypad not entered', async () => {
    expect(dialerContainerViewModel.keypadEntered).toBe(false);
  });
});
