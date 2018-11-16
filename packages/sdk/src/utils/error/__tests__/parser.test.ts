import { HttpResponse, HttpResponseBuilder } from 'foundation';

import ErrorParser from '../parser';
import { DBCriticalError } from '../../../dao/errors/handler';

const DB_CRITICAL_ERROR = 2001;
const HTTP_BASE_CODE = 1000;

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('ErrorParser', () => {
  it('ErrorParser parse/dexie/http', () => {
    const dexieError: any = new DBCriticalError();
    expect(ErrorParser.parse(dexieError).code).toBe(DB_CRITICAL_ERROR);

    const httpError: HttpResponse = createResponse({
      status: 200,
      data: { error: { message: '' } },
    });
    expect(ErrorParser.parse(httpError)).toEqual({
      data: { error: { message: '' } },
      headers: {},
      request: undefined,
      retryAfter: 6000,
      status: 200,
      statusText: '',
    });

    const commonError: HttpResponse = createResponse({
      status: 400,
      data: {
        error: 'invalid_grant',
        error_description: 'xxxx',
      },
    });

    expect(ErrorParser.parse(commonError).code).toBe(4147);

    const baseError = {
      message: 'baseError',
    };

    expect(ErrorParser.parse(baseError).code).toBe(0);
  });
});
