/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 15:06:46
 * Copyright © RingCentral. All rights reserved.
 */

type KeyMapper = (index: number) => React.Key;

class RowManager {
  private _heightMap = new Map<React.Key, number>();
  private _beforeHeight: number = 0;
  private _minRowHeight: number;
  private _cacheMap = new Map<React.Key, number>();
  private _keyMapper: KeyMapper = (index: number) => index;

  constructor({ minRowHeight }: { minRowHeight: number }) {
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
  computeDiff(index: number, newHeight: number) {
    const oldHeight = this.getRowHeight(index);
    return newHeight - oldHeight;
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
    this._heightMap = new Map([...this._heightMap, ...this._cacheMap]);
    this._cacheMap = new Map();
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

  getRowOffsetTop(index: number) {
    return this.getBeforeHeight() + this.getRowsHeight(0, index - 1);
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

  setBeforeHeight(height: number) {
    this._beforeHeight = height;
  }

  getBeforeHeight() {
    return this._beforeHeight;
  }
}

export { RowManager, KeyMapper };
