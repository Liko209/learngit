/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 16:23:34
 * Copyright © RingCentral. All rights reserved.
 */
import * as Raven from 'raven-js';
import { RavenErrorReporter } from '../RavenErrorReporter';
jest.mock('raven-js', () => {
  const mock = {
    config: jest.fn().mockImplementation(() => {
      return {
        install: () => {},
      };
    }),
    setUserContext: jest.fn(),
    captureException: jest.fn(),
  };
  return mock;
});
describe('RavenErrorReporter', () => {
  describe('init()', () => {
    it('should config Raven', async () => {
      const errorReporter = new RavenErrorReporter();
      await errorReporter.init();
      expect(Raven.config).toBeCalled();
    });
  });
  describe('report()', () => {
    it('should call Raven.captureException()', async () => {
      const errorReporter = new RavenErrorReporter();
      await errorReporter.init();
      const mockError = new Error('dddd');
      errorReporter.report(mockError);
      expect(Raven.captureException).toBeCalledWith(mockError);
    });
  });
  describe('setUser()', () => {
    it('should call Raven.setUserContext()', async () => {
      const errorReporter = new RavenErrorReporter();
      const mockContextInfo = {
        id: 111,
        username: 'mm',
        companyId: 333,
        email: 'xx',
        env: 'xm-up',
        version: '1.0.0',
      };
      await errorReporter.setUserContextInfo(mockContextInfo);
      expect(Raven.setUserContext).toBeCalledWith(mockContextInfo);
    });
  });
});
