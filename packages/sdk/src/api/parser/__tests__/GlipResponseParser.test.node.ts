import { GlipResponseParser } from '../GlipResponseParser';
import { HttpResponse, HttpResponseBuilder } from 'foundation/network';

import { JServerError, ERROR_CODES_SERVER } from '../../../error';

function createResponse(obj: any): HttpResponse {
  const builder = new HttpResponseBuilder().setRequest({
    handlerType: {
      name: 'GLIP',
    },
  });
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('GlipResponseParser', () => {
  describe('parse', () => {
    it('should identify INVALID_FIELD Error', () => {
      const parser = new GlipResponseParser();
      const response: HttpResponse = createResponse({
        status: 200,
        data: { error: { code: 'invalid_field', message: 'Invalid field' } },
      });
      expect(parser.parse(response)).toEqual(
        new JServerError(
          ERROR_CODES_SERVER.INVALID_FIELD,
          response.data.error.message,
        ),
      );
    });
    it('should identify INVALID_GRANT Error', () => {
      const parser = new GlipResponseParser();
      const response: HttpResponse = createResponse({
        status: 400,
        data: {
          error: 'invalid_grant',
          error_description: 'xxxx',
        },
      });
      expect(parser.parse(response)).toEqual(
        new JServerError(
          ERROR_CODES_SERVER.INVALID_GRANT,
          response.data.error_description,
        ),
      );
    });
    it('should identify NOT_AUTHORIZED error', () => {
      const parser = new GlipResponseParser();
      const response: HttpResponse = createResponse({
        status: 403,
        data: { error: { code: 'not_authorized', message: 'not_authorized' } },
      });
      expect(parser.parse(response)).toEqual(
        new JServerError(
          ERROR_CODES_SERVER.NOT_AUTHORIZED,
          response.data.error.message,
        ),
      );
    });
    it('should return null when handle type is rc', () => {
      const parser = new GlipResponseParser();
      const response: HttpResponse = createResponse({
        status: 403,
        data: { error: { code: 'not_authorized', message: 'not_authorized' } },
      });
      response.request.handlerType.name = 'RINGCENTRAL';
      expect(parser.parse(response)).toEqual(null);
    });
  });
});
