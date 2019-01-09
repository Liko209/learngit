/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostActionController } from '../PostActionController';
import { IPartialModifyController } from '../../../../framework/controller/interface/IPartialModifyController';
import { Post } from '../../entity';
import { IRequestController } from '../../../../framework/controller/interface/IRequestController';
import { daoManager, PostDao } from '../../../../dao';
import { localPostJson4UnitTest } from './PostData';
import { ProgressService } from '../../../progress';
import { notificationCenter, GroupConfigService } from '../../../../service';

jest.mock('../../../../dao');
jest.mock('../../../progress');
jest.mock('../../../../service');

class TestPartialModifyController implements IPartialModifyController<Post> {
  updatePartially = jest.fn();
  getMergedEntity = jest.fn();
  getRollbackPartialEntity = jest.fn();
}

class TestRequestController implements IRequestController<Post> {
  get = jest.fn();
  put = jest.fn();
  post = jest.fn();
}

describe('PostController', () => {
  let postActionController: PostActionController;
  let testPartialModifyController: TestPartialModifyController;
  let testRequestController: TestRequestController;

  const postDao = new PostDao(null);
  const progressService: ProgressService = new ProgressService();
  const groupConfigService: GroupConfigService = new GroupConfigService();

  beforeEach(() => {
    testPartialModifyController = new TestPartialModifyController();
    testRequestController = new TestRequestController();
    postActionController = new PostActionController(
      testPartialModifyController,
      testRequestController,
    );
  });
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('likePost()', () => {
    it('should call partial modify controller', async () => {
      await postActionController.likePost(1, 100, true);
      expect(testPartialModifyController.updatePartially).toBeCalled();
    });
  });
  describe('editPost', () => {
    beforeEach(() => {
      daoManager.getDao.mockReturnValueOnce(postDao);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should throw error when post can not find in local', async () => {
      postDao.get.mockResolvedValueOnce(null);
      await expect(
        postActionController.editPost({ postId: 4, groupId: 2, text: '' }),
      ).rejects.toThrowError();
    });
    it('should call put when edit post', async () => {
      const params = {
        postId: 7267105619972,
        groupId: 7848853506,
        text: 'good',
      };
      postDao.get.mockResolvedValueOnce(localPostJson4UnitTest);
      await postActionController.editPost(params);
      expect(testRequestController.put).toBeCalledTimes(1);
    });
  });
  describe('deletePost', () => {
    beforeEach(() => {
      daoManager.getDao.mockReturnValue(postDao);
      ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
      GroupConfigService.getInstance = jest
        .fn()
        .mockReturnValue(groupConfigService);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call _deletePreInsertedPost when id < 0', async () => {
      postDao.get.mockResolvedValueOnce({ _id: -4, group_id: 10, text: '444' });
      const result = await postActionController.deletePost(-4);
      expect(progressService.deleteProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityDelete).toBeCalledTimes(1);
      expect(groupConfigService.deletePostId).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });
    it('should call _deletePostFromRemote when id > 0', async () => {
      let called = false;
      postDao.get.mockResolvedValueOnce(localPostJson4UnitTest);
      testRequestController.put.mockReturnValueOnce({});
      jest.spyOn(postActionController, 'handlePost').mockImplementation(() => {
        called = true;
      });
      const result = await postActionController.deletePost(7267105619972);
      expect(result).toBe(true);
      expect(called).toBe(true);
    });
    it('should call throw error when put failed', async () => {
      postDao.get.mockResolvedValueOnce(localPostJson4UnitTest);
      testRequestController.put.mockRejectedValueOnce({});
      const result = await postActionController.deletePost(7267105619972);
      expect(result).toBe(false);
    });
  });
});
