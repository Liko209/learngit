/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-17 13:10:00
 * Copyright © RingCentral. All rights reserved.
 */

import { RequestController } from '../impl/RequestController';
import { ApiResultOk, ApiResultErr } from '../../../api/ApiResult';
import { BaseResponse, BaseError } from 'foundation/src';
import { BaseModel } from '../../../models';
import NetworkClient from '../../../api/NetworkClient';

type TestEntity = BaseModel & {
  name: string;
};

describe('RequestController', () => {
  let networkConfig: {
    basePath: string;
    networkClient: NetworkClient;
  };

  let controller: RequestController<TestEntity>;

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

    controller = new RequestController<TestEntity>(networkConfig);
  });

  describe('getDataById()', () => {
    it('should throw exception when id <= 0', async () => {
      expect(controller.get(-1)).resolves.toThrow();
    });

    it('should return entity when api result is ok', async () => {
      jest.spyOn(networkConfig.networkClient, 'get').mockResolvedValueOnce(
        new ApiResultOk({ id: 1, name: 'jupiter' }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      const entity = await controller.get(1);
      expect(entity.id).toBe(1);
      expect(entity.name).toBe('jupiter');
    });

    it('should return exception when error', async () => {
      const error = new BaseError(404, 'Not Found');
      jest.spyOn(networkConfig.networkClient, 'get').mockResolvedValueOnce(
        new ApiResultErr(error, {
          status: 404,
          headers: {},
        } as BaseResponse),
      );
      expect(controller.get(1)).resolves.toThrow();
    });
  });

  describe('putData()', () => {
    it('should throw exception when id <= 0', async () => {
      expect(controller.put({ _id: -1, name: 'jupiter' })).resolves.toThrow();
    });

    it('should return entity when api success and has _id', async () => {
      jest.spyOn(networkConfig.networkClient, 'put').mockResolvedValueOnce(
        new ApiResultOk({ id: 1, name: 'jupiter' }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      const result = await controller.put({ _id: 1, name: 'jupiter' });

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });

    it('should return entity when api success and has id', async () => {
      jest.spyOn(networkConfig.networkClient, 'put').mockResolvedValueOnce(
        new ApiResultOk({ id: 1, name: 'jupiter' }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      const result = await controller.put({ id: 1, name: 'jupiter' });

      expect(networkConfig.networkClient.put).toBeCalledWith('/basePath/1', {
        _id: 1,
        name: 'jupiter',
      });

      expect(result).toEqual({ id: 1, name: 'jupiter' });
    });

    it('should return entity when api success and has id, -id', async () => {
      jest.spyOn(networkConfig.networkClient, 'put').mockResolvedValueOnce(
        new ApiResultOk({ id: 1, name: 'jupiter' }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );

      const result = await controller.put({
        id: 1,
        _id: 1,
        name: 'jupiter',
      });

      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });

    it('should throw exception when api fail', async () => {
      const error = new BaseError(500, 'Not Found');
      jest.spyOn(networkConfig.networkClient, 'put').mockResolvedValueOnce(
        new ApiResultErr(error, {
          status: 500,
          headers: {},
        } as BaseResponse),
      );
      expect(
        controller.put({
          id: 1,
          _id: 1,
          name: 'jupiter',
        }),
      ).resolves.toThrow();
    });
  });

  describe('postData()', () => {
    it('should throw exception api error', async () => {
      const error = new BaseError(400, 'Not Found');
      jest.spyOn(networkConfig.networkClient, 'post').mockResolvedValueOnce(
        new ApiResultErr(error, {
          status: 400,
          headers: {},
        } as BaseResponse),
      );

      expect(controller.post({ _id: -1, name: 'jupiter' })).resolves.toThrow();
    });

    it('should return entity when api success', async () => {
      jest.spyOn(networkConfig.networkClient, 'post').mockResolvedValueOnce(
        new ApiResultOk({ id: 1, name: 'jupiter' }, {
          status: 200,
          headers: {},
        } as BaseResponse),
      );
      const result = await controller.post({ _id: 1, name: 'jupiter' });
      expect(result.id).toBe(1);
      expect(result.name).toBe('jupiter');
    });
  });
});
