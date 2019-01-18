/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../PostController';
import { Post } from '../../../../models';
import { PostActionController } from '../PostActionController';
import { Api } from '../../../../api';
import { TestDatabase } from '../../../../framework/controller/__tests__/TestTypes';
import { BaseDao, daoManager } from '../../../../dao';
import {
  buildEntitySourceController,
  buildRequestController,
  buildPartialModifyController,
} from '../../../../framework/controller';

jest.mock('../../../../api');
jest.mock('../../../../framework/controller');

describe('PostController', () => {
  describe('getPostActionController()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const postController = new PostController();

      const dao = new BaseDao('Post', new TestDatabase());
      jest.spyOn(daoManager, 'getDao').mockImplementationOnce(() => {
        return dao;
      });

      Object.assign(Api, {
        glipNetworkClient: null,
      });

      buildPartialModifyController.mockImplementationOnce(() => {
        return undefined;
      });

      buildRequestController.mockImplementationOnce(() => {
        return undefined;
      });

      buildEntitySourceController.mockImplementationOnce(() => {
        return undefined;
      });

      const result = postController.getPostActionController();
      expect(result instanceof PostActionController).toBe(true);
      expect(buildEntitySourceController).toBeCalledTimes(1);
      expect(buildPartialModifyController).toBeCalledTimes(1);
      expect(buildRequestController).toBeCalledTimes(1);
    });
  });
});
