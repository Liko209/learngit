/*
 * @Author: Paynter Chen
 * @Date: 2019-03-27 13:38:36
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogPersistent, PersistentLogEntity } from './types';
import _ from 'lodash';
type Size = {
  size: number;
};

function deleteBySize<T extends Size>(
  items: T[],
  size: number,
): [number, number] {
  let counter = 0;
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    counter += element.size;
    if (counter >= size) {
      return [i + 1, counter];
    }
  }
  return [items.length, counter];
}

function itemSize<T extends Size>(item: T) {
  return item.size || 0;
}

export class LogMemoryPersistent implements ILogPersistent {
  private _logMap: Map<number, PersistentLogEntity> = new Map();
  private _totalSize: number = 0;

  constructor(private _limitSize: number) {}

  private _getChangeSize(
    item: PersistentLogEntity,
    operateType: 'add' | 'delete',
  ) {
    const sign = operateType === 'add' ? 1 : -1;
    if (this._logMap.has(item.id)) {
      return sign > 0
        ? itemSize(item) - itemSize(this._logMap.get(item.id)!)
        : -itemSize(this._logMap.get(item.id)!);
    }
    return sign * itemSize(item);
  }

  private _fixSize = async (
    operateType: 'add' | 'delete',
    ...items: PersistentLogEntity[]
  ) => {
    const changeSize = _.sumBy(
      items.map(item => this._getChangeSize(item, operateType)),
    );
    if (this._totalSize + changeSize > this._limitSize) {
      const array = await this.getAll();
      const [index, deleteSize] = deleteBySize(
        array,
        this._totalSize + changeSize - this._limitSize,
      );
      _.forEach(array.slice(0, index), it => this._logMap.delete(it.id));
      this._totalSize -= deleteSize;
    }
    this._totalSize += changeSize;
  }

  put = async (item: PersistentLogEntity) => {
    await this._fixSize('add', item);
    this._logMap.set(item.id, item);
  }

  bulkPut = async (items: PersistentLogEntity[]) => {
    await this._fixSize('add', ...items);
    _.forEach(items, (it: PersistentLogEntity) => this._logMap.set(it.id, it));
  }

  get = async (key: number) => {
    return this._logMap.get(key) || null;
  }

  getAll = async (limit?: number) => {
    const result = Array.from(this._logMap.values()).sort((left, right) => {
      return left.startTime - right.startTime;
    });
    return limit === undefined ? result : result.slice(0, limit);
  }

  delete = async (item: PersistentLogEntity) => {
    await this._fixSize('delete', item);
    this._logMap.delete(item.id);
  }

  bulkDelete = async (items: PersistentLogEntity[]) => {
    await this._fixSize('delete', ...items);
    _.forEach(items, (it: PersistentLogEntity) => this._logMap.delete(it.id));
  }

  count = async () => {
    return this._logMap.size;
  }
}
