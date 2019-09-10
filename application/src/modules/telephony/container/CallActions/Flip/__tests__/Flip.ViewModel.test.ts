/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-05-29 09:31:47
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { FlipViewModel } from '../Flip.ViewModel';
import * as telephony from '@/modules/telephony/module.config';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { getEntity } from '@/store/utils';

const rcInfoService = {
  getFlipNumberList: jest.fn(),
};

jest.mock('@/store/utils');
jest.mock('../../../../service/TelephonyService');

const jupiter = container.get(Jupiter);
jupiter.registerModule(telephony.config);

let vm: FlipViewModel;

describe('FlipViewModel', () => {
  beforeEach(() => {
    (getEntity as jest.Mock).mockReturnValue({
      holdState: 'idle',
      callState: 'idle',
    });
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(conf => {
      switch (conf) {
        case ServiceConfig.RC_INFO_SERVICE:
          return rcInfoService;
        default:
          return {} as any;
      }
    });
  });

  it('should call getFlipNumberList in telephony service', () => {
    vm = new FlipViewModel({});
    expect(rcInfoService.getFlipNumberList).toHaveBeenCalled();
  });

  it('should call Flip in telephony service', async () => {
    vm = new FlipViewModel({});
    vm._onActionError = jest.fn();
    const flipNumber = 1;
    await vm.flip(flipNumber);
    expect(vm._telephonyService.flip).toHaveBeenCalledWith(flipNumber);
    expect(vm._onActionError).not.toHaveBeenCalled();
  });

  it('should throw error when call flip function', async () => {
    vm = new FlipViewModel({});
    vm._onActionError = jest.fn();
    vm._telephonyService.flip.mockRejectedValue(new Error(''));
    const flipNumber = 1;
    await vm.flip(flipNumber);
    expect(vm._telephonyService.flip).toHaveBeenCalledWith(flipNumber);

    expect(vm._onActionError).toHaveBeenCalled();
  });

  it('should return true', () => {
    vm = new FlipViewModel({});
    vm.flipNumbers = [1];
    expect(vm.canUseFlip).toBeTruthy();
  });

  it('should return false when Hold or !hasFlipNumbers or isConnecting', () => {
    rcInfoService.getFlipNumberList.mockReturnValue([]);
    vm = new FlipViewModel({});
    expect(vm.canUseFlip).toBeFalsy();
    rcInfoService.getFlipNumberList.mockReturnValue([]);
  });
});
