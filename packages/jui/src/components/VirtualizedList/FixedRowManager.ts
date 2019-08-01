/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-07 15:06:46
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractRowManager } from './AbstractRowManager';

/* eslint-disable @typescript-eslint/no-unused-vars */
class FixedRowManager extends AbstractRowManager {
  private _fixedRowHeight: number;

  constructor({ fixedRowHeight }: { fixedRowHeight: number }) {
    super();
    this._fixedRowHeight = fixedRowHeight;
  }

  getEstimateRowHeight() {
    return this._fixedRowHeight;
  }

  getAverageHeight() {
    return this._fixedRowHeight;
  }

  hasRowHeight(index: number) {
    return true;
  }

  getRowHeight(index: number) {
    return this._fixedRowHeight;
  }

  getRowsHeight(startIndex: number, stopIndex: number) {
    if (startIndex > stopIndex) return 0;

    return this._fixedRowHeight * (stopIndex - startIndex + 1);
  }

  getRowIndexFromPosition(
    position: number,
    stopIndex: number,
    getUpper: boolean = false,
  ) {
    const totalPosition = position - this.getBeforeHeight();
    let result = Math.floor(totalPosition / this._fixedRowHeight);

    if (getUpper && totalPosition % this._fixedRowHeight === 0) {
      result--;
    }

    return Math.min(result, stopIndex);
  }
}

export { FixedRowManager };
