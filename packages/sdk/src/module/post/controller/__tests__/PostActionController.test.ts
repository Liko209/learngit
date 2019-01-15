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
import { ProgressService } from '../../../progress';
import { notificationCenter, GroupConfigService } from '../../../../service';
import _ from 'lodash';

jest.mock('../../../../dao');
jest.mock('../../../progress');
jest.mock('../../../../service');
jest.mock('../../../item/service');

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
      expect(progressService.deleteProgress).toBeCalledTimes(1);
      expect(notificationCenter.emitEntityDelete).toBeCalledTimes(1);
      expect(groupConfigService.deletePostId).toBeCalledTimes(1);
      expect(result).toBeTruthy();
    });
    it('should call _deletePostFromRemote when id > 0', async () => {
      await postActionController.deletePost(1);
      expect(testPartialModifyController.updatePartially).toBeCalled();
    });
  });
  // describe('buildItemVersionMap4Post', () => {
  //   it('item_data should be undefined when not item_ids', async () => {
  //     const rawPost = _.cloneDeep(localPostJson4UnitTest);
  //     rawPost['item_ids'] = [];
  //     const result = await postActionController.buildItemVersionMap4Post(
  //       rawPost,
  //     );
  //     expect(rawPost['item_data']).toBe(undefined);
  //   });
  //   it('item_data should has value when has item_ids', async () => {
  //     const rawPost = _.cloneDeep(localPostJson4UnitTest);
  //     rawPost['item_ids'] = [1, 2];
  //     const versionData = { version_map: { 1: 3, 2: 4 } };
  //     mockItemService.getItemVersion
  //       .mockResolvedValueOnce(3)
  //       .mockResolvedValueOnce(4);
  //     mockItemService.getUploadItems.mockReturnValueOnce([
  //       { id: 1 },
  //       { id: 2 },
  //     ]);
  //     const result = await postActionController.buildItemVersionMap4Post(
  //       rawPost,
  //     );
  //     expect(mockItemService.getItemVersion).toBeCalledTimes(2);
  //     expect(result.item_data).toEqual(versionData);
  //   });
  // });
  // describe('innerSendPost', () => {
  //   it('should call _cleanUploadingFiles when is not resend  and has items', async () => {
  //     let _cleanUploadingFilesHasCalled = false;
  //     jest
  //       .spyOn(postActionController, '_cleanUploadingFiles')
  //       .mockImplementationOnce(() => {
  //         _cleanUploadingFilesHasCalled = true;
  //       });
  //     jest
  //       .spyOn(postActionController, 'handlePreInsertProcess')
  //       .mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(postActionController, 'sendPostWithItems')
  //       .mockResolvedValueOnce(null);
  //     const para = _.cloneDeep(localPostJson4UnitTest);
  //     para['item_ids'] = [1, 2];
  //     await postActionController.innerSendPost(para, false);
  //     expect(_cleanUploadingFilesHasCalled).toEqual(true);
  //     expect(postActionController.sendPostWithItems).toHaveBeenCalledTimes(1);
  //   });

  //   it('should call _sendPostToServer when has item ids and reSend is true', async () => {
  //     jest
  //       .spyOn(postActionController, 'handlePreInsertProcess')
  //       .mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(postActionController, 'sendPostToServer')
  //       .mockResolvedValueOnce(null);
  //     const para = _.cloneDeep(localPostJson4UnitTest);
  //     para['item_ids'] = [1, 2];
  //     await postActionController.innerSendPost(para, true);
  //     expect(postActionController.sendPostToServer).toHaveBeenCalledTimes(1);
  //   });
  //   it('should call _sendPostToServer when has not item and reSend is false', async () => {
  //     jest
  //       .spyOn(postActionController, 'handlePreInsertProcess')
  //       .mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(postActionController, 'sendPostToServer')
  //       .mockResolvedValueOnce(null);
  //     const para = _.cloneDeep(localPostJson4UnitTest);
  //     await postActionController.innerSendPost(para, false);
  //     expect(postActionController.sendPostToServer).toHaveBeenCalledTimes(1);
  //   });

  //   it('should call _sendPostToServer when has not item and reSend is true', async () => {
  //     jest
  //       .spyOn(postActionController, 'handlePreInsertProcess')
  //       .mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(postActionController, 'sendPostToServer')
  //       .mockResolvedValueOnce(null);
  //     const para = _.cloneDeep(localPostJson4UnitTest);
  //     await postActionController.innerSendPost(para, true);
  //     expect(postActionController.sendPostToServer).toHaveBeenCalledTimes(1);
  //   });
  // });

  // describe('sendPostToServer', () => {
  //   it('should delete id when post data to server', async () => {
  //     jest
  //       .spyOn(postActionController, 'handleSendPostSuccess')
  //       .mockResolvedValueOnce(null);
  //     testRequestController.post.mockResolvedValueOnce(serverPostJson4UnitTest);
  //     const mockData = _.cloneDeep(localPostJson4UnitTest);
  //     delete mockData.id;
  //     await postActionController.sendPostToServer(localPostJson4UnitTest);
  //     expect(testRequestController.post).toHaveBeenCalledWith(mockData);
  //     expect(postActionController.handleSendPostSuccess).toHaveBeenCalledTimes(
  //       1,
  //     );
  //   });

  //   it('should call throw Error when send post fail', async () => {
  //     jest
  //       .spyOn(postActionController, 'handleSendPostFail')
  //       .mockResolvedValueOnce(null);
  //     const mockError = new JSdkError('', '');
  //     testRequestController.post.mockRejectedValueOnce(mockError);
  //     try {
  //       await postActionController.sendPostToServer(localPostJson4UnitTest);
  //       expect(true).toBe(false);
  //     } catch (e) {
  //       expect(true).toBe(true);
  //     }
  //   });
  // });
});
