
import { JError } from 'foundation/error';
import { ERROR_TYPES } from '../types';

export class JServerError extends JError {
  constructor(code: string, message: string, payload?: { [key: string]: string }) {
    super(ERROR_TYPES.SERVER, code, message, payload);
  }
}
