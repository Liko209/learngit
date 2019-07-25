// / <reference path="../../../../../__tests__/types.d.ts" />
/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-01-15 11:17:32
 * Copyright © RingCentral. All rights reserved.
 */
import {
  localPostJson4UnitTest,
  serverPostJson4UnitTest,
} from '../__tests__/PostData';
import { SendPostController } from '../SendPostController';
import { PostActionController } from '../PostActionController';

import { GroupConfigService } from '../../../../groupConfig';

import _ from 'lodash';
import { IPreInsertController } from '../../../../common/controller/interface/IPreInsertController';
import { Post } from '../../../entity/Post';
import { daoManager, AccountDao } from '../../../../../dao';
import { PostDao } from '../../../dao/PostDao';
import notificationCenter from '../../../../../service/notificationCenter';
import { ExtendedBaseModel } from '../../../../models';
import { PROGRESS_STATUS } from '../../../../progress';
import { AccountUserConfig } from '../../../../../module/account/config/AccountUserConfig';
import { ServiceLoader, ServiceConfig } from '../../../../serviceLoader';
import { PostDataController } from '../../PostDataController';
import { REQUEST_PRIORITY, DEFAULT_RETRY_COUNT } from 'foundation/src';
import { GroupService } from 'sdk/module/group/service';

jest.mock('../../../../../module/config');
jest.mock('../../../../../module/account/config/AccountUserConfig');

jest.mock('../PostActionController');
jest.mock('../../../../groupConfig');
jest.mock('../../../../../service/notificationCenter');
jest.mock('../../../../common/controller/impl/PreInsertController');
jest.mock('../../../../../dao');
jest.mock('../../../../groupConfig/dao');
jest.mock('../../../dao/PostDao');
jest.mock('../../PostDataController');
jest.mock('sdk/module/group/service', () => {
  return {
    GroupService: () => {
      return {
        getById: jest.fn(),
        isCurrentUserHasPermission: jest.fn(),
      };
    },
  };
});

class MockPreInsertController<T extends ExtendedBaseModel>
  implements IPreInsertController {
  async insert(entity: T): Promise<void> {
    return;
  }

  delete(entity: T): void {
    return;
  }

  async update(entity: T): Promise<void> {
    return;
  }

  async bulkDelete(entities: T[]): Promise<void> {
    return;
  }

  updateStatus(entity: T, status: PROGRESS_STATUS): void {
    return;
  }

  isInPreInsert(version: string): boolean {
    return false;
  }

  getPreInsertId(uniqueId: string) {
    return 1;
  }

  getAll() {
    return {
      uniqueIds: [],
      ids: [],
    };
  }
}

describe('SendPostController', () => {
  let sendPostController: SendPostController;
  let postDataController: PostDataController;
  let postActionController: PostActionController;
  const groupConfigService: GroupConfigService = new GroupConfigService();
  const postDao = new PostDao(null);
  const accountDao = new AccountDao(null);
  const groupService = new GroupService();
  let preInsertController: IPreInsertController;
  function doMock() {
    postActionController = new PostActionController(
      null,
      null,
      null,
      null,
      null,
    );
    preInsertController = new MockPreInsertController<Post>();
    postDataController = new PostDataController(
      groupService,
      groupConfigService,
      null,
      null,
    );
    ServiceLoader.getInstance = jest
      .fn()
      .mockImplementation((config: string) => {
        if (config === ServiceConfig.GROUP_CONFIG_SERVICE) {
          return groupConfigService;
        }
        if (config === ServiceConfig.ACCOUNT_SERVICE) {
          return { userConfig: AccountUserConfig.prototype };
        }
      });
    sendPostController = new SendPostController(
      postActionController,
      preInsertController,
      postDataController,
      groupService,
    );
  }
  beforeEach(() => {
    doMock();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  describe('sendPost', () => {
    it('should add user id and company id into parameters', async () => {
      let correct = false;
      AccountUserConfig.prototype.getGlipUserId = jest
        .fn()
        .mockReturnValueOnce(4);
      AccountUserConfig.prototype.getCurrentCompanyId = jest
        .fn()
        .mockReturnValueOnce(1);
      jest
        .spyOn(sendPostController, 'innerSendPost')
        .mockImplementationOnce((parameters: any, isRend: boolean) => {
          correct =
            parameters['creator_id'] === 4 &&
            parameters['company_id'] === 1 &&
            isRend === false;
        });
      await sendPostController.sendPost({ text: '', groupId: 4 });
      expect(correct).toBe(true);
    });
  });
  describe('reSendPost', () => {
    it('should call innerSendPost when local post exist', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce({ id: -1 });
      jest
        .spyOn(sendPostController, 'innerSendPost')
        .mockResolvedValueOnce(null);
      await sendPostController.reSendPost(-1);
      expect(sendPostController.innerSendPost).toHaveBeenCalledTimes(1);
    });
    it('should return null when local post does not exist', async () => {
      daoManager.getDao.mockReturnValueOnce(postDao);
      postDao.get.mockResolvedValueOnce(null);
      const result = await sendPostController.reSendPost(-1);
      expect(result).toEqual(null);
    });
    it('should return null id > 0', async () => {
      const result = await sendPostController.reSendPost(1);
      expect(result).toEqual(null);
    });
  });

  describe('editFailedPost', () => {
    it('should call PostActionController editFailedPost api when edit failed post', async () => {
      const spy = jest.spyOn(postActionController, 'editFailedPost');
      await sendPostController.editFailedPost({
        postId: -1,
        groupId: 1,
        text: '123',
      });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('innerSendPost', () => {
    it('should not call buildItemVersionMap when is resend or has not item_ids', async () => {
      jest
        .spyOn(sendPostController, '_cleanUploadingFiles')
        .mockReturnValue(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [];
      Object.assign(sendPostController, {
        _postItemController: { waiting4ItemsReady: () => {} },
      });
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController._cleanUploadingFiles).toHaveBeenCalledTimes(0);

      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, true);
      expect(sendPostController._cleanUploadingFiles).toHaveBeenCalledTimes(0);
    });
    it('should call buildItemVersionMap when it is not resend and has item_ids', async () => {
      jest
        .spyOn(sendPostController, '_cleanUploadingFiles')
        .mockReturnValue(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['item_ids'] = [1];
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: () => {},
          buildItemVersionMap: () => {},
        },
      });
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController._cleanUploadingFiles).toHaveBeenCalledTimes(1);
    });
    it('should send post to sever when post is valid and call back success', async () => {
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: true, obj: { item_ids: [1] } });
          },
        },
      });

      jest
        .spyOn(sendPostController, 'sendPostToServer')
        .mockReturnValueOnce(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '2323';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController.sendPostToServer).toHaveBeenCalledTimes(1);
    });
    it('should delete post when post is invalid', async () => {
      let shouldBeCalled = false;
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: true, obj: { item_ids: [] } });
          },
        },
        postActionController: {
          deletePost: () => {
            shouldBeCalled = true;
          },
        },
      });
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(shouldBeCalled).toEqual(true);
    });
    it('should call send post fail when post is valid but call back fail', async () => {
      Object.assign(sendPostController, {
        _postItemController: {
          waiting4ItemsReady: (a: any, b: any, callback: any) => {
            callback({ success: false, obj: { item_ids: [] } });
          },
        },
      });
      jest
        .spyOn(sendPostController, 'handleSendPostFail')
        .mockReturnValueOnce(null);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['text'] = '2323';
      data['item_ids'] = [];
      await sendPostController.innerSendPost(data, false);
      expect(sendPostController.handleSendPostFail).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendPostToServer', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
      doMock();
    });
    it('should transform to plain text when is_team_mention and has not permission', async () => {
      const data = _.cloneDeep(localPostJson4UnitTest);
      data.is_team_mention = true;
      data.text =
        "<a class='at_mention_compose' rel='{\"id\":-1}'>@Team </a>ojbk";
      groupService.getById.mockResolvedValue({});
      groupService.isCurrentUserHasPermission.mockReturnValue(false);
      jest.spyOn(preInsertController, 'update');
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      jest.spyOn(
        sendPostController.postActionController.requestController,
        'post',
      );
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);

      await sendPostController.sendPostToServer(data);
      expect(preInsertController.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_team_mention: false,
          text: '@Team ojbk',
        }),
      );
      expect(
        sendPostController.postActionController.requestController.post,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          is_team_mention: false,
          text: '@Team ojbk',
        }),
        expect.objectContaining({}),
      );
    });
    it('should transform to plain text when match mention regexp has not permission', async () => {
      const data = _.cloneDeep(localPostJson4UnitTest);
      data.is_team_mention = false;
      data.text =
        "<a class='at_mention_compose' rel='{\"id\":-1}'>@Team </a>ojbk";
      groupService.getById.mockResolvedValue({});
      groupService.isCurrentUserHasPermission.mockReturnValue(false);
      jest.spyOn(preInsertController, 'update');
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      jest.spyOn(
        sendPostController.postActionController.requestController,
        'post',
      );
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);

      await sendPostController.sendPostToServer(data);
      expect(preInsertController.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_team_mention: false,
          text: '@Team ojbk',
        }),
      );
      expect(
        sendPostController.postActionController.requestController.post,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          is_team_mention: false,
          text: '@Team ojbk',
        }),
        expect.objectContaining({}),
      );
    });
    it('should send mention_team post when has permission', async () => {
      const data = _.cloneDeep(localPostJson4UnitTest);
      data.is_team_mention = true;
      data.text =
        "<a class='at_mention_compose' rel='{\"id\":-1}'>@Team </a>ojbk";
      groupService.getById.mockResolvedValue({});
      groupService.isCurrentUserHasPermission.mockReturnValue(true);
      jest.spyOn(preInsertController, 'update');
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      jest.spyOn(
        sendPostController.postActionController.requestController,
        'post',
      );
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);

      await sendPostController.sendPostToServer(data);
      expect(preInsertController.update).not.toHaveBeenCalled();
      expect(
        sendPostController.postActionController.requestController.post,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          is_team_mention: true,
          text: data.text,
        }),
        expect.objectContaining({}),
      );
    });
    it('should call return PostData when send post success', async () => {
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      const spy = jest.spyOn(
        sendPostController.postActionController.requestController,
        'post',
      );
      const result = await sendPostController.sendPostToServer(data);
      expect(result).toEqual(serverPostJson4UnitTest);
      delete data.id;
      expect(spy).toHaveBeenCalledWith(data, {
        priority: REQUEST_PRIORITY.HIGH,
        retryCount: DEFAULT_RETRY_COUNT,
      });
    });
    it('should call with retryCount', async () => {
      let retryCount;
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: (data: any, option: any) => {
              retryCount = option && option.retryCount;
              return serverPostJson4UnitTest;
            },
          },
        },
      });
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      const result = await sendPostController.sendPostToServer(data);
      expect(result).toEqual(serverPostJson4UnitTest);
      expect(retryCount).toEqual(3);
    });
    it('should throw error when send post failed', async () => {
      Object.assign(sendPostController, {
        postActionController: {
          requestController: {
            post: () => {
              throw new Error();
            },
          },
        },
      });
      const data = _.cloneDeep(localPostJson4UnitTest);
      data['id'] = -999;
      try {
        await sendPostController.sendPostToServer(data);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });
  describe('handleSendPostSuccess', () => {
    it('should call the process of handle post', async () => {
      const data = _.cloneDeep(serverPostJson4UnitTest);
      postDao.put.mockResolvedValueOnce(null);
      daoManager.getDao.mockReturnValueOnce(postDao);
      await sendPostController.handleSendPostSuccess(data, { id: -999 });
      expect(notificationCenter.emitEntityReplace).toHaveBeenCalledTimes(1);
      expect(postDataController.deletePreInsertPosts).toHaveBeenCalledWith([
        {
          id: -999,
        },
      ]);
      expect(postDao.put).toHaveBeenCalledTimes(1);
    });
  });
  describe('handleSendPostFail', () => {
    it('should call incomesStatusChange and addPostId when send post failed', async () => {
      groupConfigService.addPostId.mockResolvedValueOnce(null);
      const result = await sendPostController.handleSendPostFail(-1, 2);
      expect(result.length).toBe(0);
      expect(groupConfigService.addPostId).toHaveBeenCalledTimes(1);
    });
  });
  describe('_convertTeamMentionToPlainText', () => {
    it('should convert TeamMention correctly', async () => {
      const text =
        "<a class='at_mention_compose' rel='{\"id\":-1}'>@Team </a>ojbk";
      expect(
        sendPostController['_convertTeamMentionToPlainText'](text),
      ).toEqual('@Team ojbk');
    });
  });
});
