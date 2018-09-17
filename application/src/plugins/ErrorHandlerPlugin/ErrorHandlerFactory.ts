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
