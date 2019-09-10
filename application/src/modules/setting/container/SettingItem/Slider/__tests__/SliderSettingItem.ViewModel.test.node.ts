/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-28 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { SliderSettingItemViewModel } from '../SliderSettingItem.ViewModel';
import { jupiter } from 'framework/Jupiter';
import { SettingStore } from '../../../../store/SettingStore';
import { getEntity } from '@/store/utils';

jupiter.registerClass(SettingStore);

jest.mock('@/store/utils');

function mockSettingItem(item: any) {
  jest
    .spyOn<any, any>(
      SliderSettingItemViewModel.prototype,
      '_settingStore',
      'get',
    )
    .mockReturnValue({
      getItemById: jest.fn().mockReturnValue(item),
    });
}

describe('SliderSettingItemViewModel', () => {
  beforeAll(() => {
    const settingStore: SettingStore = jupiter.get(SettingStore);
    jest
      .spyOn<SettingStore, any>(settingStore, 'getItemById')
      .mockReturnValue({ id: 'PAGE_1' });
  });
  describe('saveSetting()', () => {
    it('should save setting ', async () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      const vm = new SliderSettingItemViewModel({ id: 1 });
      await vm.saveSetting(10);
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith(10);
    });

    it('should not save setting when beforeSaving return false', async () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      mockSettingItem({
        beforeSaving: () => false,
      });
      const vm = new SliderSettingItemViewModel({ id: 1 });
      await vm.saveSetting(10);
      expect(vm.settingItemEntity.valueSetter).not.toHaveBeenCalled();
    });
    it('should save setting with beforeSaving ', async () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      const vm = new SliderSettingItemViewModel({ id: 1 });
      const beforeSaving = jest.fn();
      mockSettingItem({
        beforeSaving,
      });
      await vm.saveSetting(10);
      expect(beforeSaving).toHaveBeenCalled();
    });
  });
});
