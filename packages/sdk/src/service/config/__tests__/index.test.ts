/// <reference path="../../../__tests__/types.d.ts" />
import ConfigService from '..';
import AuthService from '../../auth';
import { NewGlobalConfig } from '../NewGlobalConfig';
import { SyncUserConfig } from '../../../module/sync/config';

jest.mock('../../auth');
jest.mock('../../BaseService');
jest.mock('../../../dao');
jest.mock('../../../module/config');
jest.mock('../../../service/config/NewGlobalConfig');
jest.mock('../../../module/sync/config');

describe('ConfigService', () => {
  let configService: ConfigService;
  let mockAuthService: AuthService;

  beforeAll(() => {
    mockAuthService = new AuthService();
    configService = new ConfigService(mockAuthService);
  });

  describe('getEnv()', () => {
    it('should return env from dao', () => {
      NewGlobalConfig.getEnv = jest.fn().mockReturnValue('development');
      expect(configService.getEnv()).toBe('development');
    });
  });

  describe('switchEnv()', () => {
    describe('when switch from production to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        NewGlobalConfig.getEnv = jest.fn().mockReturnValue('production');
        await configService.switchEnv('development');
      });

      it('should save new env to dao', async () => {
        expect(NewGlobalConfig.setEnv).toHaveBeenCalledWith('development');
      });
      it('should logout', async () => {
        expect(mockAuthService.logout).toHaveBeenCalled();
      });
    });

    describe('when switch from development to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        NewGlobalConfig.getEnv = jest.fn().mockReturnValue('development');
        await configService.switchEnv('development');
      });
      it('should not save new env to dao', async () => {
        expect(NewGlobalConfig.setEnv).not.toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });

    describe('when switch from no env to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        NewGlobalConfig.getEnv = jest.fn().mockReturnValue('');
        await configService.switchEnv('development');
      });
      it('should save new env to dao', async () => {
        expect(NewGlobalConfig.setEnv).toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });
  });
});
