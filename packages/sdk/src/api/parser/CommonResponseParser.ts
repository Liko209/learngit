
import { BaseResponse } from 'foundation';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { JError, JNetworkError, ERROR_CODES_NETWORK } from '../../error';
import { IResponseParser } from './types';

export class CommonResponseParser implements IResponseParser {

  name = 'CommonResponseParser';

  parse(response: BaseResponse): JError | null {
    const { status, statusText } = response;
    /**
        * From resp.statusText
        */
    if (statusText === 'Network Error') {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NETWORK_ERROR,
        'Api Error: Please check whether server crash');
    }

    if (statusText === 'NOT NETWORK CONNECTION') {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NOT_NETWORK,
        'Api Error: Please check network connection');
    }

    /**
     * From resp.status
     */
    if ((isNumber(status) && 399 < status && 600 > status)
      || (isString(status) && /^[4-5]\d\d$/.test(status))) {
      return new JNetworkError(`HTTP_${status}`, statusText);
    }
    return null;
  }

  static genBaseNetworkError(status: number, statusText: string) {

    /**
     * Default Api error
     */
    return new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'Api Error: Unknown error.');
  }
}
