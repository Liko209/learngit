import { HttpResponse, HttpResponseBuilder } from 'foundation';

import ErrorParser from '../parser';
import { DBCriticalError } from '../../../dao/errors/handler';
import { ErrorTypes } from '..';

const DB_CRITICAL_ERROR = 2001;
const HTTP_BASE_CODE = 1000;

function createResponse(obj: any) {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('ErrorParser', () => {
  describe('parse()', () => {
    it('should parse dexie error', () => {
      const dexieError: DBCriticalError = new DBCriticalError();
      expect(ErrorParser.parse(dexieError).code).toBe(DB_CRITICAL_ERROR);
    });

    it('should parse when response.data.error is object', () => {
      const response: HttpResponse = createResponse({
        status: 200,
        data: { error: { code: 'invalid_field', message: 'Invalid field' } },
      });

      const error = ErrorParser.parse(response);

      expect(error.code).toBe(ErrorTypes.API_INVALID_FIELD);
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

      expect(error.code).toBe(ErrorTypes.API_INVALID_GRANT);
    });

    it('should return UNDEFINED_ERROR when then input can not be parse', () => {
      const obj = {
        message: 'baseError',
      };

      const error = ErrorParser.parse(obj);

      expect(error.code).toBe(ErrorTypes.UNDEFINED_ERROR);
    });
  });
});
