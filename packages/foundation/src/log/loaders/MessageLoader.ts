/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import DateFormatter from './DateFormatter';
import { DATE_FORMATTER } from '../constants';
import { ILogLoader, LogEntity } from '../types';

export class MessageLoader implements ILogLoader {
  options: object;
  private dateFormatter: DateFormatter;
  constructor() {
    this.dateFormatter = new DateFormatter();
  }

  handle(data: LogEntity): LogEntity {
    let message = '';
    if (data.timestamp) {
      message = `${message}[${this._formatTime(data)}]`;
    }
    // data.message = message;
    const paramsString = (data.params.filter(item => Object.prototype.toString.call(item) === '[object String]').join(' ') as string);
    data.message = `${data.sessionIndex} ${message} ${paramsString}`;
    data.size = message.length;
    return data;
  }

  private _formatTime(logEntity: LogEntity): string {
    return this.dateFormatter.formatDate(new Date(logEntity.timestamp), DATE_FORMATTER.DEFAULT_DATE_FORMAT);
  }
}
