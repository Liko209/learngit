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
    const result: ZipItem[] = [];
    if (getIndexedDBZip) {
      const indexedDbZip = (await getIndexedDBZip(location.href)) as Blob;
      result.push({
        type: '.zip',
        folder: 'ElectronCache',
        name: 'indexedDB',
        content: indexedDbZip,
      });
    }
    if (getLocalStorageZip) {
      const localStorageZip = (await getLocalStorageZip()) as Blob;
      result.push({
        type: '.zip',
        folder: 'ElectronCache',
        name: 'localStorage',
        content: localStorageZip,
      });
    }
    return result;
  }
}
