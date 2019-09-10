/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:14
 * Copyright © RingCentral. All rights reserved.
 */
import { container, decorate, injectable } from 'framework/ioc';
// import { globalStore } from 'shield/integration-test';
// import { mockEntity } from 'shield/application';
// import { mockService } from 'shield/sdk';
import { TelephonyService } from '@/modules/telephony/service/TelephonyService';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { Dialog } from '@/containers/Dialog';

import { SwitchCallBannerViewModel } from '../SwitchCallBanner.ViewModel';

jest.mock('@/modules/telephony/service/TelephonyService');
jest.mock('@/containers/Dialog');

decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);

let vm: SwitchCallBannerViewModel;

describe('SwitchCallBannerViewModel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('switchCall()', () => {
    it('should call telephony service switchCall', async () => {
      vm = new SwitchCallBannerViewModel({});
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      jest.spyOn(_telephonyService, 'switchCall').mockResolvedValue(true);
      await vm.switchCall();
      expect(_telephonyService.switchCall).toHaveBeenCalledWith({});
      expect(vm._dialog).toBe(null);
      expect(vm.callOnOtherDevice).toEqual(undefined);
    });
  });

  describe('openCallSwitch()', () => {
    it('should call Dialog confirm', () => {
      vm = new SwitchCallBannerViewModel({});
      vm.openCallSwitch({
        title: '',
        size: 'small',
        onOK: () => {},
      });
      expect(Dialog.confirm).toHaveBeenCalled();
    });
  });
});
