/*
 * @Author: Spike.Yang
 * @Date: 2019-05-07 15:13:47
 * Copyright © RingCentral. All rights reserved.
 */
import {
  Omit,
  ValueOf,
  ICall,
  Establishment,
  FsmStatus,
  FsmStatusCategory,
  MediaReportOutCome,
} from './types';
import mediaReport from './Media';
import { rtcLogger } from '../utils/RTCLoggerProxy';

type Update = Omit<ICall, 'establishment' | 'fsmStatus'>;

const LOG_TAG = 'Call and Media Report';

class CallReport implements ICall {
  public id: string;
  public createTime: Date | null;
  public sessionId: string;
  public ua: any = null;
  public direction: 'incoming' | 'outgoing' | '';
  public establishment: Establishment;
  public fsmStatus: FsmStatus[];
  public media: MediaReportOutCome | null = null;

  constructor() {
    this._mount();
  }

  private _mount() {
    this._initState();
  }

  private _initState(): void {
    this.id = '';
    this.media = null;
    this.createTime = null;
    this.sessionId = '';
    this.ua = null;
    this.direction = '';
    this.establishment = Object.create(null);
    this.fsmStatus = [];
  }

  public update(key: keyof Update, value: ValueOf<Update>): void {
    this[key] = value;
  }

  public updateByPipe(
    items: {
      key: keyof Update;
      value: ValueOf<Update>;
    }[],
  ): void {
    items.map(item => (this[item.key] = item.value));
  }

  public updateFsmStatus(name: FsmStatusCategory): void {
    this.fsmStatus.push({
      name,
      timestamp: +new Date(),
    });
  }

  public updateEstablishment(key: keyof Establishment): void {
    if (this.establishment[key]) return;
    this.establishment[key] = +new Date();
  }

  private _calculationEstablishDurationBulk() {
    const { establishment, direction } = this as ICall;
    const {
      startTime,
      received200OkTime,
      answerTime,
      receivedAckTime,
    } = establishment;

    let start;
    let end;

    if (direction === 'outgoing' && received200OkTime) {
      start = startTime;
      end = received200OkTime;
    }

    if (direction === 'incoming' && receivedAckTime) {
      start = answerTime;
      end = receivedAckTime;
    }

    if (start && end) {
      const establishDurationBulk = (end - start) % 60;
      this.establishment.establishDurationBulk = `${establishDurationBulk}ms`;
    }
  }

  private _report() {
    rtcLogger.info(LOG_TAG, JSON.stringify(this));
  }

  private _beforeDestroy() {
    this._calculationEstablishDurationBulk();
  }

  public destroy() {
    this._beforeDestroy();
    this.media = mediaReport.stopAnalysis();
    this._report();
  }

  public init() {
    this._initState();
  }
}

const callReport = new CallReport();

export { CallReport };
export default callReport;
