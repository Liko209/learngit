/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostController } from '../PostController';
import { PostActionController } from '../implementation/PostActionController';
import { Api } from '../../../../api';
import { daoManager } from '../../../../dao';
import { PostDao } from '../../dao';
import {
  buildEntitySourceController,
  buildRequestController,
  buildPartialModifyController,
} from '../../../../framework/controller';

import { SendPostController } from '../implementation/SendPostController';
import { PostSearchController } from '../implementation/PostSearchController';
import { ProgressService } from '../../../progress';

jest.mock('../../../../framework/controller');
jest.mock('../../../../api');
jest.mock('../../../../dao');
jest.mock('../../dao');
jest.mock('../../../progress');
jest.mock('../../../../service/config/NewGlobalConfig');

describe('PostController', () => {
  const progressService: ProgressService = new ProgressService();
  const postDao: PostDao = new PostDao(null);

  beforeEach(() => {
    ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
    jest.spyOn(daoManager, 'getDao').mockReturnValue(postDao);
  });

  describe('getPostActionController()', () => {
    afterAll(() => {
      jest.clearAllMocks();
    });
    it('should call partial modify controller', async () => {
      const postController = new PostController();

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

  describe('getSendPostController', () => {
    it('getSendPostController should not be null/undefined', () => {
      const postController = new PostController();
      jest
        .spyOn(postController, 'getPostActionController')
        .mockReturnValueOnce(null);
      const result = postController.getSendPostController();
      expect(result instanceof SendPostController).toBe(true);
    });
  });

  describe('getPostSearchController', () => {
    it('getPostSearchController should not be null/undefined', () => {
      const postController = new PostController();
      const result = postController.getPostSearchController();
      expect(result instanceof PostSearchController).toBe(true);
    });
  });
});
