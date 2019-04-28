/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 15:22:24
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseResponse, HTTP_STATUS_CODE, NETWORK_FAIL_TEXT } from 'foundation';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { JError, JNetworkError, ERROR_CODES_NETWORK } from '../../error';
import { IResponseParser } from './types';

const REGEXP_4XX_5XX = /^[4-5]\d\d$/;

export class CommonResponseParser implements IResponseParser {
  name = 'CommonResponseParser';

  parse(response: BaseResponse): JError | null {
    const { status, statusText } = response;
    return (
      this._parseByStatusText(statusText) ||
      this._parseByStatus(status, statusText)
    );
  }

  private _parseByStatusText(statusText: string) {
    switch (statusText) {
      case 'Network Error':
        return new JNetworkError(
          ERROR_CODES_NETWORK.NETWORK_ERROR,
          'Api Error: Please check whether server crash',
        );
      case NETWORK_FAIL_TEXT.NOT_NETWORK_CONNECTION:
        return new JNetworkError(
          ERROR_CODES_NETWORK.NOT_NETWORK,
          'Api Error: Please check network connection',
        );
      default:
        return null;
    }
  }

  private _parseByStatus(status: HTTP_STATUS_CODE, statusText: string) {
    if (
      (isNumber(status) && 399 < status && 600 > status) ||
      (isString(status) && REGEXP_4XX_5XX.test(status))
    ) {
      return new JNetworkError(`HTTP_${status}`, statusText);
    }
    return null;
  }

  static genBaseNetworkError(status: number, statusText: string) {
    /**
     * Default Api error
     */
    return new JNetworkError(
      ERROR_CODES_NETWORK.GENERAL,
      'Api Error: Unknown error.',
    );
  }
}
