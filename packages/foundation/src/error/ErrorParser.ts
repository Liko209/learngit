/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ERROR_TYPES } from './types';
import { AbstractErrorParser } from './AbstractErrorParser';
import { JError } from './JError';

export class ErrorParser extends AbstractErrorParser {
  private _errorParser: AbstractErrorParser[] = [];

  constructor() {
    super('ErrorParser');
  }

  register(parser: AbstractErrorParser) {
    if (this._errorParser.some(item => item.getName() === parser.getName())) {
      console.info(`errorParser ${parser.getName()} replaced`);
      this._errorParser = this._errorParser.filter(item => item.getName() !== parser.getName());
    }
    this._errorParser.push(parser);
  }

  parse(error: Error): JError {
    if (error instanceof JError) return error;
    let result;
    for (const parser of this._errorParser) {
      result = parser.parse(error);
      if (result) return result;
    }
    return new JError(ERROR_TYPES.UNDEFINED, '', error.message);
  }

}
