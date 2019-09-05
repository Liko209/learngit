/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-08-22 03:46:38
 * Copyright © RingCentral. All rights reserved.
 */
import { TransferViewModel } from '../Transfer.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { getEntity } from '@/store/utils';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { ENTITY_NAME } from '@/store';
import { IMediaService } from '@/interface/media';
import { MediaService } from '@/modules/media/service';
import { jupiter } from 'framework/Jupiter';

jest.mock('../../../service/TelephonyService');
jest.mock('@/store/utils');
jest.mock('@/store/base/fetch/FetchSortableDataListHandler');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);
jupiter.registerService(IMediaService, MediaService);

let vm: TransferViewModel;

describe('TransferViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new TransferViewModel();
    vm._telephonyService.transfer = jest.fn();
  });

  describe('transferNumber()', () => {
    it('should return transferNumber if selected call item', () => {
      vm._telephonyStore.selectedCallItem = {
        phoneNumber: '123',
        index: 0,
      };
      expect(vm.transferNumber).toBe('123');
    });
    it('should return transferNumber if unselected call item but inputString is valid', () => {
      vm._telephonyStore.inputString = '456';
      vm._telephonyStore.isValidInputStringNumber = true;
      expect(vm.transferNumber).toBe('456');
    });
    it('should return empty if unselected call item and inputString is invalid', () => {
      vm._telephonyStore.inputString = 'a456';
      vm._telephonyStore.isValidInputStringNumber = false;
      expect(vm.transferNumber).toBe('');
    });
  });

  describe('transferCall()', () => {
    it('should call Transfer function', async () => {
      vm._telephonyStore.selectedCallItem = {
        phoneNumber: '123',
        index: 0,
      };
      await vm.transferCall();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.transfer).toHaveBeenCalled();
    });
  });

  describe('isTransferCallConnected()', () => {
    it('should disabled complete transfer action button [JPT-2890]', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => {
        if (type === ENTITY_NAME.CALL) {
          return { id, callState: '' };
        }
        return id;
      });
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };

      expect(vm.isTransferCallConnected).toBeFalsy();
    });

    it('should not disabled complete transfer action button [JPT-2890]', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => {
        if (type === ENTITY_NAME.CALL) {
          return { id, callState: CALL_STATE.CONNECTED };
        }
        return id;
      });
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };

      expect(vm.isTransferCallConnected).toBeTruthy();
    });

    it('should disabled complete transfer action button when in transferring status [JPT-2768]', () => {
      (getEntity as jest.Mock).mockImplementation((type, id) => {
        if (type === ENTITY_NAME.CALL) {
          return { id, callState: CALL_STATE.CONNECTED };
        }
        return id;
      });
      // @ts-ignore
      vm._telephonyStore._sortableListHandler.sortableListStore = {
        getIds: [1, 2],
      };
      expect(vm.isTransferCallConnected).toBeTruthy();

      vm._telephonyStore.processTransfer();
      expect(vm.isTransferCallConnected).toBeFalsy();
    });
  });
});
