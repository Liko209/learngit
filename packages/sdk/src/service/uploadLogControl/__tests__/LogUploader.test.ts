import { LogUploader } from '../LogUploader';
import { LogEntity, JNetworkError, ERROR_CODES_NETWORK } from 'foundation';
import { AccountService } from '../../../module/account';
import { Api } from 'sdk/api';
import axios, { AxiosError } from 'axios';
import { AccountUserConfig } from '../../../module/account/config';
import { ServiceLoader } from '../../../module/serviceLoader';
import { Pal } from '../../../pal/pal';
import { IApplicationInfo } from '../../../pal/applicationInfo';
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
jest.mock('../../../module/account/config');

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
  beforeEach(() => {
    Api.httpConfig = {
      sumologic: {
        server: 'url/',
        uniqueHttpCollectorCode: 'code',
      },
    };
    (axios.post as jest.Mock).mockResolvedValue({});
    ServiceLoader.getInstance = jest.fn().mockReturnValue(accountService);
    (accountService.getUserEmail as jest.Mock).mockResolvedValue('abc@rc.com');
    AccountUserConfig.prototype.getGlipUserId.mockReturnValue(12345);
    (accountService.getClientId as jest.Mock).mockReturnValue('54321');
    (Pal.instance.getApplicationInfo as jest.Mock).mockReturnValue(mockAppInfo);
  });
  describe('upload()', () => {
    it('should call post correctly', async () => {
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      mockLog.sessionId = 'sessionA';
      jest.spyOn(logUploader, 'transform').mockReturnValue('mm');
      await logUploader.upload([mockLog]);
      expect(axios.post).toBeCalledWith('url/code', 'mm', {
        headers: {
          'X-Sumo-Name': `${mockAppInfo.platform}/${mockAppInfo.appVersion}/${
            mockAppInfo.browser
          }/${mockAppInfo.os}/abc@rc.com/12345/sessionA`,
          'Content-Type': 'application/json',
        },
      });
    });
    it('should call post correctly when getUserEmail error', async () => {
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      accountService.getUserEmail.mockRejectedValueOnce('');
      mockLog.sessionId = 'sessionA';
      jest.spyOn(logUploader, 'transform').mockReturnValue('mm');
      await logUploader.upload([mockLog]);
      expect(axios.post).toBeCalledWith('url/code', 'mm', {
        headers: {
          'X-Sumo-Name': `${mockAppInfo.platform}/${mockAppInfo.appVersion}/${
            mockAppInfo.browser
          }/${mockAppInfo.os}/abc@rc.com/12345/sessionA`,
          'Content-Type': 'application/json',
        },
      });
    });
    it('should call post correctly when get userId error', async () => {
      const logUploader = new LogUploader();
      const mockLog = new LogEntity();
      AccountUserConfig.prototype.getGlipUserId.mockImplementation(() => {
        throw new Error('');
      });
      mockLog.sessionId = 'sessionA';
      jest.spyOn(logUploader, 'transform').mockReturnValue('mm');
      await logUploader.upload([mockLog]);
      expect(axios.post).toBeCalledWith('url/code', 'mm', {
        headers: {
          'X-Sumo-Name': `${mockAppInfo.platform}/${mockAppInfo.appVersion}/${
            mockAppInfo.browser
          }/${mockAppInfo.os}/service@glip.com//sessionA`,
          'Content-Type': 'application/json',
        },
      });
    });
  });
  describe('transform()', () => {
    it('should transform message correctly', () => {
      const logUploader = new LogUploader();
      const mockLog1 = new LogEntity();
      mockLog1.message = 'a';
      const mockLog2 = new LogEntity();
      mockLog2.message = 'b';
      const result = logUploader.transform([mockLog1, mockLog2]);
      expect(result).toEqual('a\nb');
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
});
