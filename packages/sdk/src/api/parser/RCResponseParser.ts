/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 22:06:19
 * Copyright © RingCentral. All rights reserved.
 */

import { mainLogger } from 'foundation/log';
import { BaseResponse } from 'foundation/network';
import { JError, JRCError, ERROR_CODES_RC } from '../../error';
import { IResponseParser } from './types';

type ErrorInfo = {
  errorCode: string;
  errorMessage: string;
};

export class RCResponseParser implements IResponseParser {
  name = 'RCResponseParser';
  parse(response: BaseResponse): JError | null {
    const { data } = response;
    /**
     * From resp.data
     * parse rc server error info
     */

    const errorInfo: ErrorInfo = { errorCode: '', errorMessage: '' };
    if (data) {
      const errors = data.errors;
      if (errors) {
        if (Array.isArray(errors)) {
          errors.some((error: any) => this.extractErrorInfo(errorInfo, error));
        } else {
          this.extractErrorInfo(errorInfo, errors);
        }
      }

      if (
        (errorInfo.errorCode !== '' ||
          this.extractErrorInfo(errorInfo, data)) &&
        this.isKnownError(errorInfo)
      ) {
        return new JRCError(errorInfo.errorCode, errorInfo.errorMessage);
      }
    }
    mainLogger.tags(this.name).info(`can not parse RC response: ${JSON.stringify(response)}`);
    return null;
  }

  extractErrorInfo(response: ErrorInfo, data: any): boolean {
    if (typeof data.errorCode === 'string' && data.errorCode !== '') {
      response.errorCode = data.errorCode.toUpperCase();
      response.errorMessage = data.message || '';
      return true;
    }
    return false;
  }

  isKnownError(errorInfo: ErrorInfo): boolean {
    return Object.values(ERROR_CODES_RC).some(
      (code: string) => errorInfo.errorCode === code,
    );
  }
}
