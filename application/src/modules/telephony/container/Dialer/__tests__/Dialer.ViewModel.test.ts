/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:52
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { CALL_STATE } from '../../../FSM';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { ServiceLoader } from 'sdk/module/serviceLoader';

import { DialerViewModel } from '../Dialer.ViewModel';
import { GlobalConfigService } from 'sdk/module/config';
import { AuthUserConfig } from 'sdk/module/account/config/AuthUserConfig';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AuthUserConfig');

GlobalConfigService.getInstance = jest.fn();

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let dialerViewModel: DialerViewModel;

beforeAll(() => {
  AuthUserConfig.prototype.getRCToken = jest.fn().mockReturnValue({
    endpoint_id: 'abc',
  });
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  dialerViewModel = new DialerViewModel();
});

describe('DialerViewModel', () => {
  it('should return call state', async () => {
    expect(dialerViewModel.callState).toEqual(CALL_STATE.IDLE);
  });
  it('should initialize with keypad not entered', async () => {
    expect(dialerViewModel.keypadEntered).toEqual(false);
  });
  it('should initialize without fade animation', async () => {
    expect(dialerViewModel.startMinimizeAnimation).toEqual(false);
  });
  it('should initialize with dialerId', async () => {
    expect(typeof dialerViewModel.dialerId).toBe('string');
  });
});
