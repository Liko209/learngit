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

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let dialerHeaderViewModel: DialerHeaderViewModel;

beforeAll(() => {
  dialerHeaderViewModel = new DialerHeaderViewModel();
  dialerHeaderViewModel._telephonyService.deleteInputString = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('dialerHeaderViewModel', () => {
  it('should call deleteInputString function', () => {
    dialerHeaderViewModel.deleteLastInputString();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.deleteInputString).toBeCalled();
  });

  it('should call deleteInputString function', () => {
    dialerHeaderViewModel.deleteInputString();
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    expect(_telephonyService.deleteInputString).toBeCalled();
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
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    _telephonyService.updateInputString = jest.fn();
    dialerHeaderViewModel.onChange({
      target: {
        value,
      },
    });
    expect(_telephonyService.updateInputString).toBeCalled();
  });

  it('should not make a call with empty input string', () => {
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    _telephonyService.makeCall = jest.fn();
    dialerHeaderViewModel.onKeyDown({
      key: 'Enter',
    });
    expect(_telephonyService.makeCall).not.toBeCalled();
  });

  it('should call deleteInputString', () => {
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    _telephonyService.deleteInputString = jest.fn();
    dialerHeaderViewModel.deleteLastInputString();
    expect(_telephonyService.deleteInputString).toHaveBeenCalledTimes(1);
  });

  it('should call deleteInputString with `true`', () => {
    const _telephonyService: TelephonyService = container.get(
      TELEPHONY_SERVICE,
    );
    _telephonyService.deleteInputString = jest.fn();
    dialerHeaderViewModel.deleteInputString();
    expect(_telephonyService.deleteInputString).toBeCalledWith(true);
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
