/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container, decorate, injectable } from 'framework';
import { TelephonyService } from '../../../../service/TelephonyService';
import { ForwardViewModel } from '../Forward.ViewModel';
import { TELEPHONY_SERVICE } from '../../../../interface/constant';

jest.mock('../../../../service/TelephonyService');

decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let vm: ForwardViewModel;

describe('ForwardViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    vm = new ForwardViewModel();
    vm._telephonyService.getForwardingNumberList = jest.fn();
    vm._telephonyService.forward = jest.fn();
  });

  describe('getForwardCalls', () => {
    it('should call getForwardingNumberList in telephony service', async () => {
      await vm.getForwardCalls();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.getForwardingNumberList).toHaveBeenCalled();
    });
  });

  describe('forward', () => {
    it('should call forward in telephony service', async () => {
      const phoneNumber = '123456789';
      await vm.forward(phoneNumber);
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.forward).toHaveBeenCalledWith(phoneNumber);
    });
  });
});
