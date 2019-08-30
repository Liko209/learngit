/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */
import { RecentCallsViewModel } from '../RecentCalls.ViewModel';
import * as RecentCallLogsHandlerModule from '../RecentCallLogsHandler';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyService } from '../../../service/TelephonyService';
import { TelephonyStore } from '../../../store';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { CALL_DIRECTION } from 'sdk/module/RCItems';

jest.mock('@/store/utils');
jest.mock('../../../service/TelephonyService');
jest.mock('../RecentCallLogsHandler');

decorate(injectable(), TelephonyService);
decorate(injectable(), TelephonyStore);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let vm: RecentCallsViewModel;

const recentCallLogsHandler = {
  dispose: jest.fn(),
  init: jest.fn().mockResolvedValue(true),
  foc: {
    sortableListStore: {
      getIds: [1],
    },
  },
};

describe('RecentCallsViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    recentCallLogsHandler.init.mockResolvedValue(true);
    jest
      .spyOn(RecentCallLogsHandlerModule, 'RecentCallLogsHandler')
      .mockImplementation(() => recentCallLogsHandler);
  });

  it('makeCall()', done => {
    const phoneNumber = '123456';
    (getEntity as jest.Mock).mockImplementation((name: string, id: number) => {
      if (name === ENTITY_NAME.CALL_LOG) {
        return {
          direction: CALL_DIRECTION.INBOUND,
          id: 'IVqQFVti-n8bzUA',
          from: {
            extensionNumber: '231',
            name: 'Lula Hauck',
          },
          to: {
            extensionNumber: '268',
            name: 'Jenny Cai',
          },
          startTime: '2019-06-28T02:09:28.595Z',
        };
      }
      if (name === ENTITY_NAME.PHONE_NUMBER) {
        return {
          formattedPhoneNumber: phoneNumber,
        };
      }
      return {};
    });
    vm = new RecentCallsViewModel();
    vm.focusIndex = 0;
    const telephonyService: TelephonyService = container.get(TELEPHONY_SERVICE);
    const telephonyStore: TelephonyStore = container.get(TelephonyStore);
    telephonyStore.onDialerInputFocus();

    setTimeout(async () => {
      expect(vm.isBlock).toBeFalsy();
      await vm.makeCall();
      expect(telephonyService.directCall).toHaveBeenCalledWith(phoneNumber);
      done();
    });
  });

  describe('selectCallItem()', () => {
    it('should cancel the selection of transfer user [JPT-2764]', () => {
      vm = new RecentCallsViewModel();
      vm.focusIndex = 0;
      const telephonyStore: TelephonyStore = container.get(TelephonyStore);
      telephonyStore.onDialerInputFocus();

      vm.selectCallItem(1);
      expect(telephonyStore.selectedCallItem).toEqual({
        phoneNumber: '',
        index: 1,
      });
      vm.selectCallItem(1);
      expect(telephonyStore.selectedCallItem).toEqual({
        phoneNumber: '',
        index: NaN,
      });
    });
  });

  it('dispose()', done => {
    vm = new RecentCallsViewModel();
    setTimeout(() => {
      vm.dispose();
      expect(recentCallLogsHandler.dispose).toHaveBeenCalled();
      done();
    });
  });
});
