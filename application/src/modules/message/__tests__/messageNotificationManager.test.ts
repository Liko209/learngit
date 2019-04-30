/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { ServiceConfig } from 'sdk/module/serviceLoader';
import * as utils from '@/store/utils';
import { MessageNotificationManager } from '../MessageNotificationManager';
import { ServiceLoader } from 'sdk/module/serviceLoader';
describe('messageNotificationManager', () => {
  let notificationManager: MessageNotificationManager;
  const currentUserId = 110;
  const otherUserId = 111;
  const localPost = {
    id: -100,
  };
  const mockedPost = {
    id: 0,
    creator_id: currentUserId,
  };
  const mockedDeletedPost = {
    id: 1,
    deactivated: true,
  };
  const postFromGroup = {
    id: 4,
    group_id: 0,
  };
  const postFromTeam = {
    id: 2,
    group_id: 1,
  };
  const postFromWithMentionOthers = {
    id: 3,
    group_id: 1,
    at_mention_non_item_ids: [otherUserId],
  };
  const postFromWithMentionMe = {
    id: 4,
    group_id: 1,
    at_mention_non_item_ids: [currentUserId],
  };
  const team = {
    id: 1,
    is_team: true,
  };
  const group = {
    id: 0,
    is_team: false,
  };
  const mockedPostService = {
    getById: async (i: number) => {
      return {
        '-100': localPost,
        0: mockedPost,
        1: mockedDeletedPost,
        2: postFromTeam,
        3: postFromWithMentionOthers,
        4: postFromWithMentionMe,
      }[i];
    },
  };

  const mockedGroupService = {
    getById: async (i: number) => {
      return { 1: team, 0: group }[i];
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
    notificationManager = new MessageNotificationManager();
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(currentUserId);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation(type => {
      switch (type) {
        case ServiceConfig.POST_SERVICE:
          return mockedPostService;
        case ServiceConfig.GROUP_SERVICE:
          return mockedGroupService;
        default:
          return {};
      }
    });
  });
  describe('shouldEmitNotification()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(notificationManager, 'show').mockImplementation();
    });
    it('should not show notification when post is local', async () => {
      const result = await notificationManager.shouldEmitNotification(
        localPost,
      );
      expect(result).toBeFalsy();
    });
    it('should not show notification when post is deleted', async () => {
      const result = await notificationManager.shouldEmitNotification(
        mockedDeletedPost,
      );
      expect(result).toBeFalsy();
    });
    it('should not show notification when post is created by user', async () => {
      const result = await notificationManager.shouldEmitNotification(
        mockedPost,
      );
      expect(result).toBeFalsy();
    });
    it('should not show notification when post is from team with no @mention', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postFromTeam,
      );
      expect(result).toBeFalsy();
    });
    it('should not show notification when post is from team with @mention other users', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postFromWithMentionOthers,
      );
      expect(result).toBeFalsy();
    });
    it('should  show notification when post is from group', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postFromGroup,
      );
      expect(result).toBeTruthy();
    });
    it('should  show notification when post is from team and with current user @mentioned', async () => {
      const result = await notificationManager.shouldEmitNotification(
        postFromWithMentionMe,
      );
      expect(result).toBeTruthy();
    });
  });
  describe('handleDeletedPost()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(notificationManager, 'close').mockImplementation();
    });
    it('should close notification if exists when post is deleted', async () => {
      await notificationManager.handlePostEntityChanged([mockedDeletedPost]);
      expect(notificationManager.close).toBeCalledWith(mockedDeletedPost.id);
    });
  });
});
