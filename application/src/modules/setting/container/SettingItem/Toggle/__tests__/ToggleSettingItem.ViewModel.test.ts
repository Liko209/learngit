import { ToggleSettingItemViewModel } from '../ToggleSettingItem.ViewModel';
import { jupiter } from 'framework';
import { SettingStore } from '../../../../store/SettingStore';
import { getEntity } from '@/store/utils';

jupiter.registerClass(SettingStore);

jest.mock('@/store/utils');

function mockSettingItem(item: any) {
  jest
    .spyOn<any, any>(
      ToggleSettingItemViewModel.prototype,
      '_settingStore',
      'get',
    )
    .mockReturnValue({
      getItemById: jest.fn().mockReturnValue(item),
    });
}

describe('ToggleSettingItemViewModel', () => {
  beforeAll(() => {
    const settingStore: SettingStore = jupiter.get(SettingStore);
    jest
      .spyOn<SettingStore, any>(settingStore, 'getItemById')
      .mockReturnValue({ id: 'PAGE_1' });
  });
  describe('saveSetting()', () => {
    it('should save setting [JPT-2083]', async () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      const vm = new ToggleSettingItemViewModel({ id: 1 });
      await vm.saveSetting(false);
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith(false);
    });
    it('should save setting with beforeSavingAsync ', async () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      const vm = new ToggleSettingItemViewModel({ id: 1 });
      const beforeSavingAsync = jest.fn();
      mockSettingItem({
        beforeSavingAsync,
      });
      await vm.saveSetting(false);
      expect(beforeSavingAsync).toHaveBeenCalled();
    });
  });
});
