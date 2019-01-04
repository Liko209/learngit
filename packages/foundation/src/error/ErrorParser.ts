/*
 * @Author: Paynter Chen
 * @Date: 2019-01-04 10:54:00
 * Copyright © RingCentral. All rights reserved.
 */
import { IErrorParser, JError, ERROR_TYPES } from './types';

export class ErrorParser implements IErrorParser {
  readonly name = 'ErrorParser';
  private _errorParser: IErrorParser[] = [];

  register(parser: IErrorParser) {
    if (this._errorParser.some(item => item.name === parser.name)) {
      console.info(`errorParser ${parser.name} replaced`);
      this._errorParser = this._errorParser.filter(item => item.name !== parser.name);
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
