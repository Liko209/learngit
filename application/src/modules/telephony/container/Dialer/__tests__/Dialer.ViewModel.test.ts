/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { CALL_STATE } from '../../../FSM';

import { DialerViewModel } from '../Dialer.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerViewModel: DialerViewModel;

beforeAll(() => {
  dialerViewModel = new DialerViewModel();
});

describe('DialerViewModel', () => {
  it('should return call state', async () => {
    expect(dialerViewModel.callState).toEqual(CALL_STATE.IDLE);
  });
});
