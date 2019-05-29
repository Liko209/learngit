/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { FakeInputViewModel } from '../FakeInput.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let fakeInputViewModel: FakeInputViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  fakeInputViewModel = new FakeInputViewModel();
  fakeInputViewModel._telephonyStore.onDialerFocus = jest.fn();
  fakeInputViewModel._telephonyStore.onDialerBlur = jest.fn();
});

describe('KeypadViewModel', () => {
  it('Should return empty string', async () => {
    expect(fakeInputViewModel.enteredKeys).toBe('');
  });

  it('should call onDialerFocus()', async () => {
    fakeInputViewModel.onFocus();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(_telephonyStore.onDialerFocus).toBeCalled();
  });

  it('should call onDialerBlur()', async () => {
    fakeInputViewModel.onBlur();
    const _telephonyStore: TelephonyStore = container.get(TelephonyStore);
    expect(_telephonyStore.onDialerBlur).toBeCalled();
  });

  it('Should return empty undefined', async () => {
    expect(fakeInputViewModel.showCursor).toBe(undefined);
  });
});
