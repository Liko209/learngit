import { SelectSettingItemViewModel } from '../SelectSettingItem.ViewModel';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');

function mockSettingItem(item: any) {
  jest
    .spyOn<any, any>(
      SelectSettingItemViewModel.prototype,
      '_settingStore',
      'get',
    )
    .mockReturnValue({
      getItemById: jest.fn().mockReturnValue(item),
    });
}

function mockSettingItemEntity(entity: any) {
  getEntity.mockReturnValue(entity);
}

describe('SelectSettingItemViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest
      .spyOn<any, any>(
        SelectSettingItemViewModel.prototype,
        '_settingStore',
        'get',
      )
      .mockReturnValue({
        getItemById: jest.fn().mockReturnValue({ id: 1 }),
      });
  });

  describe('source', () => {
    it('should return source of settingItemEntity', () => {
      mockSettingItem({ id: 1 });
      mockSettingItemEntity({
        source: [{ id: 1 }, { id: 2 }],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(vm.source).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return default source of settingItem phase 1', () => {
      mockSettingItem({ id: 1, defaultSource: [{ id: 3 }, { id: 4 }] });
      mockSettingItemEntity({
        source: undefined,
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(vm.source).toEqual([{ id: 3 }, { id: 4 }]);
    });

    it('should return default source of settingItem phase 2', () => {
      mockSettingItem({ id: 1, defaultSource: [{ id: 3 }, { id: 4 }] });
      mockSettingItemEntity({
        source: [],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(vm.source).toEqual([{ id: 3 }, { id: 4 }]);
    });
  });

  describe('value', () => {
    it('should return extracted value', () => {
      mockSettingItem({
        valueExtractor: (obj: any) => obj.myId,
      });
      mockSettingItemEntity({
        value: { myId: '1' },
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(vm.value).toEqual('1');
    });
  });

  describe('saveSetting() [JPT-2083]', () => {
    it('should supports object as value and source', () => {
      mockSettingItemEntity({
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
      mockSettingItemEntity({
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
      mockSettingItemEntity({
        valueSetter: jest.fn(),
        source: [1, 2],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('2');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith(2);
    });

    it('should supports string as value and source', () => {
      mockSettingItemEntity({
        valueSetter: jest.fn(),
        source: ['A', 'B'],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      vm.saveSetting('B');
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith('B');
    });

    it('should throw error when source is invalid', () => {
      mockSettingItemEntity({
        valueSetter: jest.fn(),
        source: [{ customId: 1 }, { customId: 2 }],
      });
      const vm = new SelectSettingItemViewModel({ id: 1 });
      expect(() => vm.saveSetting('2')).toThrow();
    });
  });
});
