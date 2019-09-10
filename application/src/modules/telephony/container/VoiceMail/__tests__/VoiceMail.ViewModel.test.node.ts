/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-08 18:26:37
 * Copyright © RingCentral. All rights reserved.
 */

import { container, decorate, injectable } from 'framework/ioc';
import { TelephonyService } from '../../../service/TelephonyService';
import { TelephonyStore } from '../../../store';
import { VoiceMailViewModel } from '../VoiceMail.ViewModel';
import { TELEPHONY_SERVICE } from '../../../interface/constant';

jest.mock('../../../service/TelephonyService');

decorate(injectable(), TelephonyStore);
decorate(injectable(), TelephonyService);

container.bind(TELEPHONY_SERVICE).to(TelephonyService);
container.bind(TelephonyStore).to(TelephonyStore);

let vm: VoiceMailViewModel;

describe('VoiceMailViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vm = new VoiceMailViewModel();
    vm._telephonyService.transfer = jest.fn();
  });
  describe('sendToVoiceMail()', () => {
    it('should call sendToVoiceMail function', () => {
      vm._telephonyStore.isTransferPage = false;
      vm.sendToVoiceMail();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.sendToVoiceMail).toHaveBeenCalled();
    });

    it('should call transferVoiceMail function', () => {
      vm._telephonyStore.isTransferPage = true;
      vm.sendToVoiceMail();
      const _telephonyService: TelephonyService = container.get(
        TELEPHONY_SERVICE,
      );
      expect(_telephonyService.transfer).toHaveBeenCalled();
    });
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
});
