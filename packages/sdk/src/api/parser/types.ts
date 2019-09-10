import { BaseResponse } from 'foundation/network';
import { JError, JNetworkError, ERROR_CODES_NETWORK } from '../../error';

interface IResponseParser {
  readonly name: string;
  parse(response: BaseResponse): JError | null;
}

export class ResponseParser implements IResponseParser {
  readonly name = 'ResponseParser';
  private _parsers: IResponseParser[] = [];

  register(parser: IResponseParser) {
    if (this._parsers.some(item => item.name === parser.name)) {
      this._parsers = this._parsers.filter(item => item.name !== parser.name);
    }
    this._parsers.push(parser);
  }

  parse(response: BaseResponse): JError {
    let result;
    for (const parser of this._parsers) {
      result = parser.parse(response);
      if (result) return result;
    }
    return new JNetworkError(ERROR_CODES_NETWORK.GENERAL, response.statusText);
  }
}

export { IResponseParser };
