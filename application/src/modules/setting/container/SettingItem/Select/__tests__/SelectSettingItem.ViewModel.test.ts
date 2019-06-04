import { SelectSettingItemViewModel } from '../SelectSettingItem.ViewModel';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');

describe('SelectSettingItemViewModel', () => {
  describe('saveSetting()', () => {
    it('should supports object as value and source', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
        source: [{ id: 'A' }, { id: 'B' }],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('B');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith({
        id: 'B',
      });
    });

    it('should supports object as value and source, and id is number', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
        source: [{ id: 1 }, { id: 2 }],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('2');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith({
        id: 2,
      });
    });

    it('should supports number as value and source', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
        source: [1, 2],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('2');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith(2);
    });

    it('should supports string as value and source', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
        source: ['A', 'B'],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('B');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith('B');
    });

    it('should throw error when source is invalid', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
        source: [{ customId: 1 }, { customId: 2 }],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(() => vm.saveSetting('2')).toThrow();
    });
  });
});
