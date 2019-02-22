/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:22:01
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';

export class TruncationDecorator implements ILogEntityDecorator {
  options: { limit: number };

  decorate(data: LogEntity): LogEntity {
    if (!this.options || !this.options.limit) return data;
    if (data.params.length) {
      data.params = data.params.map((param: string) => {
        if (Object.prototype.toString.call(param) === '[object String]') {
          if (param.length > this.options.limit) {
            return JSON.stringify({
              truncation: param.substring(0, this.options.limit),
            });
          }
        }
        return param;
      });
    }
    return data;
  }
}
