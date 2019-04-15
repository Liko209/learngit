/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ERROR_TYPES } from './types';
import { IErrorParser } from './IErrorParser';
import { JError } from './JError';

export class ErrorParser implements IErrorParser {
  private _errorParser: IErrorParser[] = [];

  getName() {
    return 'ErrorParser';
  }

  register(parser: IErrorParser) {
    if (this._errorParser.some(item => item.getName() === parser.getName())) {
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
