/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 13:09:52
 * Copyright © RingCentral. All rights reserved.
 */
import { JError } from './JError';

export abstract class AbstractErrorParser {
  constructor(private _name: string) {
    this._name = _name;
  }
  getName() {
    return this._name;
  }
  abstract parse(error: Error): JError | null;
}
