import { HttpResponse, HttpResponseBuilder } from 'foundation';

import ErrorParser from '../parser';
import { DBCriticalError } from '../../../dao/errors/handler';
import { ERROR_CODES_SERVER, ERROR_TYPES, ERROR_CODES_DB } from '../../../error';

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('ErrorParser', () => {
  describe('parse()', () => {
    it('should parse dexie error', () => {
      const dexieError: DBCriticalError = new DBCriticalError();
      expect(ErrorParser.parse(dexieError).code).toBe(ERROR_CODES_DB.CRITICAL_ERROR);
    });

    it('should parse when response.data.error is object', () => {
      const response: HttpResponse = createResponse({
        status: 200,
        data: { error: { code: 'invalid_field', message: 'Invalid field' } },
      });

      const error = ErrorParser.parse(response);

      expect(error.type === ERROR_TYPES.SERVER).toBeTruthy();
      expect(error.code).toBe(ERROR_CODES_SERVER.INVALID_FIELD);
    });

    it('should parse when response.data.error is string', () => {
      const response: HttpResponse = createResponse({
        status: 400,
        data: {
          error: 'invalid_grant',
          error_description: 'xxxx',
        },
      });

      const error = ErrorParser.parse(response);
      expect(error.type === ERROR_TYPES.SERVER).toBeTruthy();
      expect(error.code).toBe(ERROR_CODES_SERVER.INVALID_GRANT);
    });

    it('should return UNDEFINED_ERROR when then input can not be parse', () => {
      const obj = {
        message: 'baseError',
      };

      const error = ErrorParser.parse(obj);

      expect(error.type).toBe(ERROR_TYPES.UNDEFINED);
    });
  });
});
