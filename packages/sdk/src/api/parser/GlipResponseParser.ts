/*
 * @Author: Paynter Chen
 * @Date: 2019-01-08 15:22:27
 * Copyright © RingCentral. All rights reserved.
 */
import { BaseResponse } from 'foundation';
import { JError, JServerError, ERROR_CODES_SERVER } from '../../error';
import { IResponseParser } from './types';

export class GlipResponseParser implements IResponseParser {
  name: 'GlipResponseParser';
  parse(response: BaseResponse): JError | null {
    const { data } = response;
    /**
     * From resp.data
     * parse server error info
     */
    if (data && data.error) {
      let httpErrorCode: string = '';
      let httpErrorMessage: string = '';

      if (typeof data.error === 'string') {
        httpErrorCode = data.error;
        httpErrorMessage = data.error_description;
      } else if (
        typeof data.error === 'object' &&
        typeof data.error.code === 'string'
      ) {
        httpErrorCode = data.error.code;
        httpErrorMessage = data.error.message;
      }

      if (!httpErrorCode) {
        return null;
      }

      if (ERROR_CODES_SERVER[httpErrorCode.toUpperCase()]) {
        return new JServerError(httpErrorCode.toUpperCase(), httpErrorMessage);
      }
    }
    return null;
  }

}
