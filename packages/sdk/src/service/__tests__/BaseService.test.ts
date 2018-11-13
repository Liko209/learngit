/// <reference path="../../__tests__/types.d.ts" />
import { daoManager } from '../../dao';
import BaseService from '../BaseService';
import BaseDao from '../../dao/base/BaseDao';
import Query from '../../dao/base/Query';
import { container } from '../../container';
import notificationCenter from '../notificationCenter';
import { SOCKET } from '../eventKey';
import dataDispatcher from '../../component/DataDispatcher/index';

import { BaseModel, Raw } from '../../models'; // eslint-disable-line
import { BaseError, ErrorParser } from '../../utils';
import _ from 'lodash';

jest.mock('../../dao/base/BaseDao');
jest.mock('../../dao/base/Query');

class MyDao extends BaseDao<{}> {}
const fakeApi = {
  getDataById: jest.fn(),
};
const EVENT = 'EVENT';

export type BaseServiceTestModel = BaseModel & {
  name?: string;
  note?: string;
};

class AService extends BaseService<BaseServiceTestModel> {
  constructor(subscriptions?) {
    super(MyDao, fakeApi, jest.fn(), subscriptions);
  }

  preHandlePartialModel(
    partialModel: Partial<Raw<BaseServiceTestModel>>,
    originalModel: BaseServiceTestModel,
  ): Partial<Raw<BaseServiceTestModel>> {
    return partialModel;
  }

  async doPartialNotify(
    originalModels: BaseServiceTestModel[],
    updatedModels: BaseServiceTestModel[],
    partialModels: Partial<Raw<BaseServiceTestModel>>[],
  ) {
    notificationCenter.emitEntityUpdate(EVENT, updatedModels, partialModels);
  }

  async doUpdateModel(
    updatedModel: BaseServiceTestModel,
  ): Promise<BaseServiceTestModel | BaseError> {
    return updatedModel;
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
      expect(dataDispatcher.register).toHaveBeenCalledWith(
        SOCKET.COMPANY,
        mockFn,
      );
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
      expect(dataDispatcher.unregister).toHaveBeenCalledWith(
        SOCKET.COMPANY,
        mockFn,
      );
    });
  });

  describe('partialUpdate()', () => {
    it('will trigger partial update event once', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      const updateModel = { id: 3, name: 'someone', note: 'a player' };
      jest.spyOn(service, 'doUpdateModel').mockResolvedValue(updateModel);

      jest
        .spyOn(service, 'getById')
        .mockResolvedValue({ id: 3, name: 'trump', note: 'a player' });

      service.doPartialNotify = jest.fn();

      const resp = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );

      expect(resp).toEqual(updateModel);
      expect(service.doPartialNotify).toBeCalledTimes(1);
    });
  });

  describe('partialUpdate()', () => {
    it('will trigger partial update event twice', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      const error = new BaseError(5000, '');

      jest.spyOn(service, 'doUpdateModel').mockResolvedValue(error);

      jest
        .spyOn(service, 'getById')
        .mockResolvedValue({ id: 3, name: 'trump', note: 'a player' });

      service.doPartialNotify = jest.fn();

      const resp = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );

      expect(resp).toEqual(error);

      expect(service.doPartialNotify).toBeCalledTimes(2);
    });
  });

  describe('partialUpdate()', () => {
    it('will trigger partial update event zero', async () => {
      const service = new AService();

      const partialModel = {
        _id: 3,
        name: 'someone',
      };

      jest.spyOn(service, 'getById').mockResolvedValue(null);

      service.doPartialNotify = jest.fn();

      const resp = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );

      expect(resp).toEqual(ErrorParser.parse('none model error'));

      expect(service.doPartialNotify).toBeCalledTimes(0);
    });
  });

  describe('partialUpdate()', () => {
    it('will not trigger partial update, due to no changes', async () => {
      const service = new AService();
      const partialModel = {
        _id: 3,
        name: 'trump',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };
      jest.spyOn(service, 'doUpdateModel').mockResolvedValue(originalModel);

      jest.spyOn(service, 'getById').mockResolvedValue(originalModel);

      service.doPartialNotify = jest.fn();

      const resp = await service.handlePartialUpdate(
        partialModel,
        service.preHandlePartialModel,
        service.doUpdateModel,
        service.doPartialNotify,
      );
      expect(resp).toEqual(originalModel);
      expect(service.doPartialNotify).toBeCalledTimes(0);
    });
  });

  describe('getRollbackPartialModel()', () => {
    it('rollback partial model should be contain all partial keys', async () => {
      const service = new AService();

      const partialModel = {
        id: 3,
        name: 'someone',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };

      const targetModel = { id: 3, name: 'trump' };

      service.doPartialNotify = jest.fn();

      const rollbackModel = await service.getRollbackPartialModel(
        partialModel,
        originalModel,
      );

      console.log('rollbackModel=', JSON.stringify(rollbackModel));
      expect(rollbackModel).toEqual(targetModel);
    });
  });

  describe('getMergedModel()', () => {
    it('merge difference to original model', async () => {
      const service = new AService();

      const partialModel = {
        id: 3,
        name: 'someone',
      };

      const originalModel = { id: 3, name: 'trump', note: 'a player' };

      const targetModel = { id: 3, name: 'someone', note: 'a player' };

      service.doPartialNotify = jest.fn();

      const mergedModel = await service.getMergedModel(
        partialModel,
        originalModel,
      );

      console.log('mergedModel=', JSON.stringify(mergedModel));

      const result = _.isEqual(mergedModel, targetModel);

      expect(result).toEqual(true);
    });
  });
});
