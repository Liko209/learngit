/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-24 10:50:54
 * Copyright © RingCentral. All rights reserved.
 */

import { test, testable } from 'shield';
import { mockEntity, mockContainer } from 'shield/application';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { analyticsCollector } from '@/AnalyticsCollector';

import { E911SettingItemViewModel } from '../E911SettingItem.ViewModel';

jest.mock('@/AnalyticsCollector');

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

describe('E911SettingItemViewModel', () => {
  const telephonyService = {
    name: TELEPHONY_SERVICE,
    openE911() {},
  };
  @testable
  class showUserE911 {
    @mockContainer(telephonyService)
    beforeAll() {}
    @test('should be empty string if not value')
    t1() {
      const vm = new E911SettingItemViewModel();
      expect(vm.showUserE911).toBe('');
    }

    @test('should return string if has setting')
    @mockEntity({
      value: {
        city: 'city',
        country: 'country',
        state: 'state',
        street2: 'street2',
        zip: 1001,
      },
    })
    t2() {
      const vm = new E911SettingItemViewModel();
      expect(vm.showUserE911).toBe(
        'setting.phone.general.e911Setting.yourSavedAddressIsstreet2, city, state, 1001, country',
      );
    }
  }

  @testable
  class needConfirmE911 {
    @test('should be call needConfirmE911 if needConfirmE911')
    @mockContainer(telephonyService, 'openE911')
    t1() {
      const vm = new E911SettingItemViewModel();
      vm.openE911();
      expect(telephonyService.openE911).toHaveBeenCalled();
      expect(analyticsCollector.e911Setting).toHaveBeenCalled();
    }
  }
});
