/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 11:15:14
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfigController } from '../GroupConfigController';
import { AccountService } from '../../../account';
import { ServiceConfig, ServiceLoader } from '../../../serviceLoader';
import { ItemService } from 'sdk/module/item';

jest.mock('../../../account');

const entitySourceController = {
  get: jest.fn(),
  update: jest.fn(),
  bulkUpdate: jest.fn(),
  getEntityNotificationKey: jest.fn(),
  getEntityLocally: jest.fn(),
};

function getMockHasMore({
  older = true,
  newer = true,
  both = true,
}: {
  older?: boolean;
  newer?: boolean;
  both?: boolean;
}) {
  return { older, newer, both };
}

describe('GroupConfigService', () => {
  let groupConfigController: GroupConfigController;
  let accountService: AccountService;
  let itemService: ItemService;
  const g_UserId = 100;

  function setUp() {
    accountService = new AccountService(undefined as any);
    itemService = new ItemService()
    Object.defineProperty(accountService, 'userConfig', {
      writable: true,
      value: {
        getGlipUserId: () => {
          return g_UserId;
        },
      },
    });

    const serviceMap: Map<string, any> = new Map([
      [ServiceConfig.ACCOUNT_SERVICE, accountService as any],
      [ServiceConfig.ITEM_SERVICE, itemService as any]
    ]);
    ServiceLoader.getInstance = jest.fn().mockImplementation((name: string) => {
      return serviceMap.get(name);
    });

    groupConfigController = new GroupConfigController(
      entitySourceController as any,
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setUp();
  });

  describe('updateGroupConfigPartialData', () => {
    it('should call not entity update', async () => {
      const mock = {
        id: 2,
        draft: 'draft',
      };
      entitySourceController.get.mockResolvedValue(mock);

      await groupConfigController.updateGroupConfigPartialData(mock);
      expect(entitySourceController.update).not.toBeCalled();
    });

    it('should call entity update', async () => {
      const mock = {
        id: 2,
        draft: 'draft',
      };

      const mock2 = {
        id: 2,
        draft: 'draft2',
      };
      entitySourceController.get.mockResolvedValue(mock);
      entitySourceController.getEntityNotificationKey.mockReturnValue(
        'ENTITY.GROUPCONFIG',
      );

      await groupConfigController.updateGroupConfigPartialData(mock2);
      expect(entitySourceController.update).toBeCalledWith(mock2);
    });
  });
  describe('updateDraft', () => {
    it('should call updateGroupConfigPartialData when groupConfig has exited', async () => {
      let hasBeenCalled = false;
      jest
        .spyOn(groupConfigController, 'updateGroupConfigPartialData')
        .mockImplementation(() => {
          hasBeenCalled = true;
        });
      entitySourceController.get.mockResolvedValue({ id: 2 });

      await groupConfigController.updateDraft({ id: 2, draft: '' });
      expect(hasBeenCalled).toBeTruthy();
    });
  });
  describe('getDraft', () => {
    it('should return empty string when there is no groupConfig in DB', async () => {
      entitySourceController.get.mockResolvedValue(null);
      const result = await groupConfigController.getDraft(1);
      expect(result).toBe('');
    });
    it('should return empty string when there is no draft in groupConfig', async () => {
      entitySourceController.get.mockResolvedValue({ id: 1 });
      const result = await groupConfigController.getDraft(1);
      expect(result).toBe('');
    });
    it('should return draft', async () => {
      entitySourceController.get.mockResolvedValue({ id: 1, draft: '123' });
      const result = await groupConfigController.getDraft(1);
      expect(result).toEqual('123');
    });
  });

  describe('getDraftAttachmentItemIds', () => {
    it('should return empty array when there is no groupConfig in DB', async () => {
      entitySourceController.get.mockResolvedValue(null);
      const result = await groupConfigController.getDraftAttachmentItemIds(1);
      expect(result).toEqual([]);
    });

    it('should return empty array when there is no draft attachment_item_ids in groupConfig', async () => {
      entitySourceController.get.mockResolvedValue({ id: 1 });
      const result = await groupConfigController.getDraftAttachmentItemIds(1);
      expect(result).toEqual([]);
    });

    it('should return draft attachment_item_ids', async () => {
      entitySourceController.get.mockResolvedValue({
        id: 1,
        attachment_item_ids: [123],
      });
      const result = await groupConfigController.getDraftAttachmentItemIds(1);
      expect(result).toEqual([123]);
    });
  });

  describe('getGroupSendFailurePostIds', () => {
    it('should return failure post ids ', async () => {
      const mock = { id: 1, send_failure_post_ids: [12, 13] };
      entitySourceController.get.mockResolvedValue(mock);
      const result = await groupConfigController.getGroupSendFailurePostIds(1);
      expect(result).toEqual(mock.send_failure_post_ids);
    });

    it('should return empty array when object not found', async () => {
      entitySourceController.get.mockResolvedValue(null);
      const result = await groupConfigController.getGroupSendFailurePostIds(1);
      expect(result).toEqual([]);
    });

    it('should not modified the original value', async () => {
      const ids = [12, 13];
      const mock = { id: 1, send_failure_post_ids: ids };
      entitySourceController.get.mockResolvedValue(mock);
      const result = await groupConfigController.getGroupSendFailurePostIds(1);
      result.splice(1);
      expect(mock.send_failure_post_ids).toEqual(ids);
    });
  });

  describe('updateGroupSendFailurePostIds', () => {
    it('should call updateGroupConfigPartialData when there has local groupConfig', async () => {
      entitySourceController.get.mockResolvedValue({ id: 2 });
      groupConfigController.updateGroupConfigPartialData = jest.fn();
      await groupConfigController.updateGroupSendFailurePostIds({
        id: 2,
        send_failure_post_ids: [],
      });
      expect(
        groupConfigController.updateGroupConfigPartialData,
      ).toHaveBeenCalled();
    });
  });

  describe('saveAndDoNotify', () => {
    it('should call updateGroupConfigPartialData when there has local groupConfig', async () => {
      entitySourceController.get.mockResolvedValue(undefined);
      await groupConfigController.saveAndDoNotify({ id: 1, draft: '' });
      expect(entitySourceController.update).toHaveBeenCalled();
    });
    it('should call groupConfigDao.update where there is not local groupConfig', async () => {
      entitySourceController.get.mockResolvedValue(null);
      await groupConfigController.saveAndDoNotify({ id: 1, draft: '1' });
      expect(entitySourceController.update).toHaveBeenCalled();
    });
  });

  describe('updateMyLastPostTime', () => {
    const groupId = 123;
    const groupConfig = {
      id: groupId,
      my_last_post_time: 1,
    };

    it('should call update to set last post time', async () => {
      entitySourceController.update = jest.fn();
      entitySourceController.get = jest.fn().mockReturnValue(groupConfig);

      await groupConfigController.updateMyLastPostTime([
        {
          id: 1,
          created_at: 1111,
          creator_id: g_UserId,
          group_id: groupId,
        } as any,
      ]);
      expect(entitySourceController.bulkUpdate).toBeCalledWith([
        {
          id: groupId,
          my_last_post_time: 1111,
        },
      ]);
    });

    it('should not update last post time when is post is not newer', async () => {
      entitySourceController.update = jest.fn();
      entitySourceController.get = jest.fn().mockReturnValue(groupConfig);
      await groupConfigController.updateMyLastPostTime([
        {
          id: 1,
          created_at: 1111,
          creator_id: g_UserId + 1,
        } as any,
      ]);
      expect(entitySourceController.update).not.toHaveBeenCalled();
    });

    it('should not throw error when error happened', async () => {
      entitySourceController.bulkUpdate = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      entitySourceController.get = jest.fn().mockReturnValue(groupConfig);

      expect(
        groupConfigController.updateMyLastPostTime([
          {
            id: 1,
            created_at: 1111,
            creator_id: g_UserId,
          } as any,
        ]),
      ).resolves.not.toThrow();
      expect(entitySourceController.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePostIds', () => {
    it('should call updateGroupConfigPartialData when failed Ids has changed', async () => {
      jest
        .spyOn(groupConfigController, 'getGroupSendFailurePostIds')
        .mockResolvedValueOnce([1, 2, 3]);
      jest
        .spyOn(groupConfigController, 'updateGroupSendFailurePostIds')
        .mockResolvedValueOnce(true);

      await groupConfigController.deletePostIds(999, [1, 2]);
      expect(
        groupConfigController.updateGroupSendFailurePostIds,
      ).toHaveBeenCalledWith({
        id: 999,
        send_failure_post_ids: [3],
      });
    });
    it('should not call updateGroupConfigPartialData when postIds is empty', async () => {
      jest
        .spyOn(groupConfigController, 'getGroupSendFailurePostIds')
        .mockResolvedValueOnce([1, 2, 3]);
      jest
        .spyOn(groupConfigController, 'updateGroupSendFailurePostIds')
        .mockResolvedValueOnce(true);

      await groupConfigController.deletePostIds(999, []);
      expect(
        groupConfigController.updateGroupSendFailurePostIds,
      ).not.toHaveBeenCalled();
    });
    it('should not call updateGroupConfigPartialData when failIds is empty', async () => {
      jest
        .spyOn(groupConfigController, 'getGroupSendFailurePostIds')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(groupConfigController, 'updateGroupSendFailurePostIds')
        .mockResolvedValueOnce(true);

      await groupConfigController.deletePostIds(999, [1, 2]);
      expect(
        groupConfigController.updateGroupSendFailurePostIds,
      ).not.toHaveBeenCalled();
    });
    it('should not call updateGroupConfigPartialData when failed Ids has not changed', async () => {
      jest
        .spyOn(groupConfigController, 'getGroupSendFailurePostIds')
        .mockResolvedValueOnce([1, 2]);
      jest
        .spyOn(groupConfigController, 'updateGroupSendFailurePostIds')
        .mockResolvedValueOnce(true);

      await groupConfigController.deletePostIds(999, [3, 4]);
      expect(
        groupConfigController.updateGroupSendFailurePostIds,
      ).not.toHaveBeenCalled();
    });
  });

  describe('hasMoreRemotePost', () => {
    it('has more because of this object does not exit', async () => {
      entitySourceController.getEntityLocally.mockResolvedValueOnce(undefined);
      const hasMoreRemotePost = await groupConfigController.hasMorePostInRemote(
        123,
      );
      expect(hasMoreRemotePost).toEqual(getMockHasMore({}));
    });

    it('has more because of has_more does not exit', async () => {
      const mock = {
        id: 123,
      };
      entitySourceController.getEntityLocally.mockResolvedValueOnce(mock);
      const hasMoreRemotePost = await groupConfigController.hasMorePostInRemote(
        123,
      );
      expect(hasMoreRemotePost).toEqual(getMockHasMore({}));
    });

    it('has more because of has_more is true', async () => {
      const mock = {
        id: 123,
        has_more_older: true,
      };
      entitySourceController.getEntityLocally.mockResolvedValueOnce(mock);
      const hasMoreRemotePost = await groupConfigController.hasMorePostInRemote(
        123,
      );
      expect(hasMoreRemotePost).toEqual(getMockHasMore({}));
    });

    it('does not has more because of has_more is false', async () => {
      const mock = {
        id: 123,
        has_more_older: false,
      };
      entitySourceController.getEntityLocally.mockResolvedValueOnce(mock);
      const hasMoreRemotePost = await groupConfigController.hasMorePostInRemote(
        123,
      );
      expect(hasMoreRemotePost).toEqual(
        getMockHasMore({ older: false, both: false }),
      );
    });
  });

  describe('clearDraftFlagIfNotReallyExisted', () => {
    it('should do nothing when group config is not exits', async () => {
      entitySourceController.getEntityLocally.mockResolvedValueOnce(null);
      const getEntitiesLocally = jest.fn();
      itemService.getEntitySource = jest.fn().mockReturnValueOnce({ getEntitiesLocally })
      await groupConfigController.clearDraftFlagIfNotReallyExisted(4932943878);
      expect(getEntitiesLocally).not.toHaveBeenCalled();
    });
    it('should do nothing when there is not attachment item ids', async () => {
      entitySourceController.getEntityLocally.mockResolvedValueOnce({});
      const getEntitiesLocally = jest.fn().mockReturnValueOnce({});
      itemService.getEntitySource = jest.fn().mockReturnValueOnce({ getEntitiesLocally })
      await groupConfigController.clearDraftFlagIfNotReallyExisted(4932943878);
      expect(getEntitiesLocally).not.toHaveBeenCalled();
    });
    it('should do nothing when attachment item ids are all existed in items', async () => {
      jest.spyOn(groupConfigController, 'updateDraft').mockResolvedValueOnce('');
      entitySourceController.getEntityLocally.mockResolvedValueOnce({ attachment_item_ids: [1] });
      const getEntitiesLocally = jest.fn().mockReturnValueOnce([{ id: 1 }]);
      itemService.getEntitySource = jest.fn().mockReturnValueOnce({ getEntitiesLocally })
      await groupConfigController.clearDraftFlagIfNotReallyExisted(4932943878);
      expect(getEntitiesLocally).toHaveBeenCalledWith([1], true);
      expect(groupConfigController.updateDraft).not.toHaveBeenCalled();
    });
    it('should remove the extract ids when they not in items', async () => {
      jest.spyOn(groupConfigController, 'updateDraft').mockResolvedValueOnce('');
      entitySourceController.getEntityLocally.mockResolvedValueOnce({ attachment_item_ids: [1, 2] });
      const getEntitiesLocally = jest.fn().mockReturnValueOnce([{ id: 1 }]);
      itemService.getEntitySource = jest.fn().mockReturnValueOnce({ getEntitiesLocally })
      await groupConfigController.clearDraftFlagIfNotReallyExisted(4932943878);
      expect(getEntitiesLocally).toHaveBeenCalledWith([1, 2], true);
      expect(groupConfigController.updateDraft).toHaveBeenCalledWith({ id: 4932943878, attachment_item_ids: [1] });
    });
    it('should catch when some errors happen', async () => {
      jest.spyOn(groupConfigController, 'updateDraft').mockResolvedValueOnce('');
      entitySourceController.getEntityLocally.mockResolvedValueOnce({ attachment_item_ids: [1, 2] });
      const getEntitiesLocally = jest.fn().mockRejectedValue(null);
      itemService.getEntitySource = jest.fn().mockReturnValueOnce({ getEntitiesLocally })
      await groupConfigController.clearDraftFlagIfNotReallyExisted(4932943878);
      expect(getEntitiesLocally).toHaveBeenCalledWith([1, 2], true);
      expect(groupConfigController.updateDraft).not.toHaveBeenCalled();
    });
  })
});
