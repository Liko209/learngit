/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-31 11:42:03
 * Copyright © RingCentral. All rights reserved.
 */
abstract class AbstractRowManager {
  private _beforeHeight: number = 0;

  abstract getEstimateRowHeight(): number;
  abstract getAverageHeight(): number;
  abstract hasRowHeight(index: number): boolean;
  abstract getRowHeight(index: number): number;
  abstract getRowsHeight(startIndex: number, stopIndex: number): number;
  abstract getRowsHeight(startIndex: number, stopIndex: number): number;

  computeDiff(index: number, newHeight: number) {
    const oldHeight = this.getRowHeight(index);
    return newHeight - oldHeight;
  }

  getRowOffsetTop(index: number) {
    return this.getBeforeHeight() + this.getRowsHeight(0, index - 1);
  }

  abstract getRowIndexFromPosition(
    position: number,
    stopIndex: number,
    getUpper?: boolean,
  ): number;

  setBeforeHeight(height: number) {
    this._beforeHeight = height;
  }

  getBeforeHeight() {
    return this._beforeHeight;
  }
}

export { AbstractRowManager };
