import { ResponseParser } from '../types';
import { HttpResponse, HttpResponseBuilder } from 'foundation/network';
import { JNetworkError, ERROR_CODES_NETWORK } from 'foundation/error';

function createResponse(obj: any): HttpResponse {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('ResponseParser', () => {
  describe('parse', () => {
    it('should return GENERAL networkError', () => {
      const parser = new ResponseParser();
      expect(
        parser.parse(
          createResponse({
            status: 666,
            statusText: 'some error',
          }),
        ),
      ).toEqual(new JNetworkError(ERROR_CODES_NETWORK.GENERAL, 'some error'));
    });
  });
});
