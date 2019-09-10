/*
 * @Author: Paynter Chen
 * @Date: 2019-04-13 19:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogCollector, LogEntity } from 'foundation/log';
import { FixSizeMemoryLogCollection } from '../FixSizeMemoryLogCollection';
import { configManager } from '../../config';
import { ZipLogZipItemProvider } from '../../ZipLogZipItemProvider';

export class MemoryCollector implements ILogCollector {
  private _collection: FixSizeMemoryLogCollection;
  private _zipLogProvider: ZipLogZipItemProvider;

  constructor(zipLogProvider: ZipLogZipItemProvider) {
    this._zipLogProvider = zipLogProvider;
    this._collection = new FixSizeMemoryLogCollection(
      configManager.getConfig().memoryCacheSizeThreshold,
    );
    this._collection.setOnThresholdReach(ins => {
      const logs = ins.popAll();
      this._zipLogProvider.addZip(logs);
    });
  }

  onLog(logEntity: LogEntity): void {
    this._collection.push(logEntity);
  }

  getAll(): LogEntity[] {
    return this._collection.get();
  }
}
