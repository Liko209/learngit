/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-24 10:50:54
 * Copyright © RingCentral. All rights reserved.
 */

import { test, testable } from 'shield';
import { mockEntity } from 'shield/application';

import { E911SettingItemViewModel } from '../E911SettingItem.ViewModel';

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

describe('E911SettingItemViewModel', () => {
  @testable
  class showUserE911 {
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
});
