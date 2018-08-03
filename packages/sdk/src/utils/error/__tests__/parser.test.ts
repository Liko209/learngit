import ErrorParser from '../parser';
import Dexie from 'dexie/dist/dexie';

import { Response } from 'foundation';
import NetworkResponseBuilder from 'foundation/network/client/http/NetworkResponseBuilder';

const DEXIE_ERROR_CODE = 2000;
const HTTP_BASE_CODE = 1000;

function createResponse(obj: any) {
  const builder = new NetworkResponseBuilder();
  Object.assign(builder, obj);
  return new Response(builder);
}

describe('ErrorParser', () => {
  it('ErrorParser parse/dexie/http', () => {
    let dexieError: any = new Dexie.DexieError();
    expect(ErrorParser.parse(dexieError).code).toBe(DEXIE_ERROR_CODE);

    let httpError: Response = createResponse({ status: 200, data: { error: { message: '' }}});
    expect(ErrorParser.parse(httpError).code).toBe(HTTP_BASE_CODE + httpError.status);

    let commonError: Response = createResponse({
      status: 400,
      data: {
        error: 'invalid_grant',
        error_description: 'xxxx'
      }
    });

    expect(ErrorParser.parse(commonError).code).toBe(4147);

    let baseError = {
      message: 'baseError'
    };

    expect(ErrorParser.parse(baseError).code).toBe(0);
  });
});
