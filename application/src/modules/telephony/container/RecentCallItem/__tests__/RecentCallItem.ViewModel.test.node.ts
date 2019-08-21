/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-27 14:16:31
 * Copyright © RingCentral. All rights reserved.
 */
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { RecentCallItemViewModel } from '../RecentCallItem.ViewModel';
import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service/TelephonyService';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { CALL_DIRECTION } from 'sdk/module/RCItems';

jest.mock('@/store/utils');
jest.mock('../../../service/TelephonyService');
jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => 'Wednesday',
}));

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let vm: RecentCallItemViewModel;

describe('RecentCallItemViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('The display rules for date and time in call history list. [JPT-2329]', async () => {
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
      return {};
    });
    vm = new RecentCallItemViewModel();
    expect(vm.startTime).toEqual('6/28/2019');
  });
});
