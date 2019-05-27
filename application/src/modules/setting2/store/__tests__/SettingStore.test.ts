/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:53:26
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingStore, SettingStoreScope } from '../SettingStore';

describe('SettingStore', () => {
  describe('useScope()', () => {
    it('should add a new SettingStoreScope', () => {
      const store = new SettingStore();
      const storeScope = store.useScope(Symbol('TEST'));
      expect(storeScope).toBeInstanceOf(SettingStoreScope);
    });

    it('should return same SettingStoreScope', () => {
      const scope = Symbol('TEST');
      const store = new SettingStore();
      expect(store.useScope(scope)).toBe(store.useScope(scope));
    });
  });
});
