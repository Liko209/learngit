/*
* @Author: Chris Zhan (chris.zhan@ringcentral.com)
* @Date: 2018-02-05 13:34:15
* Copyright © RingCentral. All rights reserved.
*/
import { IStorage } from '../../db';

class KVStorage {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  get(key: number | string): any {
    const value = this.storage.getItem(String(key));
    if (value) {
      return this.deserialize(value);
    } else {
      return null;
    }
  }

  put(key: number | string, value: any): void {
    const serialized = this.serialize(value);
    if (serialized === undefined) return;
    this.storage.setItem(String(key), serialized);
  }

  remove(key: number | string): void {
    this.storage.removeItem(String(key));
  }

  clear(): void {
    this.storage.clear();
  }

  serialize(value: any): string {
    return JSON.stringify(value);
  }

  deserialize(value: string): any {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
}

export default KVStorage;
