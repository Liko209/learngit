/*
 * @Author: Paynter Chen
 * @Date: 2019-03-21 16:23:34
 * Copyright © RingCentral. All rights reserved.
 */
import { SentryErrorReporter } from '../SentryErrorReporter';
import { ErrorReporterProxy } from '../ErrorReporterProxy';
jest.mock('../SentryErrorReporter', () => {
  const mock: SentryErrorReporter = {
    init: jest.fn().mockImplementation(() => Promise.resolve()),
    report: jest.fn(),
    setUser: jest.fn(),
  };
  return {
    SentryErrorReporter: () => mock,
  };
});
describe('ErrorReporterProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('constructor()', () => {
    it('should create Raven instance', () => {
      const mockErrorReporter = new SentryErrorReporter();
      const proxy = new ErrorReporterProxy(true);
      expect(mockErrorReporter.init).toBeCalled();
      expect(proxy['_reporter']).not.toBeUndefined();
    });
  });
  describe('directly call', () => {
    it('should call function directly when is init', (done: jest.DoneCallback) => {
      const mockErrorReporter = new SentryErrorReporter();
      const mockUser = {
        id: 111,
        companyId: 222,
        email: 'xx',
      };
      const mockError = new Error('ddd');
      const proxy = new ErrorReporterProxy(true);
      expect(proxy['_isInit']).toBeFalsy();
      expect(mockErrorReporter.init).toBeCalled();
      expect(mockErrorReporter.setUser).not.toBeCalled();
      expect(mockErrorReporter.report).not.toBeCalled();
      setTimeout(() => {
        expect(proxy['_isInit']).toBeTruthy();
        proxy.setUser(mockUser);
        proxy.report(mockError);
        expect(mockErrorReporter.setUser).toBeCalledWith(mockUser);
        expect(mockErrorReporter.report).toBeCalledWith(mockError);
        done();
      });
    });
  });
  describe('proxy()', () => {
    it('should call function after init', (done: jest.DoneCallback) => {
      const mockErrorReporter = new SentryErrorReporter();
      const mockUser = {
        id: 111,
        companyId: 222,
        email: 'xx',
      };
      const mockError = new Error('ddd');
      const proxy = new ErrorReporterProxy(true);
      proxy.setUser(mockUser);
      proxy.report(mockError);
      expect(proxy['_isInit']).toBeFalsy();
      expect(mockErrorReporter.init).toBeCalled();
      expect(mockErrorReporter.setUser).not.toBeCalled();
      expect(mockErrorReporter.report).not.toBeCalled();
      setTimeout(() => {
        expect(proxy['_isInit']).toBeTruthy();
        expect(mockErrorReporter.setUser).toBeCalledWith(mockUser);
        expect(mockErrorReporter.report).toBeCalledWith(mockError);
        done();
      });
    });
  });
});
