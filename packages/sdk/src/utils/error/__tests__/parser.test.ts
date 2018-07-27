import ErrorParser from '../parser';
import Dexie from 'dexie/dist/dexie';

const DEXIE_ERROR_CODE = 2000;
const HTTP_BASE_CODE = 1000;

describe('ErrorParser', () => {
  it('ErrorParser parse/dexie/http', () => {
    let dexieError: any = new Dexie.DexieError();
    expect(ErrorParser.parse(dexieError).code).toBe(DEXIE_ERROR_CODE);

    let httpError: any = {
      response: {
        status: 200
      }
    };
    expect(ErrorParser.parse(httpError).code).toBe(HTTP_BASE_CODE + httpError.response.status);

    let commonError: any = {
      error: {},
      error_description: 'xxxx'
    };

    expect(ErrorParser.parse(commonError).code).toBe(0);

    let baseError = {
      message: 'baseError'
    };

    expect(ErrorParser.parse(baseError).code).toBe(0);
  });
});
