/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-26 14:17:09
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupConfigService } from '../GroupConfigService';
import { GroupConfigController } from '../../controller/GroupConfigController';

jest.mock('../../controller/GroupConfigController');

describe('GroupConfigService', () => {
  const groupConfigService: GroupConfigService = new GroupConfigService();
  const groupConfigController = new GroupConfigController(null as any);
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(groupConfigService, {
      _groupConfigController: groupConfigController,
    });
  });
  describe('updateGroupConfigPartialData', () => {
    it('should call with correct parameter', async () => {
      const mock = {
        id: 2,
        draft: 'draft',
      };
      await groupConfigService.updateGroupConfigPartialData(mock);
      expect(groupConfigController.updateGroupConfigPartialData).toBeCalledWith(
        mock,
      );
    });
  });
  describe('updateDraft', () => {
    it('should call with correct parameter', async () => {
      await groupConfigService.updateDraft({ id: 2, draft: '' });
      expect(groupConfigController.updateDraft).toBeCalledWith({
        id: 2,
        draft: '',
      });
    });
  });
  describe('getDraft', () => {
    it('should return correct', async () => {
      groupConfigController.getDraft.mockResolvedValue('123');
      const result = await groupConfigService.getDraft(1);
      expect(result).toBe('123');
    });
  });

  describe('getDraftAttachmentItemIds', () => {
    it('should return correct', async () => {
      groupConfigController.getDraftAttachmentItemIds.mockResolvedValue([
        1,
        2,
        3,
      ]);
      const result = await groupConfigService.getDraftAttachmentItemIds(1);

      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('getGroupSendFailurePostIds', () => {
    it('should return failure post ids ', async () => {
      const mock = { id: 1, send_failure_post_ids: [12, 13] };
      groupConfigController.getGroupSendFailurePostIds.mockResolvedValue(
        mock.send_failure_post_ids,
      );
      const result = await groupConfigService.getGroupSendFailurePostIds(1);

      expect(result).toEqual(mock.send_failure_post_ids);
    });
  });

  describe('updateGroupSendFailurePostIds', () => {
    it('should update with correct parameter', async () => {
      await groupConfigService.updateGroupSendFailurePostIds({
        id: 2,
        send_failure_post_ids: [],
      });

      expect(
        groupConfigController.updateGroupSendFailurePostIds,
      ).toBeCalledWith({
        id: 2,
        send_failure_post_ids: [],
      });
    });
  });

  describe('saveAndDoNotify', () => {
    it('should call with correct parameter', async () => {
      await groupConfigService.saveAndDoNotify({ id: 1, draft: '' });
      expect(groupConfigController.saveAndDoNotify).toBeCalledWith({
        id: 1,
        draft: '',
      });
    });
  });

  describe('updateMyLastPostTime', () => {
    it('should call with correct parameter', async () => {
      await groupConfigService.updateMyLastPostTime(1, { id: 1111 });
      expect(groupConfigController.updateMyLastPostTime).toBeCalledWith(1, {
        id: 1111,
      });
    });
  });
});
