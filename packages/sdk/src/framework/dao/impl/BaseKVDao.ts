/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-02-27 21:44:43
 */
import { KVStorage } from 'foundation/db';
import { IKVDao } from '../interface/IKVDao';

class BaseKVDao implements IKVDao {
  private kvStorage: KVStorage;
  private collectionName: string;
  private keys: string[];
  constructor(collectionName: string, kvStorage: KVStorage, keys: string[]) {
    this.kvStorage = kvStorage;
    this.collectionName = collectionName;
    this.keys = keys;
  }

  getKey(key: string): string {
    return `${this.collectionName}/${key}`;
  }

  put(key: string, value: any): void {
    this.kvStorage.put(this.getKey(key), value);
  }

  get(key: string): any {
    return this.kvStorage.get(this.getKey(key));
  }

  remove(key: string): void {
    this.kvStorage.remove(this.getKey(key));
  }

  clear(): void {
    this.keys.map(key => this.remove(key));
  }
}

export default BaseKVDao;
