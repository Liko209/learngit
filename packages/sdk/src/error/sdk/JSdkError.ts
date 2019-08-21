import { JError } from 'foundation/error';
import { ERROR_TYPES } from '../types';

export class JSdkError extends JError {
  constructor(
    code: string,
    message: string,
    payload?: { [key: string]: string },
  ) {
    super(ERROR_TYPES.SDK, code, message, payload);
  }
}
