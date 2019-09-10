/*
 * @Author: Paynter Chen
 * @Date: 2019-03-25 13:25:41
 * Copyright © RingCentral. All rights reserved.
 */
import { LogEntity, mainLogger } from 'foundation/log';
import { ILogCollection } from './types';

function countSize(array: LogEntity[], size: number) {
  let counter = 0;
  for (let i = 0; i < array.length; i++) {
    const log = array[i];
    counter += log.size;
    if (counter >= size) {
      return [i, counter];
    }
  }
  return [array.length - 1, counter];
}

const DEFAULT_SIZE_THRESHOLD = 10 * 1024 * 1024;

export class FixSizeMemoryLogCollection implements ILogCollection {
  private _totalSize: number = 0;
  private _recentLogQueue: LogEntity[] = [];
  private _sizeThreshold: number; // default 10M
  private _totalReleaseSize: number = 0;
  private _totalReleaseCount: number = 0;
  private _circle: number = 0;
  private _onThresholdReach: (ins: ILogCollection) => void;

  constructor(sizeThreshold?: number) {
    this._sizeThreshold = sizeThreshold || DEFAULT_SIZE_THRESHOLD;
  }

  private _recordRelease(count: number, size: number) {
    let shouldLog = false;
    if (this._totalReleaseSize > this._circle * this._sizeThreshold) {
      this._circle += 1;
      shouldLog = true;
    }
    this._totalReleaseSize += size;
    this._totalReleaseCount += count;
    shouldLog &&
      mainLogger
        .tags('FixSizeMemoryLogCollection')
        .debug(
          `reach threshold, total release => size: ${
            this._totalReleaseSize
          }, count: ${this._totalReleaseCount}`,
        );
  }

  push(logEntity: LogEntity) {
    const sizeSpace = this._sizeThreshold - this._totalSize;
    const shouldReleaseSize = logEntity.size - sizeSpace;
    shouldReleaseSize > 0 &&
      this._onThresholdReach &&
      this._onThresholdReach(this);
    if (shouldReleaseSize > 0) {
      const [index, releaseSize] = countSize(
        this._recentLogQueue,
        shouldReleaseSize,
      );
      this._totalSize -= releaseSize;
      this._recentLogQueue.splice(0, index + 1);
      this._recordRelease(index + 1, releaseSize);
    }
    this._totalSize += logEntity.size;
    this._recentLogQueue.push(logEntity);
  }

  pop(limit?: number) {
    if (limit === undefined) {
      const result = this._recentLogQueue;
      this._totalSize = 0;
      this._recentLogQueue = [];
      return result;
    }

    const [index, releaseSize] = countSize(this._recentLogQueue, limit);
    this._totalSize -= releaseSize;
    return this._recentLogQueue.splice(0, index + 1);
  }

  popAll() {
    this._totalSize = 0;
    return this._recentLogQueue.splice(0);
  }

  get(limit?: number): LogEntity[] {
    if (limit === undefined) {
      return this._recentLogQueue;
    }
    const [index] = countSize(this._recentLogQueue, limit);
    return this._recentLogQueue.slice(0, index + 1);
  }

  size() {
    return this._totalSize;
  }

  setSizeThreshold(threshold: number) {
    this._sizeThreshold = threshold;
  }

  setOnThresholdReach(cb: (ins: ILogCollection) => void) {
    this._onThresholdReach = cb;
  }
}
