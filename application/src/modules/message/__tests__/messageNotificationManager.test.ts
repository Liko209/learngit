/*
 * @Author: Andy Hu (andy.hu@ringcentral.com)
 * @Date: 2019-01-17 15:16:45
 * Copyright Â© RingCentral. All rights reserved.
 */
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import * as utils from '@/store/utils';
import { MessageNotificationManager } from '../MessageNotificationManager';
import * as VM from '../MessageNotificationViewModel';
import GroupModel from '@/store/models/Group';
import PostModel from '../../../store/models/Post';
import { DESKTOP_MESSAGE_NOTIFICATION_OPTIONS } from 'sdk/module/profile';

jest.mock('sdk/module/config');
jest.mock('sdk/module/account/config/AccountUserConfig');
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
    const userId = 123432;
    jest.clearAllMocks();
    notificationManager = new MessageNotificationManager();
    jest.spyOn(utils, 'getGlobalValue').mockReturnValue(currentUserId);
    jest.spyOn(ServiceLoader, 'getInstance').mockImplementation((type) => {
      switch (type) {
        case ServiceConfig.POST_SERVICE:
          return mockedPostService;
        case ServiceConfig.GROUP_SERVICE:
          return mockedGroupService;
        default:
          return { userConfig:{ getGlipUserId: () => userId }};
      }
    });
  });
  describe('shouldEmitNotification()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(utils, 'getEntity').mockReturnValue({
        value: DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.ALL_MESSAGE,
      });
      jest.spyOn(notificationManager, 'show').mockImplementation();
    });

    it('should show notification when post is from group', async () => {
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
    describe('when notification settings turned to off', () => {
      beforeEach(() => {
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF);
      });
      it('should not show notification when post is from group', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromGroup,
        );
        expect(result).toBeFalsy();
      });
    });
    describe('when notification settings turned to @mention and direct message only', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.OFF);
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
    });
    describe('when notification settings turned to @mention and direct message only', () => {
      beforeEach(() => {
        jest.clearAllMocks();
        jest
          .spyOn(utils, 'getEntity')
          .mockReturnValue(DESKTOP_MESSAGE_NOTIFICATION_OPTIONS.DM_AND_MENTION);
      });
      it('should show notification when post is from team with no @mention', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromTeam,
        );
        expect(result).toBeFalsy();
      });
      it('should show notification when post is from team with @mention other users', async () => {
        const result = await notificationManager.shouldEmitNotification(
          postFromWithMentionOthers,
        );
        expect(result).toBeFalsy();
      });
    });
  });
  describe('enqueueVm()', () => {
    let manager;
    const crushVmIntoManager = (times: number) => {
      [...Array(times)].forEach(() => {
        notificationManager.enqueueVM({} as PostModel, {} as GroupModel);
      });
    };

    beforeEach(() => {
      notificationManager.close = jest.fn();
      jest
        .spyOn(VM, 'MessageNotificationViewModel')
        .mockImplementation(function(
          _: number,
          hooks: { onDispose: Function },
        ) {
          return {
            dispose: hooks.onDispose,
          };
        });
    });
    it('should enqueue the vm into the vmQueue when called', () => {
      crushVmIntoManager(1);
      expect(notificationManager._vmQueue.length).toEqual(1);
    });
    it('should cut off vmQueue when exceeds', () => {
      crushVmIntoManager(51);
      expect(notificationManager._vmQueue.length).toEqual(50);
    });
    it('should remove the vm from vmQueue when disposed', () => {
      notificationManager._vmQueue = [];
      crushVmIntoManager(1);
      notificationManager._vmQueue[0].vm.dispose();
      expect(notificationManager._vmQueue.length).toEqual(0);
    });
  });
});
