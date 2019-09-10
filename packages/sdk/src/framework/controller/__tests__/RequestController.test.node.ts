/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-17 13:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RequestController } from '../impl/RequestController';
import { IdModel } from '../../../framework/model';
import { JNetworkError, ERROR_CODES_NETWORK } from 'foundation/error';
import NetworkClient from '../../../api/NetworkClient';

type TestEntity = IdModel & {
  name: string;
};

describe('RequestController', () => {
  let networkConfig: {
    basePath: string;
    networkClient: NetworkClient;
  };

  let requestController: RequestController<TestEntity>;

  beforeEach(() => {
    networkConfig = {
      basePath: '/basePath',
      networkClient: new NetworkClient(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ),
    };

    requestController = new RequestController<TestEntity>(networkConfig);
  });

  describe('getDataById()', () => {
    it('should throw exception when id <= 0', async () => {
      expect(requestController.get(-1)).rejects.toThrow();
    });

    it('should return entity when api result is ok', async () => {
      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      const entity = await requestController.get(1);
      expect(entity.id).toBe(1);
      expect(entity.name).toBe('jupiter');
    });

    it('should return exception when error', async () => {
      const error = new JNetworkError(
        ERROR_CODES_NETWORK.NOT_FOUND,
        'Not Found',
      );
      jest
        .spyOn(networkConfig.networkClient, 'get')
        .mockRejectedValueOnce(error);
      expect(requestController.get(1)).rejects.toThrow();
    });
  });

  describe('putData()', () => {
    it('should throw exception when id <= 0', async () => {
      expect(
        requestController.put({ _id: -1, name: 'jupiter' }),
      ).rejects.toThrow();
    });

    it('should return entity when api success and has _id', async () => {
      jest
        .spyOn(networkConfig.networkClient, 'put')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      const result = await requestController.put({ _id: 1, name: 'jupiter' });

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });

    it('should return entity when api success and has id', async () => {
      jest
        .spyOn(networkConfig.networkClient, 'put')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      const result = await requestController.put({ id: 1, name: 'jupiter' });

      expect(networkConfig.networkClient.put).toHaveBeenCalledWith({
        path: '/basePath/1',
        data: {
          _id: 1,
          name: 'jupiter',
        },
      });

      expect(result).toEqual({ id: 1, name: 'jupiter' });
    });

    it('should return entity when api success and has id, -id', async () => {
      jest
        .spyOn(networkConfig.networkClient, 'put')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });

      const result = await requestController.put({
        id: 1,
        _id: 1,
        name: 'jupiter',
      });

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });

    it('should throw exception when api fail', async () => {
      const error = new JNetworkError(
        ERROR_CODES_NETWORK.INTERNAL_SERVER_ERROR,
        'Not Found',
      );
      jest
        .spyOn(networkConfig.networkClient, 'put')
        .mockRejectedValueOnce(error);
      expect(
        requestController.put({
          id: 1,
          _id: 1,
          name: 'jupiter',
        }),
      ).rejects.toThrow();
    });
  });

  describe('postData()', () => {
    it('should throw exception api error', async () => {
      const error = new JNetworkError(
        ERROR_CODES_NETWORK.BAD_REQUEST,
        'Not Found',
      );
      jest
        .spyOn(networkConfig.networkClient, 'post')
        .mockRejectedValueOnce(error);

      expect(
        requestController.post({ _id: -1, name: 'jupiter' }),
      ).rejects.toThrow();
    });

    it('should return entity when api success', async () => {
      jest
        .spyOn(networkConfig.networkClient, 'post')
        .mockResolvedValueOnce({ id: 1, name: 'jupiter' });
      const result = await requestController.post({ _id: 1, name: 'jupiter' });
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });
  });
});
