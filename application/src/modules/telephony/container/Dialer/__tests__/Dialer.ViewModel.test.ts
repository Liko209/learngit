/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore, INCOMING_STATE } from '../../../store';
import { CALL_STATE } from '../../../FSM';
import { ServiceLoader } from 'sdk/module/serviceLoader';

import { DialerViewModel } from '../Dialer.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let dialerViewModel: DialerViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  dialerViewModel = new DialerViewModel();
});

describe('DialerViewModel', () => {
  it('should return call state', async () => {
    expect(dialerViewModel.callState).toEqual(CALL_STATE.IDLE);
  });
  it('should return incoming state', async () => {
    expect(dialerViewModel.incomingState).toEqual(INCOMING_STATE.IDLE);
  });
  it('should initialize with keypad not entered', async () => {
    expect(dialerViewModel.keypadEntered).toEqual(false);
  });
});
