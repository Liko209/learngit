/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-27 11:15:14
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfigController } from '../GroupConfigController';

const entitySourceController = {
  get: jest.fn(),
  update: jest.fn(),
  bulkUpdate: jest.fn(),
  getEntityNotificationKey: jest.fn(),
};

describe('GroupConfigService', () => {
  const groupConfigController: GroupConfigController = new GroupConfigController(
    undefined,
  );
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(groupConfigController, { entitySourceController });
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
      expect(entitySourceController.bulkUpdate).toBeCalledWith([mock2]);
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
  });

  describe('updateGroupSendFailurePostIds', () => {
    it('should call updateGroupConfigPartialData when there has local groupConfig', async () => {
      entitySourceController.get.mockResolvedValue({ id: 2 });

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

  describe('recordMyLastPostTime', () => {
    it('should call update to set last post time', async () => {
      entitySourceController.update = jest.fn();
      await groupConfigController.recordMyLastPostTime(1, 1111);
      expect(entitySourceController.update).toBeCalledWith({
        id: 1,
        my_last_post_time: 1111,
      });
    });

    it('should not throw error when error happened', async () => {
      entitySourceController.update = jest.fn().mockImplementation(() => {
        throw new Error();
      });
      expect(
        groupConfigController.recordMyLastPostTime(1, 1111),
      ).resolves.not.toThrow();
      expect(entitySourceController.update).toHaveBeenCalled();
    });
  });
});
