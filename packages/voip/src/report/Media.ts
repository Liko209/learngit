/*
 * @Author: Spike.Yang
 * @Date: 2019-05-10 09:13:54
 * Copyright © RingCentral. All rights reserved.
 */
import Accumulator from './Accumulator';
import {
  MediaReportProps,
  MediaReportOutcomeItem,
  MediaStatusReport,
  MediaReportOutCome,
  MediaReportItemType,
  IMediaReport,
} from './types';
import { KEYS, deepClone, defaultItems } from './util';

class MediaReport implements IMediaReport {
  private _queen: MediaReportItemType[] = [];
  private _outcome: MediaReportOutCome | null = null;
  private _accumulator = Object.create(null);
  private _sum = Object.create(null);
  private _total: number = 0;

  constructor() {
    this._init();
  }

  private _init() {
    this._queen = [defaultItems()];
    this._accumulator = Object.create(null);
    this._sum = Object.create(null);
    this._outcome = null;
    this._total = 0;
    KEYS.forEach((key: MediaReportProps) => {
      this._accumulator[key] = new Accumulator(key);
      this._sum[key] = 0;
    });
  }

  private _generateItem({
    headMin,
    headMax,
    tailMin,
    tailMax,
  }: any): MediaReportOutcomeItem<number> {
    return {
      min: Math.min(headMin, tailMin),
      max: Math.max(headMax, tailMax),
    };
  }

  private _getAverage(key: string): number {
    return +(this._sum[key] / this._total).toFixed(5);
  }

  private _isJitter(key: string): boolean {
    return key === 'jitter';
  }

  private _calculationDiff(queen: MediaReportItemType[]): MediaReportItemType {
    const [head, tail = { none: true }] = queen;
    const item = Object.create(null) as MediaReportItemType;
    KEYS.forEach(key => {
      if (tail.none) tail[key] = 0;
      // jitter don't calculation diff
      if (this._isJitter(key)) {
        item[key] = this._generateItem({
          headMin: head[key],
          headMax: head[key],
          tailMin: tail[key],
          tailMax: tail[key],
        });
        this._sum[key] += tail[key];
        this._accumulator[key].addDateValue(tail[key]);
        return;
      }
      item[key] = tail[key] - head[key];
      this._accumulator[key].addDateValue(item[key]);
    });

    return item;
  }

  private _calculationOutCome(item: MediaReportItemType): MediaReportOutCome {
    return KEYS.reduce((prev, curr) => {
      if (!this._isJitter(curr)) {
        this._sum[curr] += item[curr];
      }
      const min = this._isJitter(curr) ? item[curr].min : item[curr];
      const max = this._isJitter(curr) ? item[curr].max : item[curr];

      prev[curr] = this._generateItem({
        headMin: this._outcome ? this._outcome[curr].min : min,
        headMax: this._outcome ? this._outcome[curr].max : max,
        tailMin: min,
        tailMax: max,
      });
      return prev;
    },                 Object.create(null));
  }

  private _parse(data: MediaStatusReport): MediaReportItemType {
    return KEYS.reduce(
      (prev, curr) => {
        prev[curr] =
          typeof data.inboundRtpReport[curr] === 'undefined'
            ? data.outboundRtpReport[curr]
            : data.inboundRtpReport[curr];
        return prev;
      },
      Object.create(null) as MediaReportItemType,
    );
  }

  private _start(item: MediaReportItemType) {
    this._queen.push(item);

    this._total += 1;
    if (this._queen.length >= 2) {
      // Calculate the result, save it, and drop the first one.
      this._outcome = this._calculationOutCome(
        this._calculationDiff(this._queen),
      );
      this._queen.shift();
    }
  }

  public startAnalysis(data: any) {
    if (!data || typeof data !== 'object' || !data.inboundRtpReport) return;

    this._start(this._parse(data));
  }

  public stopAnalysis(): MediaReportOutCome {
    const outcome = deepClone(this.outcome);
    this._init();

    return outcome;
  }

  get outcome(): MediaReportOutCome | null {
    if (!this._outcome) return null;

    KEYS.forEach(key => {
      this._outcome![key].variance = this._accumulator[key].value;
      this._outcome![key].average = this._getAverage(key);
    });
    return this._outcome;
  }
}

const mediaReport = ((window as any).mediaReport = new MediaReport());

export { MediaReport };
export default mediaReport;
