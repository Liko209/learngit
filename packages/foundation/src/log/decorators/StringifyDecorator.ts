/*
 * @Author: Paynter Chen
 * @Date: 2018-12-26 15:21:59
 * Copyright © RingCentral. All rights reserved.
 */
import { ILogEntityDecorator, LogEntity } from '../types';
import { stringifyParams } from '../utils';
export class StringifyDecorator implements ILogEntityDecorator {
  options: object;
  constructor() {
  }

  decorate(data: LogEntity): LogEntity {
    data.params = stringifyParams(...data.params);
    return data;
  }
}
