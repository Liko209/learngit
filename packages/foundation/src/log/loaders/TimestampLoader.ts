/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:04
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogLoader, LogEntity } from '../types';

export class TimestampLoader implements ILogLoader {
  options: object;
  handle(data: LogEntity): LogEntity {
    data.timestamp = Date.now();
    return data;
  }
}
