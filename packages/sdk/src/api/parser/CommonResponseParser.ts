/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 15:22:24
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseResponse, RESPONSE_STATUS_CODE } from 'foundation/network';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { JError, JNetworkError, ERROR_CODES_NETWORK } from '../../error';
import { IResponseParser } from './types';

const REGEXP_4XX_5XX = /^[4-5]\d\d$/;

export class CommonResponseParser implements IResponseParser {
  name = 'CommonResponseParser';

  parse(response: BaseResponse): JError | null {
    const { status, statusText } = response;
    return this._parseByStatus(status, statusText);
  }

  private _parseByStatus(status: RESPONSE_STATUS_CODE, statusText: string) {
    if (status === RESPONSE_STATUS_CODE.NETWORK_ERROR) {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NETWORK_ERROR,
        'Api Error: Please check whether server crash',
      );
    }
    if (status === RESPONSE_STATUS_CODE.LOCAL_NOT_NETWORK_CONNECTION) {
      return new JNetworkError(
        ERROR_CODES_NETWORK.NOT_NETWORK,
        'Api Error: Please check network connection',
      );
    }
    if (status === RESPONSE_STATUS_CODE.LOCAL_TIME_OUT) {
      return new JNetworkError(
        ERROR_CODES_NETWORK.LOCAL_TIMEOUT,
        'Api Error: Please check local network crash',
      );
    }
    if (
      (isNumber(status) && status > 399 && status < 600) ||
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
      `Api Error: Unknown error. status: ${status}, statusText: ${statusText}`,
    );
  }
}
