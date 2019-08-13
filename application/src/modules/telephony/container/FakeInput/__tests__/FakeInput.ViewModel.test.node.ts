/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:59
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { FakeInputViewModel } from '../FakeInput.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');
decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let fakeInputViewModel: FakeInputViewModel;

beforeAll(() => {
  jest.spyOn(ServiceLoader, 'getInstance').mockReturnValue({
    matchContactByPhoneNumber: jest.fn(),
  });
  (getEntity as jest.Mock).mockReturnValue({});
  fakeInputViewModel = new FakeInputViewModel();
});

describe('KeypadViewModel', () => {
  it('Should return empty string', async () => {
    expect(fakeInputViewModel.enteredKeys).toBe('');
  });

  it('Should return empty undefined', async () => {
    expect(fakeInputViewModel.showCursor).toBe(undefined);
  });
});
