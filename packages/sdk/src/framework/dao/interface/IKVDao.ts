/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-01-21 10:25:00
 */

interface IKVDao {
  getKey(key: string): string;

  put(key: string, value: any): void;

  get(key: string): any;

  remove(key: string): void;

  clear(): void;
}

export { IKVDao };
