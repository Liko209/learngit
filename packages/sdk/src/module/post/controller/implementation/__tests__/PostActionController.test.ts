/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-20 09:08:00
 * Copyright © RingCentral. All rights reserved.
 */

import { PostActionController } from '../PostActionController';
import { IPartialModifyController } from '../../../../../framework/controller/interface/IPartialModifyController';
import { Post } from '../../../entity';
import { IRequestController } from '../../../../../framework/controller/interface/IRequestController';
import { daoManager } from '../../../../../dao';
import { PostDao } from '../../../dao';
import { ProgressService, PROGRESS_STATUS } from '../../../../progress';
import { GroupConfigService } from '../../../../groupConfig';
import { IPreInsertController } from '../../../../common/controller/interface/IPreInsertController';
import _ from 'lodash';
import { ExtendedBaseModel } from '../../../../models';
import { EntitySourceController } from '../../../../../framework/controller/impl/EntitySourceController';
import { ItemService } from '../../../../../module/item/service';

jest.mock('../../../../../module/item/service');
jest.mock('../../../../../framework/controller/impl/EntitySourceController');
jest.mock('../../../../../dao');
jest.mock('../../../dao');
jest.mock('../../../../progress');
jest.mock('../../../../../service');
jest.mock('../../../../groupConfig');
jest.mock('../../../../groupConfig/dao');
jest.mock('../../../../item/service');

class TestPreInsertController<T extends ExtendedBaseModel>
  implements IPreInsertController {
  async insert(entity: T): Promise<void> {
    return;
  }

  delete(entity: T): void {
    return;
  }

  async bulkDelete(entities: T[]): Promise<void> {
    return;
  }

  updateStatus(entity: T, status: PROGRESS_STATUS): void {
    return;
  }

  isInPreInsert(version: number): boolean {
    return false;
  }
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
  let testTestPreInsertController: TestPreInsertController<Post>;
  let entitySourceController: EntitySourceController<Post>;
  let itemService: ItemService;
  const postDao = new PostDao(null);
  const progressService: ProgressService = new ProgressService();
  const groupConfigService: GroupConfigService = new GroupConfigService();

  beforeEach(() => {
    itemService = new ItemService();
    entitySourceController = new EntitySourceController<Post>(null, null, null);
    testPartialModifyController = new TestPartialModifyController();
    testRequestController = new TestRequestController();
    testTestPreInsertController = new TestPreInsertController();
    postActionController = new PostActionController(
      testPartialModifyController,
      testRequestController,
      testTestPreInsertController,
      entitySourceController,
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

  describe('removeItemFromPost', () => {
    beforeEach(() => {
      ProgressService.getInstance = jest.fn().mockReturnValue(progressService);
      GroupConfigService.getInstance = jest
        .fn()
        .mockReturnValue(groupConfigService);
      daoManager.getDao.mockReturnValueOnce(postDao);
      ItemService.getInstance = jest.fn().mockReturnValue(itemService);
      testTestPreInsertController.delete = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });

    function setUpPartialUpdate(
      postId: number,
      partialPost: any,
      newPost: any,
    ) {
      testPartialModifyController.updatePartially = jest
        .fn()
        .mockImplementation(
          async (
            entityId: number,
            preHandlePartialEntity: any,
            doUpdateEntity: any,
          ) => {
            expect(entityId).toBe(postId);
            const resPartialPost = preHandlePartialEntity();
            expect(resPartialPost).toEqual(partialPost);
            await doUpdateEntity(newPost);
          },
        );
    }

    it('should delete post and item when post is invalid', async () => {
      const inValidLocalPost = {
        text: '',
        id: -2,
        item_ids: [-1],
        group_id: 10,
      };

      const newInValidLocalPost = {
        id: -2,
        text: '',
        item_ids: [],
        group_id: 10,
      };

      const partialPost = {
        deactivated: true,
        item_ids: [],
      };
      postDao.get.mockResolvedValueOnce(inValidLocalPost);
      entitySourceController.getEntityLocally = jest
        .fn()
        .mockResolvedValue(inValidLocalPost);
      setUpPartialUpdate(inValidLocalPost.id, partialPost, newInValidLocalPost);

      await postActionController.removeItemFromPost(inValidLocalPost.id, -1);
      expect(groupConfigService.deletePostId).toBeCalled();
      expect(testTestPreInsertController.delete).toBeCalled();
      expect(itemService.deleteItem).toBeCalledWith(-1);
    });

    it('should send request to update post when post is a server post', async () => {
      const validLocalPost = {
        text: '111',
        id: 2,
        item_ids: [1],
        group_id: 10,
      };

      const newValidLocalPost = {
        text: '111',
        id: 2,
        item_ids: [],
        group_id: 10,
      };

      const partialPost = {
        deactivated: false,
        item_ids: [],
      };
      setUpPartialUpdate(validLocalPost.id, partialPost, newValidLocalPost);

      entitySourceController.getEntityLocally = jest
        .fn()
        .mockResolvedValue(validLocalPost);

      await postActionController.removeItemFromPost(validLocalPost.id, 1);
      expect(testRequestController.put).toBeCalled();
      expect(itemService.deleteItem).toBeCalledWith(1);
    });
  });
});
