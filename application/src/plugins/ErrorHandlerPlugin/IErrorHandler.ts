import { IViewModel } from '@/base';
import { UIError } from './UIError';

interface IErrorHandler {
  handle(err: UIError, vm: IViewModel): void;
}

export { IErrorHandler };
