import { IStorage } from '../../db';
/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-30 18:31:06
 * Copyright © RingCentral. All rights reserved.
 */

// In-memory implementation for when localStorage/sessionStorage is not supported, for example
// in Safari private mode, and when Content Settings prevents from setting any data in Chrome

function storageFactory(storage: IStorage) {
  let inMemoryStorage = {};
  // let length: number = 0;

  function isSupported(): boolean {
    try {
      const randomKey = '__some_random_key_you_are_not_going_to_use__';
      storage.setItem(randomKey, randomKey);
      storage.removeItem(randomKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    // get length(): number {
    //   if (isSupported()) {
    //     return storage.length;
    //   }
    //   return length;
    // },

    getItem(key: string): string | null {
      if (isSupported()) {
        return storage.getItem(key);
      }
      return inMemoryStorage[key] || null;
    },

    setItem(key: string, value: any): void {
      if (isSupported()) {
        storage.setItem(key, value);
      } else {
        inMemoryStorage[key] = `${value}`;
        // length += 1;
      }
    },

    removeItem(key: string): void {
      if (isSupported()) {
        storage.removeItem(key);
      } else {
        delete inMemoryStorage[key];
        // length -= 1;
      }
    },

    clear(): void {
      if (isSupported()) {
        storage.clear();
      } else {
        inMemoryStorage = {};
        // length = 0;
      }
    },

    // key(n: number): string | null {
    //   if (isSupported()) {
    //     return storage.key(n);
    //   }
    //   return Object.keys(inMemoryStorage)[n] || null;
    // }
  };
}

export default storageFactory;
