import GlobalStore from '../GlobalStore';
import { GLOBAL_KEYS } from '../../constants';

describe('GlobalStore', () => {
  const globalStore = new GlobalStore();
  describe('set(key, value)', () => {
    it('the key should be set with value in globalStore', () => {
      const value = 'online';
      globalStore.set(GLOBAL_KEYS.NETWORK, value);
      expect(globalStore.get(GLOBAL_KEYS.NETWORK)).toEqual(value);
    });
  });
  describe('batchSet(data)', () => {
    it('should batch set with data', () => {
      const value1 = 'text';
      const value2 = false;
      const data = {
        [GLOBAL_KEYS.NETWORK]: value1,
        [GLOBAL_KEYS.WINDOW_FOCUS]: value2,
      };
      globalStore.batchSet(data);
      expect(globalStore.get(GLOBAL_KEYS.NETWORK)).toEqual(value1);
      expect(globalStore.get(GLOBAL_KEYS.WINDOW_FOCUS)).toEqual(value2);
    });
  });
  describe('remove(key)', () => {
    it('should remove the key in globalStore', () => {
      const key = GLOBAL_KEYS.IS_LEFT_NAV_OPEN;
      const value = true;
      globalStore.set(key, value);
      expect(globalStore.get(key)).toEqual(value);
      globalStore.remove(key);
      expect(globalStore.get(key)).toBeUndefined();
    });
  });
  describe('batchRemove(keys)', () => {
    it('should remove the key in globalStore', () => {
      const key1 = GLOBAL_KEYS.IS_LEFT_NAV_OPEN;
      const value1 = false;
      const key2 = GLOBAL_KEYS.WINDOW_FOCUS;
      const value2 = true;
      globalStore.set(key1, value1);
      globalStore.set(key2, value2);
      expect(globalStore.get(key1)).toEqual(value1);
      expect(globalStore.get(key2)).toEqual(value2);
      globalStore.batchRemove([key1, key2]);
      expect(globalStore.get(key1)).toBeUndefined();
      expect(globalStore.get(key2)).toBeUndefined();
    });
  });
});
