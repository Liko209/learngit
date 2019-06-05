/*
 * @Author: Paynter Chen
 * @Date: 2019-06-05 12:21:00
 * Copyright © RingCentral. All rights reserved.
 */

import {
  IZipItemProvider,
  ZipItem,
  ZipItemLevel,
} from 'sdk/service/uploadLogControl/types';

export class ElectronCacheItemProvider implements IZipItemProvider {
  level: ZipItemLevel = ZipItemLevel.DEBUG_ALL;

  getZipItems = async () => {
    const { getIndexedDBZip, getLocalStorageZip } = window.jupiterElectron;
    if (getIndexedDBZip && getLocalStorageZip) {
      const indexedDbZip = (await getIndexedDBZip(location.href)) as Blob;
      const localStorageZip = (await getLocalStorageZip()) as Blob;
      return [
        {
          type: '.zip',
          folder: 'Electron',
          name: 'indexedDB',
          content: indexedDbZip,
        } as ZipItem,
        {
          type: '.zip',
          folder: 'Electron',
          name: 'localStorage',
          content: localStorageZip,
        } as ZipItem,
      ];
    }
    return [];
  }
}
