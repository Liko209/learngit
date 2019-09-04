/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-27 11:03:37
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { Jupiter } from 'framework/Jupiter';
import { TelephonyStore } from '../../../store';
import { DialerPanelViewModel } from '../DialerPanel.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { TelephonyService } from '../../../service/TelephonyService';
import { ClientService } from '@/modules/common';
import { CLIENT_SERVICE } from '@/modules/common/interface';
import * as media from '@/modules/media/module.config';

jest.mock('@/modules/media/service');
jest.mock('sdk/module/item')
jest.mock('sdk/module/person');

const jupiter = container.get(Jupiter);
jupiter.registerModule(media.config);
decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);
decorate(injectable(), ClientService);

container.bind(TelephonyStore).to(TelephonyStore);
container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(CLIENT_SERVICE).to(ClientService);

let dialerPanelViewModel: DialerPanelViewModel;

global.requestAnimationFrame = fn => setTimeout(fn, 0);

beforeEach(() => {
  dialerPanelViewModel = new DialerPanelViewModel();
  dialerPanelViewModel._telephonyService.directCall = jest.fn();
  dialerPanelViewModel._telephonyService.onAfterDialerOpen = jest.fn();
  dialerPanelViewModel._telephonyStore.end = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('DialerPanelViewModel', () => {
  describe('onAfterDialerOpen', () => {
    it('should call onAfterDialerOpen on TelephonyService', () => {
      dialerPanelViewModel.onAfterDialerOpen();
      expect(
        dialerPanelViewModel._telephonyService.onAfterDialerOpen,
      ).toHaveBeenCalled();
    });
  });

  describe('makeCall', () => {
    it('should call end() on TelephonyStore when TelephonyService.directCall() returns false', async () => {
      dialerPanelViewModel._telephonyService.directCall = jest
        .fn()
        .mockReturnValue(false);

      await dialerPanelViewModel.makeCall();
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });
      expect(dialerPanelViewModel._telephonyStore.end).toHaveBeenCalled();
    });

    it('should not call end() on TelephonyStore when TelephonyService.directCall() returns true', async () => {
      dialerPanelViewModel._telephonyService.directCall = jest
        .fn()
        .mockReturnValue(true);

      await dialerPanelViewModel.makeCall();
      await new Promise(resolve => {
        setTimeout(resolve, 10);
      });
      expect(dialerPanelViewModel._telephonyStore.end).not.toHaveBeenCalled();
    });
  });

  describe('backToDialerFromTransferPage', () => {
    it('Should be back to the previous active page when click the back button [JPT-2759]', () => {
      dialerPanelViewModel.backToDialerFromTransferPage();
      expect(dialerPanelViewModel._telephonyStore.isTransferPage).toBeFalsy();
    })
  })
});
