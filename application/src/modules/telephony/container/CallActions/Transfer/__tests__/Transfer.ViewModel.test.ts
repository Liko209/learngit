/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-21 13:58:11
 * Copyright © RingCentral. All rights reserved.
 */
import { TransferViewModel } from '../Transfer.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../../store';

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let vm: TransferViewModel;

describe('TransferVM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new TransferViewModel();
  });

  it('directTransfer()', () => {
    const store = container.get(TelephonyStore);
    vm.directToTransferPage();
    expect(store.isTransferPage).toBeTruthy();
  });
});
