import ErrorParser from '../parser';
import Dexie from 'dexie/dist/dexie';

import { Response, NetworkResponseBuilder } from 'foundation';
console.log('NetworkResponseBuilder: ', NetworkResponseBuilder);
it('should ', () => {
  expect(NetworkResponseBuilder).toBe(1);
});
const DEXIE_ERROR_CODE = 2000;
const HTTP_BASE_CODE = 1000;

function createResponse(obj: any) {
  const builder = new NetworkResponseBuilder();
  Object.assign(builder, obj);
  return new Response(builder);
}

describe('ErrorParser', () => {
  it('ErrorParser parse/dexie/http', () => {
    const dexieError: any = new Dexie.DexieError();
    expect(ErrorParser.parse(dexieError).code).toBe(DEXIE_ERROR_CODE);

    const httpError: Response = createResponse({ status: 200, data: { error: { message: '' } } });
    expect(ErrorParser.parse(httpError).code).toBe(HTTP_BASE_CODE + httpError.status);

    const commonError: Response = createResponse({
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
