/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */
import { test, testable } from 'shield';
import { mockService } from 'shield/sdk';
import { mockEntity } from 'shield/application/mockEntity';
import {
  JServerError,
  JNetworkError,
  ERROR_CODES_SERVER,
  ERROR_CODES_NETWORK,
} from 'sdk/error';
import { PersonService } from 'sdk/module/person';
import { CustomStatusViewModel } from '../CustomStatus.ViewModel';
import { ServiceLoader } from 'sdk/module/serviceLoader';
import { Notification } from '@/containers/Notification';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

function toastParamsBuilder(message: string) {
  return {
    message,
    type: ToastType.ERROR,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
    autoHideDuration: 3000,
  };
}
jest.unmock('@/common/emojiHelpers/map/mapUnicode');
const personService = new PersonService();
const vm: CustomStatusViewModel = new CustomStatusViewModel();
const mockBackendError = new JServerError(ERROR_CODES_SERVER.GENERAL, '');
const mockNetworkError = new JNetworkError(ERROR_CODES_NETWORK.NOT_NETWORK, '');

describe('CustomStatusViewModel', () => {
  beforeEach(() => {
    Notification.flashToast = jest.fn();
    ServiceLoader.getInstance = jest.fn().mockReturnValue(personService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  @testable
  class save {
    @test(
      'should display error toast when clear or save custom status with a network error [JPT-2846]',
    )
    @mockService.reject(PersonService, 'setCustomStatus', mockNetworkError)
    async t1() {
      const vm = new CustomStatusViewModel({ id: 1 });
      await vm.save();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('customstatus.shareCustomStatusNetworkError'),
      );
    }
    @test(
      'should display error toast when clear or save custom status with a server error [JPT-2882]',
    )
    @mockService.reject(PersonService, 'setCustomStatus', mockBackendError)
    async t2() {
      const vm = new CustomStatusViewModel({ id: 1 });
      await vm.save();
      expect(Notification.flashToast).toHaveBeenCalledWith(
        toastParamsBuilder('customstatus.shareCustomStatusServerError'),
      );
    }
    @test('should clear status when no input or input space [JPT-2885]')
    @mockService.resolve(personService, 'setCustomStatus', '')
    async t3() {
      const vm = new CustomStatusViewModel({ id: 1 });
      expect(vm.inputValue).toEqual('');
    }
    @test(
      'should save only the current text with spaces when sharing custom status [JPT-2886]',
    )
    @mockEntity({ awayStatus: ' my team ' })
    async t4() {
      const vm = new CustomStatusViewModel({ id: 1 });
      expect(vm.inputValue).toEqual(' my team ');
    }
  }
  @testable
  class showCloseBtn {
    @test('should not show close btn when empty input value and emoji')
    t1() {
      vm.inputValue = '';
      vm.emoji = '';
      expect(vm.showCloseBtn).toBeFalsy();
    }
  }
  @testable
  class handleInputValueChange {
    @test('should change input value when handleInputValueChange invoked')
    t1() {
      vm.handleInputValueChange('a');
      expect(vm.inputValue).toBe('a');
    }
  }
  @testable
  class handleEmojiChange {
    @test('should change emoji value when handleEmojiChange invoked')
    t1() {
      vm.handleEmojiChange(':happy:');
      expect(vm.emoji).toBe(':happy:');
    }
  }
  @testable
  class clearStatus {
    @test('should clear emoji and inputValue when clearStatus invoked')
    t1() {
      vm.clearStatus();
      expect(vm.emoji).toBe('');
      expect(vm.inputValue).toBe('');
    }
  }
});
