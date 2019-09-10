/*
 * @Author: Paynter Chen
 * @Date: 2019-06-05 12:21:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IZipItemProvider, ZipItem, ZipItemLevel } from 'sdk/module/log/types';

export class AppDataItemProvider implements IZipItemProvider {
  level: ZipItemLevel = ZipItemLevel.DEBUG_ALL;

  constructor(
    public data: {
      getAppData: () => Promise<Blob>;
    },
  ) {}

  getZipItems = async () => {
    const result: ZipItem[] = [];
    const cacheData = await this.data.getAppData();
    cacheData &&
      result.push({
        type: '.zip',
        folder: 'AppData',
        name: 'data',
        content: cacheData,
      });
    return result;
  };
}
