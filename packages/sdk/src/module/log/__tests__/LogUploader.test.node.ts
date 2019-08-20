import { LogUploader } from '../LogUploader';
import { LogEntity } from 'foundation/log';
import { AccountService } from '../../account';
import { Api } from 'sdk/api';
import axios, { AxiosError } from 'axios';
import { ServiceLoader } from '../../serviceLoader';
import { Pal } from '../../../pal/pal';
import { IApplicationInfo } from '../../../pal/applicationInfo';
import pako from 'pako';
import { getClientId, extractLogMessageLine } from '../utils';

jest.mock('pako', () => {
  return {
    deflate: jest.fn().mockImplementation(str => str),
  };
});
jest.mock('sdk/api');
jest.mock('../../../pal/pal', () => {
  const mockPal: Pal = {
    getApplicationInfo: jest.fn(),
    getErrorReporter: jest.fn(),
  };
  Object.defineProperty(mockPal, 'instance', {
    get: () => {
      return mockPal;
    },
  });
  return {
    Pal: mockPal,
  };
});
jest.mock('../../../module/account');
jest.mock('axios');
jest.mock('sdk/module/log/utils');

function createError(status: number): AxiosError {
  return (status
    ? {
        response: {
          status,
        },
      }
    : {}) as AxiosError;
}
describe('LogUploader', () => {
  const accountService = new AccountService();
  const mockAppInfo: IApplicationInfo = {
    appVersion: '1.0',
    os: 'mac',
    browser: 'chrome',
    platform: 'desktop',
    env: 'prod',
  };
  getClientId.mockReturnValue('mock-client-id');
  describe('upload()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
      Api.httpConfig = {
        sumologic: {
          server: 'url/',
          uniqueHttpCollectorCode: 'code',
        },
      };
      (axios.post as jest.Mock).mockResolvedValue({});
      ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
    });
    it('should call post correctly', async () => {
      (accountService.getCurrentUserInfo as jest.Mock).mockResolvedValue({
        id: 12345,
        email: 'abc@rc.com',
      });
      (Pal.instance.getApplicationInfo as jest.Mock).mockReturnValue(
        mockAppInfo,
      );
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      mockLog.sessionId = 'sessionA';
      pako.deflate.mockReturnValue('mm');
      await logUploader.upload([mockLog]);
      expect(axios.post).toHaveBeenCalledWith('url/code', 'mm', {
        headers: {
          'Content-Encoding': 'deflate',
          'X-Sumo-Name': `${mockAppInfo.platform}/${mockAppInfo.appVersion}/${
            mockAppInfo.browser
          }/${mockAppInfo.os}/${mockAppInfo.env}/abc@rc.com/12345/sessionA/${
            location.host
          }`,
          'Content-Type': 'application/json',
        },
      });
    });
    it('should call sendBeacon correctly in emergencyMode', async () => {
      (accountService.getCurrentUserInfo as jest.Mock).mockResolvedValue({
        id: 12345,
        email: 'abc@rc.com',
      });
      (Pal.instance.getApplicationInfo as jest.Mock).mockReturnValue(
        mockAppInfo,
      );
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      mockLog.sessionId = 'sessionA';
      pako.deflate.mockReturnValue('mm');
      jest.spyOn(window.navigator, 'sendBeacon').mockReturnValue(true);
      jest
        .spyOn(logUploader, '_combineAndCompressMessageWithLimit')
        .mockReturnValue(['a']);
      await logUploader.upload([mockLog], true);
      expect(axios.post).not.toHaveBeenCalled();
      expect(window.navigator.sendBeacon).toHaveBeenCalled();
    });
    it('should call post correctly when getCurrentUserInfo error', async () => {
      (accountService.getCurrentUserInfo as jest.Mock).mockRejectedValue('');
      (Pal.instance.getApplicationInfo as jest.Mock).mockReturnValue(
        mockAppInfo,
      );
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      mockLog.sessionId = 'sessionA';
      pako.deflate.mockReturnValue('mm');
      await logUploader.upload([mockLog]);
      expect(axios.post).toHaveBeenCalledWith('url/code', 'mm', {
        headers: {
          'Content-Encoding': 'deflate',
          'X-Sumo-Name': `${mockAppInfo.platform}/${mockAppInfo.appVersion}/${
            mockAppInfo.browser
          }/${mockAppInfo.os}/${mockAppInfo.env}/service@glip.com//sessionA/${
            location.host
          }`,
          'Content-Type': 'application/json',
        },
      });
    });
  });
  describe('_zipMessage()', () => {
    it('should transform message correctly', () => {
      const logUploader = new LogUploader();
      const mockLog1 = new LogEntity();
      mockLog1.message = 'a';
      const mockLog2 = new LogEntity();
      mockLog2.message = 'b';
      extractLogMessageLine.mockImplementation(log => `${log.message}\t\n`);
      const result = logUploader.transform([mockLog1, mockLog2]);
      expect(result).toEqual('a\t\nb\t\n');
    });
  });
  describe('errorHandler()', () => {
    it('should return retry when retry able error occur', () => {
      const logUploader = new LogUploader();
      expect(logUploader.errorHandler(createError(0))).toEqual('abortAll');
      expect(logUploader.errorHandler(createError(401))).toEqual('retry');
      expect(logUploader.errorHandler(createError(429))).toEqual('retry');
      expect(logUploader.errorHandler(createError(503))).toEqual('retry');
      expect(logUploader.errorHandler(createError(504))).toEqual('retry');
    });
    it('should retry other error', () => {
      const logUploader = new LogUploader();
      expect(logUploader.errorHandler(createError(500))).toEqual('retry');
    });
  });

  describe('_combineAndCompressMessageWithLimit()', () => {
    it('should combine zip message', () => {
      const logUploader = new LogUploader();
      jest
        .spyOn(logUploader, '_zipAndBase64')
        .mockImplementation((v: string) => v.replace(/b/g, ''));
      const result = logUploader['_combineAndCompressMessageWithLimit'](
        ['ab', 'ab', 'ab'],
        3,
      );
      expect(result).toEqual('aaa');
    });
  });

  describe('getUserInfo', () => {
    it('should get from getUserInfo', async () => {
      (accountService.getCurrentUserInfo as jest.Mock).mockResolvedValue({
        id: 12345,
        email: 'abc@rc.com',
      });
      const logUploader = new LogUploader();
      const userInfo = await logUploader['_getUserInfo']();
      expect(userInfo).toEqual({
        userId: 12345,
        email: 'abc@rc.com',
      });
    });
    it('should use clientId to represent userId', async () => {
      (accountService.getCurrentUserInfo as jest.Mock).mockRejectedValue(
        undefined,
      );
      getClientId.mockReturnValue('client-id');
      const logUploader = new LogUploader();
      const userInfo = await logUploader['_getUserInfo']();

      expect(userInfo).toEqual({
        email: 'service@glip.com',
        userId: 'client-id',
      });
    });
  });
});
