/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-21 22:06:19
 * Copyright © RingCentral. All rights reserved.
 */

import { BaseResponse, mainLogger } from 'foundation';
import { JError, JRCError } from '../../error';
import { IResponseParser } from './types';

type ErrorInfo = {
  errorCode: string;
  errorMessage: string;
};

export class RCResponseParser implements IResponseParser {
  name: 'RCResponseParser';
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
          errors.some((error: any) => {
            return this.extractErrorInfo(errorInfo, error);
          });
        } else {
          this.extractErrorInfo(errorInfo, errors);
        }
      }

      if (
        errorInfo.errorCode !== '' ||
        this.extractErrorInfo(errorInfo, data)
      ) {
        return new JRCError(errorInfo.errorCode, errorInfo.errorMessage);
      }
    }
    mainLogger.tags(this.name).info(`can not parse RC response: ${response}`);
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
}
