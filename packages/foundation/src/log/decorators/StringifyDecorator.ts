/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';

export class StringifyDecorator implements ILogEntityDecorator {
  options: object;
  constructor() {}

  decorate(data: LogEntity): LogEntity {
    data.params = data.params.map((item: any) => {
      const type = Object.prototype.toString.call(item);
      if (type !== '[object String]') {
        try {
          return JSON.stringify(item);
        } catch {
          return type;
        }
      }
      return item;
    });
    return data;
  }
}
