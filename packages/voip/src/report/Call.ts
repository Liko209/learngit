/*
 * @Author: Spike.Yang
 * @Date: 2019-05-07 15:13:47
 * Copyright © RingCentral. All rights reserved.
 */
import {
  Omit,
  ValueOf,
  ICallReport,
  Establishment,
  FsmStatus,
  FsmStatusCategory,
  MediaReportOutCome,
  CallEvent,
  CallEventCategory,
} from './types';
import { MediaReport } from './Media';
import Report from './Report';
import { rtcLogger } from '../utils/RTCLoggerProxy';

type Update = Omit<ICallReport, 'establishment' | 'fsmStatus'>;

const LOG_TAG = 'Call and Media Report';

class CallReport implements ICallReport {
  public id: string = '';
  public createTime: Date | null = null;
  public sessionId: string = '';
  public ua: any = null;
  public direction: 'incoming' | 'outgoing' | '' = '';
  public establishment: Establishment = Object.create(null);
  public events: CallEvent[] = [];
  public fsmStatus: FsmStatus[] = [];
  public media: MediaReportOutCome | null = null;

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
      timestamp: new Date().toISOString(),
    });
  }

  public updateCallEvent(name: CallEventCategory, info: string): void {
    this.events.push({
      name,
      info,
      timestamp: new Date().toISOString(),
    });
  }

  public updateEstablishment(key: keyof Establishment): void {
    if (this.establishment[key]) return;
    this.establishment[key] = +new Date();
  }

  private _calculationEstablishDurationBulk() {
    const { establishment, direction } = this as ICallReport;
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
      const establishDurationBulk = end - start;
      this.establishment.establishDurationBulk = `${establishDurationBulk}ms`;
    }
  }

  private _report() {
    const {
      id,
      createTime,
      sessionId,
      ua,
      direction,
      establishment,
      events,
      fsmStatus,
      media,
    } = this as ICallReport;
    const options = JSON.stringify({
      id,
      createTime,
      sessionId,
      ua,
      direction,
      establishment,
      events,
      fsmStatus,
      media,
    });
    rtcLogger.info(LOG_TAG, options);
    Report(options);
  }

  private _beforeDestroy() {
    this._calculationEstablishDurationBulk();
  }

  public destroy() {
    this._beforeDestroy();
    this.media = MediaReport.instance().stopAnalysis();
    this._report();
  }
}

export { CallReport };
