import { HttpResponse, HttpResponseBuilder } from 'foundation';
import Dexie from 'dexie/dist/dexie';

import ErrorParser from '../parser';

const DEXIE_ERROR_CODE = 2000;
const HTTP_BASE_CODE = 1000;

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('ErrorParser', () => {
  it('ErrorParser parse/dexie/http', () => {
    const dexieError: any = new Dexie.DexieError();
    expect(ErrorParser.parse(dexieError).code).toBe(DEXIE_ERROR_CODE);

    const httpError: HttpResponse = createResponse({
      status: 200,
      data: { error: { message: '' } },
    });
    expect(ErrorParser.parse(httpError).code).toBe(HTTP_BASE_CODE + httpError.status);

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
