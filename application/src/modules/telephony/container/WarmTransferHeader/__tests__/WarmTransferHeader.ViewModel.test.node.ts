/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-28 02:17:01
 * Copyright © RingCentral. All rights reserved.
 */
import { WarmTransferHeaderViewModel } from '../WarmTransferHeader.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

jest.mock('../../../service/TelephonyService');
jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let vm: WarmTransferHeaderViewModel;

describe('TransferViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new WarmTransferHeaderViewModel();
    vm._telephonyService.holdOrUnhold = jest.fn();
    vm._telephonyService.hangUp = jest.fn();
  });

  describe('switchCallItems()', () => {
    it('should get switchCallItems by reverse rawCalls', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => id);
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };

      expect(vm.switchCallItems).toStrictEqual([2, 1]);
    });
  });

  describe('switchCall()', () => {
    it('should switch current call id', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => id);
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };
      expect(vm._telephonyStore.currentCallId).toBe(undefined);
      vm.switchCall(1);

      expect(vm._telephonyStore.currentCallId).toBe(1);
      expect(vm._telephonyService.holdOrUnhold).toHaveBeenCalled();
    });
  });

  describe('endCall()', () => {
    it('should cancel transfer call', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => {
        if (type === ENTITY_NAME.CALL) {
          return { id };
        }
        return id;
      });
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };
      vm.endCall();

      expect(vm._telephonyService.hangUp).toHaveBeenCalledWith(2);
    });
  });
});
