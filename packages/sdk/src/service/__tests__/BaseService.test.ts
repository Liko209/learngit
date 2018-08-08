/// <reference path="../../__tests__/types.d.ts" />
import { daoManager } from '../../dao';
import BaseService from '../BaseService';
import BaseDao from '../../dao/base/BaseDao';
import Query from '../../dao/base/Query';
import { container } from '../../container';
import notificationCenter from '../notificationCenter';
import { SOCKET } from '../eventKey';
import dataDispatcher from '../../component/DataDispatcher/index';

jest.mock('../../dao/base/BaseDao');
jest.mock('../../dao/base/Query');

class MyDao extends BaseDao<{}> {}
const fakeApi = {
  getDataById: jest.fn(),
};
const EVENT = 'EVENT';
class AService extends BaseService {
  constructor(subscriptions?) {
    super(MyDao, fakeApi, jest.fn(), subscriptions);
  }
}

container.registerClass({
  name: AService.name,
  value: AService,
  singleton: true,
});

describe('BaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getInstance()', () => {
    it('should return same instance', () => {
      const instance = AService.getInstance();
      const instance2 = AService.getInstance();
      expect(instance).toBe(instance2);
    });
  });

  describe('getById()', () => {
    it('should return data from dao', async () => {
      const service = new AService();
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue({ id: 1 });
      jest.spyOn(service, 'getByIdFromAPI');

      const result = await service.getById(1);

      expect(result).toEqual({ id: 1 });
    });

    it('should return data from API when Dao not return value', async () => {
      const service = new AService();
      jest.spyOn(service, 'getByIdFromDao').mockResolvedValue(null);
      jest.spyOn(service, 'getByIdFromAPI').mockResolvedValue({ id: 2 });

      const result = await service.getById(2);

      expect(result).toEqual({ id: 2 });
    });
  });

  describe('getByIdFromDao()', () => {
    it('should return data from dao', async () => {
      const service = new AService();
      const dao = daoManager.get(MyDao);
      dao.get.mockResolvedValue({ id: 3 });

      const result = await service.getByIdFromDao(3);

      expect(result).toEqual({ id: 3 });
    });
  });

  describe('getByIdFromAPI()', () => {
    it('should return data from API', async () => {
      const service = new AService();
      fakeApi.getDataById.mockResolvedValue({ data: { _id: 4 } });

      const result = await service.getByIdFromAPI(4);

      expect(result).toEqual({ id: 4 });
      expect(service.getByIdFromAPI(-1)).resolves.toThrow();
    });
  });

  describe('getAllFromDao()', () => {
    it('should get all data from DAO', async () => {
      const service = new AService();

      const mockQuery = new Query(null, null);
      mockQuery.offset.mockReturnThis();
      mockQuery.limit.mockReturnThis();
      mockQuery.toArray.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const dao = daoManager.get(MyDao);
      dao.createQuery.mockReturnValue(mockQuery);

      const resp = await service.getAllFromDao();

      expect(resp).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('getAll()', () => {
    it('should get all data from DAO', async () => {
      const service = new AService();
      jest.spyOn(service, 'getAllFromDao').mockResolvedValue([{ id: 1 }]);

      const resp = await service.getAll();

      expect(resp).toEqual([{ id: 1 }]);
    });
  });

  describe('start()', () => {
    it('should subscribe events', () => {
      const mockFn = jest.fn();
      const service = new AService({ [EVENT]: mockFn });
      service.start();
      notificationCenter.emit(EVENT);
      expect(mockFn).toHaveBeenCalled();
    });
    it('should subscribe dataDispatcher', () => {
      const mockFn = jest.fn();
      dataDispatcher.register = jest.fn();
      const service = new AService({ [SOCKET.COMPANY]: mockFn });
      service.start();
      expect(dataDispatcher.register).toHaveBeenCalledWith(SOCKET.COMPANY, mockFn);
    });
  });

  describe('stop()', () => {
    it('should unsubscribe events', () => {
      const mockFn = jest.fn();
      const service = new AService({ [EVENT]: mockFn });
      service.start();
      service.stop();
      notificationCenter.emit(EVENT);
      expect(mockFn).not.toHaveBeenCalled();
    });
    it('should unsubscribe dataDispatcher', () => {
      const mockFn = jest.fn();
      dataDispatcher.register = jest.fn();
      dataDispatcher.unregister = jest.fn();
      const service = new AService({ [SOCKET.COMPANY]: mockFn });
      service.start();
      service.stop();
      expect(dataDispatcher.unregister).toHaveBeenCalledWith(SOCKET.COMPANY, mockFn);
    });
  });
});
