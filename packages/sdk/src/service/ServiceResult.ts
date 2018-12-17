import { BaseError, ResultOk, ResultErr } from 'foundation';

type RawErrors = { apiError?: BaseError; dbError?: BaseError };

class ServiceResultOk<T, E extends BaseError = BaseError> extends ResultOk<
  T,
  E
> {}

class ServiceResultErr<T, E extends BaseError = BaseError> extends ResultErr<
  T,
  E
> {
  readonly apiError?: BaseError;
  readonly dbError?: BaseError;

  constructor(error: E, { apiError, dbError }: RawErrors = {}) {
    super(error);
    this.apiError = apiError;
    this.dbError = dbError;
  }
}

type ServiceResult<T, E extends BaseError = BaseError> =
  | ServiceResultOk<T, E>
  | ServiceResultErr<T, E>;

function serviceOk<T>(data: T) {
  return new ServiceResultOk(data);
}

function serviceErr<E extends BaseError = BaseError>(
  type: number,
  message?: string,
  rawErrors: RawErrors = {},
): ServiceResultErr<any, E> {
  const prefix = 'ServiceError: ';
  const errorMessage = message || 'Common service error.';
  const error = new BaseError(type, `${prefix}${errorMessage}`);
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
