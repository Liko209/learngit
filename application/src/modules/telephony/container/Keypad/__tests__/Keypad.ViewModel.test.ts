/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { KeypadViewModel } from '../Keypad.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let keypadViewModel: KeypadViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  keypadViewModel = new KeypadViewModel();
});

describe('KeypadViewModel', () => {
  it('Should enter the keypad panel', async () => {
    keypadViewModel.keypad();
    expect(keypadViewModel._telephonyStore.keypadEntered).toBe(true);
  });
});
