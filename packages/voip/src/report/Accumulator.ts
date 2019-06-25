/*
 * @Author: Spike.Yang
 * @Date: 2019-05-10 09:12:50
 * Copyright © RingCentral. All rights reserved.
 */

import { MediaReportProps, IAccumulator } from './types';

export default class Accumulator implements IAccumulator {
  private _m: number = 0;
  private _s: number = 0;
  private _N: number = 0;
  private _key: MediaReportProps;

  constructor(key: MediaReportProps) {
    this._key = key;
  }

  public addDateValue(x: number) {
    this._N++;
    this._s =
      x - this._m
        ? this._s + ((this._N - 1) / this._N) * (x - this._m) * (x - this._m)
        : 0;
    this._m = this._m + (x - this._m) / this._N;
  }

  get value(): number {
    return this._N - 1 ? +Math.sqrt(this._s / (this._N - 1)).toFixed(5) : 0;
  }

  get prop(): MediaReportProps {
    return this._key;
  }
}
