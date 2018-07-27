/// <reference path="../../../__tests__/types.d.ts" />
import ConfigService from '..';
import AuthService from '../../auth';
import { daoManager, ConfigDao } from '../../../dao';

jest.mock('../../auth');
jest.mock('../../BaseService');
jest.mock('../../../dao');

describe('ConfigService', () => {
  let configService: ConfigService;
  let configDao: ConfigDao;
  let mockAuthService: AuthService;

  beforeAll(() => {
    mockAuthService = new AuthService();
    configService = new ConfigService(mockAuthService);
    configDao = new ConfigDao(null);
  });

  beforeEach(() => {
    daoManager.getKVDao.mockReturnValue(configDao);
  });

  describe('getLastIndexTimestamp()', () => {
    it('should return last index timestamp from dao', () => {
      configDao.get.mockReturnValue(123);
      expect(configService.getLastIndexTimestamp()).toBe(123);
    });
  });

  describe('getEnv()', () => {
    it('should return env from dao', () => {
      configDao.getEnv.mockReturnValue('development');
      expect(configService.getEnv()).toBe('development');
    });
  });

  describe('switchEnv()', () => {
    describe('when switch from production to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        configDao.getEnv.mockReturnValue('production');
        await configService.switchEnv('development');
      });
      it('should save new env to dao', async () => {
        expect(configDao.putEnv).toHaveBeenCalledWith('development');
      });
      it('should logout', async () => {
        expect(mockAuthService.logout).toHaveBeenCalled();
      });
    });

    describe('when switch from development to development', () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        configDao.getEnv.mockReturnValue('development');
        await configService.switchEnv('development');
      });
      it('should not save new env to dao', async () => {
        expect(configDao.putEnv).not.toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });

    describe(`when switch from no env to development`, () => {
      beforeAll(async () => {
        jest.clearAllMocks();
        configDao.getEnv.mockReturnValue('');
        await configService.switchEnv('development');
      });
      it('should save new env to dao', async () => {
        expect(configDao.putEnv).toBeCalled();
      });
      it('should not logout', async () => {
        expect(mockAuthService.logout).not.toBeCalled();
      });
    });
  });
});
