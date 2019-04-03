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
    setUserContextInfo: jest.fn(),
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
      const mockContextInfo = {
        id: 111,
        username: 'mm',
        companyId: 222,
        email: 'xx',
        env: 'xm-up',
        version: '1.0.0',
      };
      const mockError = new Error('ddd');
      const proxy = new ErrorReporterProxy(true);
      expect(proxy['_isInit']).toBeFalsy();
      expect(mockErrorReporter.init).toBeCalled();
      expect(mockErrorReporter.setUserContextInfo).not.toBeCalled();
      expect(mockErrorReporter.report).not.toBeCalled();
      setTimeout(() => {
        expect(proxy['_isInit']).toBeTruthy();
        proxy.setUserContextInfo(mockContextInfo);
        proxy.report(mockError);
        expect(mockErrorReporter.setUserContextInfo).toBeCalledWith(
          mockContextInfo,
        );
        expect(mockErrorReporter.report).toBeCalledWith(mockError);
        done();
      });
    });
  });
  describe('proxy()', () => {
    it('should call function after init', (done: jest.DoneCallback) => {
      const mockErrorReporter = new SentryErrorReporter();
      const mockContextInfo = {
        id: 111,
        username: 'mm',
        companyId: 222,
        email: 'xx',
        env: 'xm-up',
        version: '1.0.0',
      };
      const mockError = new Error('ddd');
      const proxy = new ErrorReporterProxy(true);
      proxy.setUserContextInfo(mockContextInfo);
      proxy.report(mockError);
      expect(proxy['_isInit']).toBeFalsy();
      expect(mockErrorReporter.init).toBeCalled();
      expect(mockErrorReporter.setUserContextInfo).not.toBeCalled();
      expect(mockErrorReporter.report).not.toBeCalled();
      setTimeout(() => {
        expect(proxy['_isInit']).toBeTruthy();
        expect(mockErrorReporter.setUserContextInfo).toBeCalledWith(
          mockContextInfo,
        );
        expect(mockErrorReporter.report).toBeCalledWith(mockError);
        done();
      });
    });
  });
});
