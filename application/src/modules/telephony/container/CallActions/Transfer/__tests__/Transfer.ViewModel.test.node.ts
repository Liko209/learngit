/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-21 13:58:11
 * Copyright © RingCentral. All rights reserved.
 */
import { TransferViewModel } from '../Transfer.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../../store';
import { getEntity } from '@/store/utils';
import { HOLD_STATE, RECORD_STATE } from 'sdk/module/telephony/entity';
import { observable } from 'mobx';

jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

decorate(injectable(), TelephonyStore);

container.bind(TelephonyStore).to(TelephonyStore);

let vm: TransferViewModel;
let call: any;

describe('TransferVM', () => {
  beforeAll(() => {
    call = observable({
      holdState: HOLD_STATE.IDLE,
      recordState: RECORD_STATE.IDLE,
    });
    (getEntity as jest.Mock).mockReturnValue(call);
    vm = new TransferViewModel();
  });

  it('directTransfer()', () => {
    const store = container.get(TelephonyStore);
    vm.directToTransferPage();
    expect(store.isTransferPage).toBeTruthy();
  });

  describe('disabledTransferAction()', () => {
    it('should the transfer item is disabled when call is onhold [JPT-2757]', () => {
      call.recordState = RECORD_STATE.IDLE;
      call.holdState = HOLD_STATE.HELD;
      expect(vm.disabledTransferAction).toBeTruthy();
    });

    it('should the transfer item is disabled when call is recording [JPT-2757]', () => {
      call.recordState = RECORD_STATE.RECORDING;
      call.holdState = HOLD_STATE.IDLE;
      expect(vm.disabledTransferAction).toBeTruthy();
    });
  });
});
