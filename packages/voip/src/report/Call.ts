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
import { MediaReport } from './Media';
import Report from './Report';
import { rtcLogger } from '../utils/RTCLoggerProxy';

type Update = Omit<ICall, 'establishment' | 'fsmStatus'>;

const LOG_TAG = 'Call and Media Report';

class CallReport implements ICall {
  private static _singleton: CallReport | null = null;
  public id: string = '';
  public createTime: Date | null = null;
  public sessionId: string = '';
  public ua: any = null;
  public direction: 'incoming' | 'outgoing' | '' = '';
  public establishment: Establishment = Object.create(null);
  public fsmStatus: FsmStatus[] = [];
  public media: MediaReportOutCome | null = null;

  public static instance() {
    return CallReport._singleton || (CallReport._singleton = new CallReport());
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
    const {
      id,
      createTime,
      sessionId,
      ua,
      direction,
      establishment,
      fsmStatus,
      media,
    } = this as ICall;
    const options = JSON.stringify({
      id,
      createTime,
      sessionId,
      ua,
      direction,
      establishment,
      fsmStatus,
      media,
    });

    rtcLogger.info(LOG_TAG, options);
    Report(options);
  }

  private _beforeDestroy() {
    this._calculationEstablishDurationBulk();
  }

  public destroySingleton() {
    CallReport._singleton = null;
  }

  public destroy() {
    this._beforeDestroy();
    this.media = MediaReport.instance().stopAnalysis();
    this._report();

    this.destroySingleton();
  }
}

export { CallReport };
