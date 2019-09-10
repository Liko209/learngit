import { CommonResponseParser } from '../CommonResponseParser';
import {
  HttpResponse,
  HttpResponseBuilder,
  RESPONSE_STATUS_CODE,
} from 'foundation/network';
import { JNetworkError, ERROR_CODES_NETWORK } from 'foundation/error';

function createResponse(obj: any): HttpResponse {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('CommonResponseParser', () => {
  describe('parse()', () => {
    it('should identify Network Error', () => {
      const parser = new CommonResponseParser();
      expect(
        parser.parse(
          createResponse({
            status: RESPONSE_STATUS_CODE.NETWORK_ERROR,
            statusText: 'Network Error',
          }),
        ),
      ).toEqual(
        new JNetworkError(
          ERROR_CODES_NETWORK.NETWORK_ERROR,
          'Api Error: Please check whether server crash',
        ),
      );
    });

    it('should identify NOT NETWORK CONNECTION', () => {
      const parser = new CommonResponseParser();
      expect(
        parser.parse(
          createResponse({
            status: RESPONSE_STATUS_CODE.LOCAL_NOT_NETWORK_CONNECTION,
            statusText: 'NOT NETWORK CONNECTION',
          }),
        ),
      ).toEqual(
        new JNetworkError(
          ERROR_CODES_NETWORK.NOT_NETWORK,
          'Api Error: Please check network connection',
        ),
      );
    });

    it('should identify LOCAL TIME OUT', () => {
      const parser = new CommonResponseParser();
      expect(
        parser.parse(
          createResponse({
            status: RESPONSE_STATUS_CODE.LOCAL_TIME_OUT,
            statusText: 'LOCAL_TIMEOUT',
          }),
        ),
      ).toEqual(
        new JNetworkError(
          ERROR_CODES_NETWORK.LOCAL_TIMEOUT,
          'Api Error: Please check local network crash',
        ),
      );
    });
    it('should parse JNetworkError while status in [400, 599]', () => {
      const parser = new CommonResponseParser();
      let status = 400;
      do {
        expect(
          parser.parse(
            createResponse({
              status,
              statusText: `${status}_error`,
            }),
          ),
        ).toEqual(new JNetworkError(`HTTP_${status}`, `${status}_error`));
        status++;
      } while (status < 600);
    });

    it('should return null in other case', () => {
      const parser = new CommonResponseParser();
      expect(
        parser.parse(
          createResponse({
            status: 200,
            statusText: 'error',
          }),
        ),
      ).toBeNull();
      expect(
        parser.parse(
          createResponse({
            status: 304,
            statusText: 'error',
          }),
        ),
      ).toBeNull();
    });
  });
});
