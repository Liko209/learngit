/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:56
 * Copyright © RingCentral. All rights reserved.
 */
import { DateFormatter } from '../../utils/DateFormatter';
import { LOG_LEVEL } from '../constants';
import { ILogEntityDecorator, LogEntity } from '../types';
import _ from 'lodash';

export class MessageDecorator implements ILogEntityDecorator {
  options: object;

  decorate(data: LogEntity): LogEntity {
    const {
      tags, message, level, timestamp, sessionIndex,
    } = data;
    if (!_.isEmpty(message)) return data;
    data.params = data.params.map((item: any) => {
      const type = Object.prototype.toString.call(item);
      if (type !== '[object String]') {
        return type;
      }
      return item;
    });
    const paramsString = data.params.join(' ');
    data.message = `TAGS: ${tags.join(',')} LEVEL: ${
      LOG_LEVEL[level]
    } INDEX: ${sessionIndex} TIME: ${this._formatTime(
      timestamp,
    )} MESSAGE: ${paramsString}`;
    data.size = paramsString.length;
    return data;
  }

  private _formatTime(timestamp: number): string {
    return DateFormatter.formatDate(new Date(timestamp));
  }
}
