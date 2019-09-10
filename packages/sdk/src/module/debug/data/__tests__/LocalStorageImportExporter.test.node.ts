import { LocalStorageImportExporter } from '../LocalStorageImportExporter';

/*
 * @Author: Paynter Chen
 * @Date: 2019-08-28 13:20:07
 * Copyright © RingCentral. All rights reserved.
 */
describe('LocalStorageImportExporter', () => {
  const prepare = () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  };

  describe('export', () => {
    beforeEach(prepare);
    it('should export', async () => {
      const store = {
        a: 'aaa',
        b: 'bbb',
      };
      global.localStorage = {
        ...store,
        getItem: (key: string) => {
          return store[key];
        },
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
      };
      const result = await new LocalStorageImportExporter().export();
      expect(JSON.parse(result)).toEqual({
        a: 'aaa',
        b: 'bbb',
      });
    });
  });

  describe('import', () => {
    beforeEach(prepare);
    it('should import', async () => {
      const store = {
        c: 'ccc',
        d: 'ddd',
      };
      global.localStorage = {
        ...store,
        getItem: (key: string) => {
          return store[key];
        },
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
      };
      await new LocalStorageImportExporter().import(JSON.stringify(store));
      expect(global.localStorage.getItem('c')).toEqual('ccc');
      expect(global.localStorage.getItem('d')).toEqual('ddd');
    });
  });

  describe('validate()', () => {
    beforeEach(prepare);
    it('should return true', async () => {
      const target = new LocalStorageImportExporter();
      const result = await target.validate({} as any);
      expect(result).toBeTruthy();
    });
    it('should return false', async () => {
      const target = new LocalStorageImportExporter();
      const result = await target.validate(null as any);
      expect(result).toBeFalsy();
    });
  });
});
