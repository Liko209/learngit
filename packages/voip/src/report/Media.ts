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
  private static _singleton: MediaReport | null = null;
  private _queue: MediaReportItemType[] = [];
  private _outcome: MediaReportOutCome | null = null;
  private _accumulator = Object.create(null);
  private _sum = Object.create(null);
  private _total: number = 0;

  constructor() {
    this._init();
  }

  private _init() {
    this._queue = [defaultItems()];
    this._accumulator = Object.create(null);
    this._sum = Object.create(null);
    this._outcome = null;
    this._total = 0;
    KEYS.forEach((key: MediaReportProps) => {
      this._accumulator[key] = new Accumulator(key);
      this._sum[key] = 0;
    });
  }

  static instance() {
    return (
      MediaReport._singleton || (MediaReport._singleton = new MediaReport())
    );
  }

  destroySingleton() {
    MediaReport._singleton = null;
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

  private _NeedCalculateDiff(key: string): boolean {
    return (
      key !== 'jitter' &&
      key !== 'fractionLost' &&
      key !== 'currentRoundTripTime'
    );
  }

  private _calculationDiff(queue: MediaReportItemType[]): MediaReportItemType {
    const [head, tail = { none: true }] = queue;
    const item = Object.create(null) as MediaReportItemType;
    KEYS.forEach(key => {
      if (tail.none) tail[key] = 0;
      // jitter fractionLost and rtt don't calculation diff
      if (!this._NeedCalculateDiff(key)) {
        item[key] = this._generateItem({
          headMin: tail[key],
          headMax: tail[key],
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
      if (this._NeedCalculateDiff(curr)) {
        this._sum[curr] += item[curr];
      }
      const min = !this._NeedCalculateDiff(curr) ? item[curr].min : item[curr];
      const max = !this._NeedCalculateDiff(curr) ? item[curr].max : item[curr];

      prev[curr] = this._generateItem({
        headMin: this._outcome ? this._outcome[curr].min : min,
        headMax: this._outcome ? this._outcome[curr].max : max,
        tailMin: min,
        tailMax: max,
      });
      return prev;
    }, Object.create(null));
  }

  private _parse(data: MediaStatusReport): MediaReportItemType {
    return KEYS.reduce(
      (prev, curr) => {
        if (data.inboundRtpReport && data.inboundRtpReport[curr] !== undefined) {
          prev[curr] = data.inboundRtpReport[curr];
        } else if (data.outboundRtpReport && data.outboundRtpReport[curr] !== undefined) {
          prev[curr] = data.outboundRtpReport[curr];
        } else if (data.rttMS && data.rttMS[curr] !== undefined) {
          prev[curr] = data.rttMS[curr];
        }
        return prev;
      },
      Object.create(null) as MediaReportItemType,
    );
  }

  private _start(item: MediaReportItemType) {
    this._queue.push(item);
    this._total++;
    if (this._queue.length >= 2) {
      // Calculate the result, save it, and drop the first one.
      this._outcome = this._calculationOutCome(
        this._calculationDiff(this._queue),
      );
      this._queue.shift();
    }
  }

  startAnalysis(data: any) {
    if (!data || typeof data !== 'object' || !data.inboundRtpReport) return;

    this._start(this._parse(data));
  }

  stopAnalysis(): MediaReportOutCome {
    const outcome = deepClone(this.outcome);
    this.destroySingleton();

    return outcome;
  }

  get outcome(): MediaReportOutCome | null {
    if (!this._outcome) return null;

    KEYS.forEach(key => {
      if (this._outcome) {
        this._outcome[key].variance = this._accumulator[key].value;
        this._outcome[key].average = this._getAverage(key);
      }
    });
    return this._outcome;
  }
}

export { MediaReport };
