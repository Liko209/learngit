import { UIError } from '../UIError';
import { IErrorHandler } from '../IErrorHandler';

class AlertErrorHandler implements IErrorHandler {
  handle(err: UIError) {
    alert(err.message);
  }
}

export { UIError, AlertErrorHandler };
