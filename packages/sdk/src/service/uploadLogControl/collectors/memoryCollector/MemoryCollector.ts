/*
 * @Author: Paynter Chen
 * @Date: 2019-04-13 19:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogCollector, LogEntity } from 'foundation';
import { FixSizeMemoryLogCollection } from '../FixSizeMemoryLogCollection';
import { configManager } from '../../config';

export class MemoryCollector implements ILogCollector {
  private _collection: FixSizeMemoryLogCollection;

  constructor() {
    this._collection = new FixSizeMemoryLogCollection(
      configManager.getConfig().memoryCacheSizeThreshold,
    );
  }

  onLog(logEntity: LogEntity): void {
    this._collection.push(logEntity);
  }

  getAll(): LogEntity[] {
    return this._collection.get();
  }
}
