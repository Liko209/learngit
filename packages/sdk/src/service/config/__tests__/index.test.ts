/// <reference path="../../../__tests__/types.d.ts" />
import ConfigService from '..';
import AuthService from '../../auth';
import { NewGlobalConfig } from '../../../service/config/newGlobalConfig';

jest.mock('../../auth');
jest.mock('../../BaseService');
jest.mock('../../../dao');
jest.mock('../../../module/config');
jest.mock('../../../service/config/newGlobalConfig');

describe('ConfigService', () => {
  let configService: ConfigService;
  let mockAuthService: AuthService;
  let globalConfig: NewGlobalConfig;

  beforeAll(() => {
    globalConfig = new NewGlobalConfig(null);
    mockAuthService = new AuthService();
    configService = new ConfigService(mockAuthService);
  });

  beforeEach(() => {
    NewGlobalConfig.getInstance = jest.fn().mockReturnValue(globalConfig);
  });

  describe('getLastIndexTimestamp()', () => {
    it('should return last index timestamp from dao', () => {
      globalConfig.getLastIndexTimestamp = jest.fn().mockReturnValue(123);
      expect(configService.getLastIndexTimestamp()).toBe(123);
    });
  });

  describe('getEnv()', () => {
    it('should return env from dao', () => {
      globalConfig.getEnv = jest.fn().mockReturnValue('development');
      expect(configService.getEnv()).toBe('development');
    });
  });

  describe('switchEnv()', () => {
    describe('when switch from production to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        NewGlobalConfig.getInstance = jest.fn().mockReturnValue(globalConfig);
        globalConfig.getEnv = jest.fn().mockReturnValue('production');
        await configService.switchEnv('development');
      });

      it('should save new env to dao', async () => {
        expect(globalConfig.setEnv).toHaveBeenCalledWith('development');
      });
      it('should logout', async () => {
        expect(mockAuthService.logout).toHaveBeenCalled();
      });
    });

    describe('when switch from development to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        globalConfig.getEnv = jest.fn().mockReturnValue('development');
        await configService.switchEnv('development');
      });
      it('should not save new env to dao', async () => {
        expect(globalConfig.setEnv).not.toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });

    describe('when switch from no env to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        globalConfig.getEnv = jest.fn().mockReturnValue('');
        await configService.switchEnv('development');
      });
      it('should save new env to dao', async () => {
        expect(globalConfig.setEnv).toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });
  });
});
