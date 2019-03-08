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
  private _keyMapper: KeyMapper;

  constructor({ minRowHeight }: { minRowHeight: number }) {
    this._minRowHeight = minRowHeight;
    Object.assign(window, { rowManager: this });
  }

  setKeyMapper(keyMapper: KeyMapper) {
    this._keyMapper = keyMapper;
  }

  getEstimateRowHeight() {
    let result: number;
    if (this._heightMap.size > 0) {
      let totalHeight = 0;
      for (const [, height] of this._heightMap) {
        totalHeight += height;
      }
      result = totalHeight / this._heightMap.size;
    } else {
      result = this._minRowHeight;
    }
    return result;
  }

  hasRowHeight(index: number) {
    const key = this._keyMapper(index);
    return this._heightMap.has(key);
  }

  setRowHeight(index: number, newHeight: number) {
    let diff = 0;
    let oldHeight = 0;

    if (newHeight !== 0) {
      oldHeight = this.getRowHeight(index);
      diff = newHeight - oldHeight;
      const key = this._keyMapper(index);
      this._heightMap.set(key, newHeight);
    }

    return { newHeight, oldHeight, diff };
  }

  getRowHeight(index: number) {
    const key = this._keyMapper(index);
    const height = this._heightMap.get(key);
    return typeof height === 'number' ? height : this.getEstimateRowHeight();
  }

  getRowsHeight(startIndex: number, stopIndex: number) {
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

  setBeforeHeight(height: number) {
    this._beforeHeight = height;
  }

  getRowIndexFromPosition(position: number, stopIndex: number) {
    let rowsHeight = this.getBeforeHeight();
    for (let index = 0; index <= stopIndex; index++) {
      rowsHeight += this.getRowHeight(index);
      if (position < rowsHeight) {
        return index;
      }
    }
    return stopIndex - 1;
  }

  getBeforeHeight() {
    return this._beforeHeight;
  }
}

export { RowManager, KeyMapper };
