/*
 * @Author: Paynter Chen
 * @Date: 2019-03-25 13:25:41
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogConsumer, LogEntity } from 'foundation';

export class MemoryLogConsumer implements ILogConsumer {
  private _totalSize: number = 0;
  private _recentLogQueue: LogEntity[] = [];
  private _sizeThreshold: number = 10 * 1024 * 1024; // default 10M
  private _filter: (log: LogEntity) => boolean;
  private _releaseQueue(size: number): number {
    const totalSize = this._totalSize;
    let counter = 0;
    for (let i = 0; i < this._recentLogQueue.length; i++) {
      const log = this._recentLogQueue[i];
      counter += log.size;
      if (counter >= size) {
        this._recentLogQueue = this._recentLogQueue.slice(i + 1);
        return totalSize - counter;
      }
    }
    this._recentLogQueue = [];
    return 0;
  }

  setFilter(filter: (log: LogEntity) => boolean) {
    this._filter = filter;
  }

  onLog(logEntity: LogEntity) {
    if (this._filter && !this._filter(logEntity)) return;
    const sizeSpace = this._sizeThreshold - this._totalSize;
    const releaseSize = logEntity.size - sizeSpace;
    if (releaseSize > 0) {
      this._totalSize = this._releaseQueue(releaseSize);
    }
    this._totalSize += logEntity.size;
    this._recentLogQueue.push(logEntity);
  }

  setSizeThreshold(threshold: number) {
    this._sizeThreshold = threshold;
  }

  getRecentLogs() {
    return this._recentLogQueue;
  }
}
