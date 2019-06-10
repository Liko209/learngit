/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-10 18:29:48
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework';
import { TelephonyStore } from '../../../store';
import { IncomingViewModel } from '../Incoming.ViewModel';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let incomingViewModel: IncomingViewModel;

beforeEach(() => {
  incomingViewModel = new IncomingViewModel({});
});

describe('IncomingViewModel', () => {
  it('Should initialize `phone` with empty value', async () => {
    expect(incomingViewModel.phone).toBeFalsy();
  });

  it('Should initialize `name` with empty value', async () => {
    expect(incomingViewModel.phone).toBeFalsy();
  });

  it('Should initialize `uid` with empty value', async () => {
    expect(incomingViewModel.uid).toBeFalsy();
  });
});
