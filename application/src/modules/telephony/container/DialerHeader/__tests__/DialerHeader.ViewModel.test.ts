/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-11 09:50:10
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { DialerHeaderViewModel } from '../DialerHeader.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let dialerHeaderViewModel: DialerHeaderViewModel;

beforeAll(() => {
  dialerHeaderViewModel = new DialerHeaderViewModel();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('dialerHeaderViewModel', () => {
  it.skip('should call deleteInputString function', () => {
    dialerHeaderViewModel._telephonyStore.forwardString = '123';
    dialerHeaderViewModel.deleteLastInputString();
    expect(dialerHeaderViewModel._telephonyStore.forwardString).toEqual('12');
  });

  it('should initialize with dialer opened', () => {
    expect(dialerHeaderViewModel.shouldDisplayDialer).toBe(true);
  });

  it('should initialize with empty input string', () => {
    expect(dialerHeaderViewModel.inputString).toBe('');
  });

  it('should focus the input', () => {
    dialerHeaderViewModel.onFocus();
    const _telephonyService: TelephonyStore = container.get(TelephonyStore);
    expect(_telephonyService.dialerInputFocused).toBe(true);
  });

  it('should blur the input', () => {
    dialerHeaderViewModel.onBlur();
    const _telephonyService: TelephonyStore = container.get(TelephonyStore);
    expect(_telephonyService.dialerInputFocused).toBe(false);
  });

  it('should call updateInputString', () => {
    const value = 'abc';
    dialerHeaderViewModel.onChange({
      target: {
        value,
      },
    });
    expect(dialerHeaderViewModel.forwardString).toEqual(value);
  });

  it('should call deleteInputString with `true`', () => {
    dialerHeaderViewModel._telephonyStore.forwardString = '123';
    dialerHeaderViewModel.deleteInputString();
    expect(dialerHeaderViewModel.forwardString).toEqual('');
  });

  it('should initialize with empty uid', () => {
    expect(dialerHeaderViewModel.uid).toBeFalsy();
  });

  it('should initialize with empty name', () => {
    expect(dialerHeaderViewModel.name).toBeFalsy();
  });

  it('should initialize with phone empty', () => {
    expect(dialerHeaderViewModel.isExt).toBeFalsy();
    expect(dialerHeaderViewModel.phone).toBeFalsy();
  });
});
