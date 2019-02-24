/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-24 20:02:18
 * Copyright © RingCentral. All rights reserved.
 */

interface IGlobalConfigService {
  get(module: string, key: string): any;
  put(module: string, key: string, value: any): void;
  remove(module: string, key: string): void;
  clear(): void;
  on(module: string, key: string): void;
  off(module: string, key: string): void;
}

export { IGlobalConfigService };
