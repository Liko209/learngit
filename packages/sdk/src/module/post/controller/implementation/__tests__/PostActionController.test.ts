/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostActionController } from '../PostActionController';
import { IPartialModifyController } from '../../../../../framework/controller/interface/IPartialModifyController';
import { Post } from '../../../entity';
import { IRequestController } from '../../../../../framework/controller/interface/IRequestController';
import { daoManager, PostDao } from '../../../../../dao';
import { ProgressService } from '../../../../progress';
import { notificationCenter, GroupConfigService } from '../../../../../service';
import { IPreInsertController } from '../../../../common/controller/interface/IPreInsertController';
import _ from 'lodash';

jest.mock('../../../../../dao');
jest.mock('../../../../progress');
jest.mock('../../../../../service');
jest.mock('../../../../item/service');

class TestPreInsertController implements IPreInsertController<Post> {
  async preInsert(entity: Post): Promise<void> {
    return;
  }
  incomesStatusChange(id: number, shouldDelete: boolean): void {}
}

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
      new TestPreInsertController<Post>(),
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
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call put when edit post', async () => {
      await postActionController.editPost({
        postId: 4,
        groupId: 3,
        text: '',
      });
      expect(testPartialModifyController.updatePartially).toBeCalled();
    });
  });
  describe('deletePost', () => {
    beforeEach(() => {
      ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
      GroupConfigService.getInstance = jest
        .fn()
        .mockReturnValue(groupConfigService);
      daoManager.getDao.mockReturnValueOnce(postDao);
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should call _deletePreInsertedPost when id < 0', async () => {
      postDao.get.mockResolvedValueOnce({ _id: -4, group_id: 10, text: '444' });
      const result = await postActionController.deletePost(-4);
      expect(groupConfigService.deletePostId).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });
    it('should call _deletePostFromRemote when id > 0', async () => {
      await postActionController.deletePost(1);
      expect(testPartialModifyController.updatePartially).toBeCalled();
    });
  });
});
