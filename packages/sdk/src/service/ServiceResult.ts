import { JError, ResultOk, ResultErr } from 'foundation';
import { JSdkError } from '../error';

type RawErrors = { apiError?: JError; dbError?: JError };

class ServiceResultOk<T, E extends JError = JError> extends ResultOk<
  T,
  E
  > { }

class ServiceResultErr<T, E extends JError = JError> extends ResultErr<
  T,
  E
  > {
  readonly apiError?: JError;
  readonly dbError?: JError;

  constructor(error: E, { apiError, dbError }: RawErrors = {}) {
    super(error);
    this.apiError = apiError;
    this.dbError = dbError;
  }
}

type ServiceResult<T, E extends JError = JError> =
  | ServiceResultOk<T, E>
  | ServiceResultErr<T, E>;

function serviceOk<T>(data: T) {
  return new ServiceResultOk(data);
}

function serviceErr<E extends JError = JError>(
  code: string,
  message?: string,
  rawErrors: RawErrors = {},
): ServiceResultErr<any, E> {
  const prefix = 'ServiceError: ';
  const errorMessage = message || 'Common service error.';
  const error = new JSdkError(code, `${prefix}${errorMessage}`);
  return new ServiceResultErr(error as E, rawErrors);
}

export {
  ServiceResult,
  ServiceResultOk,
  ServiceResultErr,
  RawErrors,
  serviceOk,
  serviceErr,
};
