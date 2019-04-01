/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 16:23:34
 * Copyright © RingCentral. All rights reserved.
 */
import * as Sentry from '@sentry/browser';
import { SentryErrorReporter } from '../SentryErrorReporter';
jest.mock('@sentry/browser', () => {
  const mock = {
    init: jest.fn(),
    configureScope: jest.fn(),
    captureException: jest.fn(),
  };
  return mock;
});
describe('SentryErrorReporter', () => {
  describe('init()', () => {
    it('should config Sentry', async () => {
      const errorReporter = new SentryErrorReporter();
      await errorReporter.init();
      expect(Sentry.init).toBeCalled();
    });
  });
  describe('report()', () => {
    it('should call Sentry.captureException()', async () => {
      const errorReporter = new SentryErrorReporter();
      await errorReporter.init();
      const mockError = new Error('dddd');
      errorReporter.report(mockError);
      expect(Sentry.captureException).toBeCalledWith(mockError);
    });
  });
  describe('setUser()', () => {
    it('should call Sentry.setUserContext()', async () => {
      const errorReporter = new SentryErrorReporter();
      const mockUser = {
        id: 111,
        companyId: 333,
        email: 'xx',
      };
      await errorReporter.setUser(mockUser);
      expect(Sentry.configureScope).toBeCalled();
    });
  });
});
