/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 15:06:46
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractRowManager } from './AbstractRowManager';

type KeyMapper = (index: number) => React.Key;

class DynamicRowManager extends AbstractRowManager {
  private _heightMap = new Map<React.Key, number>();
  private _minRowHeight: number;
  private _cacheMap = new Map<React.Key, number>();
  private _keyMapper: KeyMapper = (index: number) => index;

  constructor({ minRowHeight }: { minRowHeight: number }) {
    super();
    this._minRowHeight = minRowHeight;
  }

  setKeyMapper(keyMapper: KeyMapper) {
    this._keyMapper = keyMapper;
  }

  getEstimateRowHeight() {
    return this._minRowHeight;
  }

  getAverageHeight() {
    let totalHeight = 0;
    for (const [, height] of this._heightMap) {
      totalHeight += height;
    }
    return Math.floor(totalHeight / this._heightMap.size);
  }

  hasRowHeight(index: number) {
    const key = this._keyMapper(index);
    return this._cacheMap.has(key) || this._heightMap.has(key);
  }

  setRowHeight(index: number, newHeight: number) {
    const key = this._keyMapper(index);
    this._heightMap.set(key, newHeight);
  }

  cacheRowHeight(index: number, newHeight: number) {
    const key = this._keyMapper(index);
    this._cacheMap.set(key, newHeight);
  }

  getRowHeight(index: number) {
    const key = this._keyMapper(index);
    const height = this._heightMap.get(key);
    return typeof height === 'number' ? height : this.getEstimateRowHeight();
  }

  flushCache() {
    this._cacheMap.forEach((val, key) => {
      this._heightMap.set(key, val);
    });
    this._cacheMap.clear();
  }

  getRowsHeight(startIndex: number, stopIndex: number) {
    if (stopIndex < 0) {
      return 0;
    }
    let heightBeforeIndex = 0;
    for (let i = startIndex; i <= stopIndex; i++) {
      const rowHeight = this.getRowHeight(i);
      heightBeforeIndex += rowHeight;
    }
    return heightBeforeIndex;
  }

  getRowIndexFromPosition(
    position: number,
    stopIndex: number,
    getUpper: boolean = false,
  ) {
    let rowsHeight = this.getBeforeHeight();
    for (let index = 0; index <= stopIndex; index++) {
      rowsHeight += this.getRowHeight(index);
      if (position < rowsHeight || (getUpper && position === rowsHeight)) {
        return index;
      }
    }
    return stopIndex;
  }
}

export { DynamicRowManager, KeyMapper };
