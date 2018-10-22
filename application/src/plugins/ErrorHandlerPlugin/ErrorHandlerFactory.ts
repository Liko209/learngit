/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:08:30
 * Copyright © RingCentral. All rights reserved.
 */
import { ERROR_HANDLER } from './constants';
import { AlertErrorHandler } from './handlers';
import { IErrorHandler } from './IErrorHandler';

class ErrorHandlerFactory {
  build(type: ERROR_HANDLER): IErrorHandler | null {
    switch (type) {
      case ERROR_HANDLER.ALERT:
        return new AlertErrorHandler();
      default:
        return null;
    }
  }
}

export { ErrorHandlerFactory };
