/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../PostController';
import { Post } from '../../../../models';
import { PostActionController } from '../implementation/PostActionController';
import { Api } from '../../../../api';
import { TestDatabase } from '../../../../framework/controller/__tests__/TestTypes';
import { BaseDao, daoManager, PostDao } from '../../../../dao';
import { ControllerBuilder } from '../../../../framework/controller/impl/ControllerBuilder';
import { SendPostController } from '../implementation/SendPostController';

jest.mock('../../../../api');
jest.mock('../../../../dao');

describe('PostController', () => {
  describe('getPostActionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const controllerBuilder = new ControllerBuilder<Post>();
      const postController = new PostController(controllerBuilder);

      const dao = new BaseDao('Post', new TestDatabase());
      jest.spyOn(daoManager, 'getDao').mockImplementationOnce(() => {
        return dao;
      });

      Object.assign(Api, {
        glipNetworkClient: null,
      });

      jest
        .spyOn(controllerBuilder, 'buildPartialModifyController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      jest
        .spyOn(controllerBuilder, 'buildRequestController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      jest
        .spyOn(controllerBuilder, 'buildEntitySourceController')
        .mockImplementationOnce(() => {
          return undefined;
        });

      const result = postController.getPostActionController();
      expect(result instanceof PostActionController).toBe(true);
      expect(controllerBuilder.buildEntitySourceController).toBeCalledTimes(1);
      expect(controllerBuilder.buildPartialModifyController).toBeCalledTimes(1);
      expect(controllerBuilder.buildRequestController).toBeCalledTimes(1);
    });
  });
  describe('getSendPostController', () => {
    it('getSendPostController should not be null/undefined', () => {
      const controllerBuilder = new ControllerBuilder<Post>();
      const postController = new PostController(controllerBuilder);
      jest
        .spyOn(postController, 'getPostActionController')
        .mockReturnValueOnce(null);

      daoManager.getDao.mockResolvedValue(new PostDao(null));
      const result = postController.getSendPostController();
      expect(result instanceof SendPostController).toBe(true);
    });
  });
});
