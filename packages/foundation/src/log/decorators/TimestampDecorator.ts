/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';

export class TimestampDecorator implements ILogEntityDecorator {
  options: object;
  decorate(data: LogEntity): LogEntity {
    data.timestamp = Date.now();
    return data;
  }
}
