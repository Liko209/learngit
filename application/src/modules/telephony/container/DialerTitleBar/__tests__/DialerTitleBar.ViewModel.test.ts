/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { DetachOrAttachViewModel } from '../DialerTitleBar.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerTitleBarViewModel: DetachOrAttachViewModel;

beforeAll(() => {
  dialerTitleBarViewModel = new DetachOrAttachViewModel({});
});

describe('dialerTitleBarViewModel', () => {
  it('should return 00:00', () => {
    expect(dialerTitleBarViewModel._timing).toBe('00:00');
  });
  it('should return undefined when isDialer is false', () => {
    dialerTitleBarViewModel._telephonyStore.activeCallTime = Date.now();
    dialerTitleBarViewModel.timing;
    expect(dialerTitleBarViewModel._intervalId).toBeDefined();
    dialerTitleBarViewModel._telephonyStore.callState = 'connecting';
    expect(dialerTitleBarViewModel.isDialer).toBeFalsy();
    dialerTitleBarViewModel._telephonyStore.callState = 'idle';
    expect(dialerTitleBarViewModel.isDialer).toBeTruthy();
    expect(dialerTitleBarViewModel._intervalId).toBeUndefined();
  });
});
