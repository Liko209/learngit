/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import DateFormatter from './DateFormatter';
import { DATE_FORMATTER } from '../constants';
import { ILogEntityDecorator, LogEntity } from '../types';
import _ from 'lodash';

export class MessageDecorator implements ILogEntityDecorator {
  options: object;
  private dateFormatter: DateFormatter;
  constructor() {
    this.dateFormatter = new DateFormatter();
  }

  decorate(data: LogEntity): LogEntity {
    let message = '';
    if (data.timestamp) {
      message = `${message}[${this._formatTime(data)}]`;
    }
    data.params = data.params
      .map((item) => {
        const type = Object.prototype.toString.call(item);
        // messageDecorator only deal with string, if want to support other type, please transform to stringg
        if (type !== '[object String]') {
          return type;
        }
        return item;
      });
    const paramsString = data.params
      .join(' ');
    data.message = `${data.sessionIndex} ${message} ${paramsString}`;
    data.size = data.message.length;
    return data;
  }

  private _formatTime(logEntity: LogEntity): string {
    return this.dateFormatter.formatDate(new Date(logEntity.timestamp), DATE_FORMATTER.DEFAULT_DATE_FORMAT);
  }
}
