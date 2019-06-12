import { ToggleSettingItemViewModel } from '../ToggleSettingItem.ViewModel';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');

describe('ToggleSettingItemViewModel', () => {
  describe('saveSetting()', () => {
    it('should save setting', () => {
      getEntity.mockReturnValue({
        valueSetter: jest.fn(),
      });
      const vm = new ToggleSettingItemViewModel({ id: 1 });
      vm.saveSetting(false);
      expect(vm.settingItemEntity.valueSetter).toHaveBeenCalledWith(false);
    });
  });
});
