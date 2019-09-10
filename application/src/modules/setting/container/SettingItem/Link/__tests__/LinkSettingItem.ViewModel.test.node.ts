import { jupiter } from 'framework/Jupiter';
import { SettingStore } from '../../../../store/SettingStore';
import { LinkSettingItemViewModel } from '../LinkSettingItem.ViewModel';
import { getEntity } from '@/store/utils';

jest.mock('@/store/utils');

jupiter.registerClass(SettingStore);

const URL = 'http://test.com/value';
const URL2 = 'http://test.com/valueGetter';
const beforeSaving = jest.fn().mockReturnValue(true);

describe('LinkSettingItemViewModel', () => {
  beforeAll(() => {
    const settingStore: SettingStore = jupiter.get(SettingStore);
    jest
      .spyOn<SettingStore, any>(settingStore, 'getItemById')
      .mockReturnValue({ id: 'PAGE_1', beforeSaving });
  });
  describe('saveSetting()', () => {
    it('should return url from value', async () => {
      getEntity.mockReturnValue({
        value: URL,
        valueGetter: jest.fn().mockResolvedValue(URL2),
      });
      const vm = new LinkSettingItemViewModel({ id: 1 });
      expect(await vm.getUrl()).toBe(URL);
    });

    it('should return url from valueGetter', async () => {
      const valueGetter = jest.fn().mockResolvedValue(URL2);
      getEntity.mockReturnValue({ valueGetter });
      const vm = new LinkSettingItemViewModel({ id: 1 });
      expect(await vm.getUrl()).toBe(URL2);
    });

    it('should save setting with beforeSaving ', async () => {
      const valueGetter = jest.fn().mockResolvedValue(URL2);
      getEntity.mockReturnValue({ valueGetter });
      const vm = new LinkSettingItemViewModel({ id: 1 });
      expect(await vm.getUrl()).toBe(URL2);
      expect(beforeSaving).toHaveBeenCalled();
    });

    it('should cache url and avoid duplicate request', async () => {
      const valueGetter = jest.fn().mockResolvedValue(URL2);
      getEntity.mockReturnValue({ valueGetter });
      const vm = new LinkSettingItemViewModel({ id: 1 });
      await vm.getUrl();
      await vm.getUrl();
      await vm.getUrl();
      expect(await vm.getUrl()).toBe(URL2);
      expect(valueGetter).toHaveBeenCalledTimes(1);
    });
  });
});
