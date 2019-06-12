/*
 * @Author: Paynter Chen
 * @Date: 2019-05-04 17:12:06
 * Copyright © RingCentral. All rights reserved.
 */
import { IZipItemProvider, ZipItem, ZipItemLevel } from './types';
import { MemoryCollector } from './collectors/memoryCollector';

export class MemoryLogZipItemProvider implements IZipItemProvider {
  level: ZipItemLevel = ZipItemLevel.NORMAL;
  constructor(public memoryCollector: MemoryCollector) {}

  getZipItems = async () => {
    const logs = this.memoryCollector.getAll();
    const logContent = logs
      .map(log => {
        return log.message;
      })
      .join('\n');
    return [
      {
        type: '.txt',
        name: 'RecentLogs',
        content: logContent,
      } as ZipItem,
    ];
  }
}
