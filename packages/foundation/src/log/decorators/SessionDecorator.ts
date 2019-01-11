/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';
import { DATE_FORMATTER } from '../constants';
import DateFormatter from './DateFormatter';

export class SessionDecorator implements ILogEntityDecorator {
  options: object;
  private _sessionId: string;
  private _sessionIndex: number;
  private _dateFormatter: DateFormatter;
  constructor() {
    this._dateFormatter = new DateFormatter();
    this.newSession();
  }

  newSession() {
    this._sessionId = this._dateFormatter.formatDate(new Date(), DATE_FORMATTER.DEFAULT_DATE_FORMAT);
    this._sessionIndex = 0;
  }

  getIndex() {
    return this._sessionIndex;
  }

  requestIndex() {
    return this._sessionIndex++;
  }

  decorate(data: LogEntity): LogEntity {
    data.sessionId = this._sessionId;
    data.sessionIndex = this.requestIndex();
    return data;
  }
}
