/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-06 17:55:54
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { ParkViewModel } from '../Park.ViewModel';
import { TELEPHONY_SERVICE } from '../../../../interface/constant';
import { TelephonyService } from '../../../../service/TelephonyService';
import { TelephonyStore } from '../../../../store';

jest.mock('../../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let parkViewModel: ParkViewModel;

beforeAll(() => {
  parkViewModel = new ParkViewModel();
  parkViewModel._telephonyService.park = jest.fn();
});

describe('ForwardViewModel', () => {
  describe('park()', () => {
    it('should call park()', () => {
      parkViewModel.park();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.park).toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('should initialize with enabled', () => {
      expect(parkViewModel.disabled).toBe(false);
    });
  });
});
