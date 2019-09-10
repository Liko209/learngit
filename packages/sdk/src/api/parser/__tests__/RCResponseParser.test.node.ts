/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-05-22 00:56:25
 * Copyright © RingCentral. All rights reserved.
 */

import { RCResponseParser } from '../RCResponseParser';
import { HttpResponse, HttpResponseBuilder } from 'foundation/network';
import { JRCError, ERROR_CODES_RC } from '../../../error';

function createResponse(obj: any): HttpResponse {
  const builder = new HttpResponseBuilder();
  Object.assign(builder, obj);
  return new HttpResponse(builder);
}

describe('RCResponseParser', () => {
  let parser: RCResponseParser;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    parser = new RCResponseParser();
  });

  describe('parse', () => {
    it('should identify error in data.errors[]', () => {
      const response: HttpResponse = createResponse({
        data: { errors: [{ errorCode: 'CLG-101', message: 'mock Invalid' }] },
      });
      expect(parser.parse(response)).toEqual(
        new JRCError(ERROR_CODES_RC.CLG_101, response.data.errors[0].message),
      );
    });

    it('should identify error in data.errors', () => {
      const response: HttpResponse = createResponse({
        data: { errors: { errorCode: 'CLG-101', message: 'mock Invalid' } },
      });
      expect(parser.parse(response)).toEqual(
        new JRCError(ERROR_CODES_RC.CLG_101, response.data.errors.message),
      );
    });

    it('should identify error in data', () => {
      const response: HttpResponse = createResponse({
        data: { errorCode: 'CLG-101', message: 'mock Invalid' },
      });
      expect(parser.parse(response)).toEqual(
        new JRCError(ERROR_CODES_RC.CLG_101, response.data.message),
      );
    });

    it('should return null when can not identify error', () => {
      const response: HttpResponse = createResponse({
        data: {},
      });
      expect(parser.parse(response)).toEqual(null);
    });

    it('should return null when error is not in error list', () => {
      const response: HttpResponse = createResponse({
        data: { errorCode: 'CLG-1019', message: 'mock Invalid' },
      });
      expect(parser.parse(response)).toEqual(null);
    });
  });
});
