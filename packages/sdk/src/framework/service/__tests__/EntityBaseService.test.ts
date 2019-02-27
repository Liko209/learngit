/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { EntityBaseService } from '../EntityBaseService';
import { daoManager } from '../../../dao';
import { BaseDao } from '../../../framework/dao';
import { TestDatabase, TestEntity } from '../../controller/__tests__/TestTypes';
import NetworkClient from '../../../api/NetworkClient';
import { JNetworkError, ERROR_CODES_NETWORK } from '../../../error';
import { BaseResponse } from 'foundation/';

describe('EntityBaseService', () => {
  describe('getById()', () => {
    let dao: BaseDao<TestEntity> = null;
    let deactivatedDao: BaseDao<TestEntity> = null;
    const networkConfig = {
      basePath: '/basePath',
      networkClient: new NetworkClient(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      dao = new BaseDao('TestEntity', new TestDatabase());
      deactivatedDao = new BaseDao('DeactivatedDao', new TestDatabase());

      jest.spyOn(daoManager, 'getDao').mockImplementation(() => {
        return deactivatedDao;
      });
    });

    it('should call entity source controller once', async () => {
      const service = new EntityBaseService<TestEntity>(
        false,
        dao,
        networkConfig,
      );
      jest.spyOn(dao, 'get').mockImplementation(() => {
        return { id: 1, name: 'hello' };
      });
      const result = await service.getById(1);

      expect(result).toEqual({ id: 1, name: 'hello' });
    });

    it('should call network client once', async () => {
      const service = new EntityBaseService<TestEntity>(
        false,
        dao,
        networkConfig,
      );
      jest.spyOn(dao, 'get').mockImplementation(() => {
        return null;
      });

      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      expect(service.getById(1)).resolves.toEqual({ id: 1, name: 'jupiter' });
    });

    it('should call network client once and throw error', async () => {
      const service = new EntityBaseService<TestEntity>(
        false,
        dao,
        networkConfig,
      );
      jest.spyOn(dao, 'get').mockImplementation(() => {
        return null;
      });

      const error = new JNetworkError(
        ERROR_CODES_NETWORK.NOT_FOUND,
        'Not Found',
      );
      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockRejectedValueOnce(error);
      expect(service.getById(1)).resolves.toThrow();
    });
  });
});
